"""Auto-apply service: navigates to job URLs, fills forms, and submits applications."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from pathlib import Path

from playwright.async_api import async_playwright
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import settings
from app.models.application import Application
from app.models.resume import Resume
from app.utils.file_storage import get_file_path
from automation.base_adapter import get_adapter
from automation.utils.cookies import dismiss_cookie_banner

logger = logging.getLogger(__name__)

SUCCESS_PATTERNS = [
    "thank you",
    "thanks for applying",
    "application received",
    "application submitted",
    "successfully submitted",
    "application has been submitted",
    "we have received your application",
    "you have successfully applied",
]


async def auto_apply(application_id, db: AsyncSession) -> Application:
    """Orchestrate the full auto-apply flow for a given application.

    1. Load Application -> Job -> User -> primary Resume from DB
    2. Detect ATS platform and get the appropriate adapter
    3. Launch headless Playwright, navigate to application URL
    4. Dismiss cookie banners
    5. Delegate form filling to adapter.fill()
    6. Delegate submission to adapter.submit()
    7. Multi-step loop with success detection
    8. Update application status and automation_log
    """
    # Load application with relationships
    result = await db.execute(
        select(Application)
        .options(selectinload(Application.job), selectinload(Application.user))
        .where(Application.id == application_id)
    )
    application = result.scalar_one_or_none()
    if not application:
        raise ValueError(f"Application {application_id} not found")

    job = application.job
    user = application.user
    if not job or not (job.application_url or job.source_url):
        raise ValueError("Application has no associated job URL")

    # Find primary resume
    resume_result = await db.execute(
        select(Resume)
        .where(Resume.user_id == user.id, Resume.is_primary.is_(True))
        .limit(1)
    )
    resume = resume_result.scalar_one_or_none()
    # Fallback to any resume
    if not resume:
        resume_result = await db.execute(
            select(Resume)
            .where(Resume.user_id == user.id)
            .order_by(Resume.created_at.desc())
            .limit(1)
        )
        resume = resume_result.scalar_one_or_none()

    resume_abs_path = get_file_path(resume.file_path) if resume else None

    # Build user data dict for form filling
    address = (user.addresses or [{}])[0] if user.addresses else {}
    phone = (user.phones or [""])[0] if user.phones else ""
    eeo = user.eeo or {}
    veteran = user.veteran_status or {}
    disability = user.disability_status or {}

    user_data = {
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "phone": phone if isinstance(phone, str) else phone.get("number", ""),
        "street": address.get("street", ""),
        "city": address.get("city", ""),
        "state": address.get("state", ""),
        "zip": address.get("zip", ""),
        "linkedin": user.linkedin_url or "",
        "portfolio": user.portfolio_url or "",
        "gender": eeo.get("gender", ""),
        "race": eeo.get("race", ""),
        "veteran": veteran.get("status", ""),
        "disability": disability.get("status", ""),
        "sponsorship": (user.candidate_answers or {}).get("sponsorship", ""),
        "age_18": (user.candidate_answers or {}).get("age_18", ""),
    }

    url = job.application_url or job.source_url

    # Determine ATS platform and get adapter
    ats_platform = getattr(job, "ats_platform", None) or "unknown"
    if ats_platform == "unknown":
        from app.services.job_scraper import detect_ats_platform
        ats_platform = detect_ats_platform(url, "")

    adapter = get_adapter(ats_platform)
    logger.info("Auto-apply using %s adapter for %s", type(adapter).__name__, url)

    # Mark as submitting
    application.status = "submitting"
    await db.commit()

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=settings.playwright_headless, slow_mo=500)
            context = await browser.new_context(
                user_agent=(
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/125.0.0.0 Safari/537.36"
                ),
            )
            page = await context.new_page()

            # Step 1: Dismiss cookie banner after initial navigation
            await page.goto(url, wait_until="domcontentloaded", timeout=30000)
            await page.wait_for_timeout(2000)
            await dismiss_cookie_banner(page)

            # Step 2: Delegate form filling to adapter
            form_answers = (user.candidate_answers or {}).get("form_answers", {})
            adapter.log_action("adapter", name=type(adapter).__name__, platform=ats_platform)
            await adapter.fill(
                page=page,
                url=url,
                user_data=user_data,
                resume_path=resume_abs_path or Path(""),
                cover_letter=application.cover_letter_text if hasattr(application, "cover_letter_text") else None,
                form_answers=form_answers if form_answers else None,
            )

            # Step 3: Multi-step loop — keep trying submit + success detection
            success = False
            for iteration in range(10):
                # Check for success
                body_text = await page.inner_text("body")
                if _is_success_page(body_text):
                    adapter.log_action("detect_success", detail="Application submitted successfully")
                    success = True
                    break

                # Attempt submission
                submitted = await adapter.submit(page)
                if submitted:
                    await page.wait_for_timeout(3000)
                    body_text = await page.inner_text("body")
                    if _is_success_page(body_text):
                        adapter.log_action("detect_success", detail="Application submitted successfully")
                        success = True
                        break
                else:
                    # No submit button found — nothing more we can do
                    break

            # Final success check
            if not success:
                body_text = await page.inner_text("body")
                if _is_success_page(body_text):
                    adapter.log_action("detect_success", detail="Application submitted successfully")
                    success = True

            await browser.close()

        # Update application
        application.automation_log = {"entries": adapter.log}
        if success:
            application.status = "submitted"
            application.submitted_at = datetime.now(timezone.utc)
            application.error_message = None
        else:
            application.status = "failed"
            application.error_message = "Could not confirm submission — review automation log"

        await db.commit()
        await db.refresh(application)
        return application

    except Exception as exc:
        logger.exception("Auto-apply failed for application %s", application_id)
        application.automation_log = {"entries": adapter.log}
        application.status = "failed"
        application.error_message = str(exc)
        await db.commit()
        await db.refresh(application)
        return application


def _is_success_page(body_text: str) -> bool:
    """Check if the page body contains success/thank-you patterns."""
    lower = body_text.lower()
    return any(pattern in lower for pattern in SUCCESS_PATTERNS)
