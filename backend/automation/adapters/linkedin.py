from __future__ import annotations

"""LinkedIn Easy Apply adapter for automating job applications.

LinkedIn requires authentication. This adapter handles the Easy Apply modal
overlay flow including multi-step navigation.
"""

import logging
from pathlib import Path

from playwright.async_api import Page

from automation.base_adapter import BaseATSAdapter
from automation.utils.selectors import LINKEDIN_SELECTORS

logger = logging.getLogger(__name__)


class LinkedInAdapter(BaseATSAdapter):
    async def detect(self, url: str, page: Page) -> bool:
        return "linkedin.com/jobs" in url.lower()

    async def fill(
        self,
        page: Page,
        url: str,
        user_data: dict,
        resume_path: Path,
        cover_letter: str | None = None,
        form_answers: dict | None = None,
    ) -> list[dict]:
        self.log_action("navigate", url=url)
        await page.goto(url, wait_until="domcontentloaded")
        await page.wait_for_timeout(3000)

        # Detect login wall
        if await self._is_login_required(page):
            logger.warning("LinkedIn login wall detected — authentication required")
            self.log_action(
                "login_wall",
                success=False,
                detail="LinkedIn requires authentication. Cannot proceed without login.",
            )
            return self.log

        # Click "Easy Apply" button to open the modal
        easy_apply_clicked = await self._click_easy_apply(page)
        if not easy_apply_clicked:
            self.log_action("click_easy_apply", success=False, detail="Easy Apply button not found")
            return self.log

        # Handle multi-step modal
        max_steps = 10
        for step in range(max_steps):
            await page.wait_for_timeout(1500)

            # Check if we've reached the submit step
            if await self._is_review_step(page):
                self.log_action("reached_review_step", step=step + 1)
                break

            # Upload resume if file input is present
            if resume_path and Path(resume_path).exists():
                await self._try_upload_resume(page, resume_path)

            # Fill phone number
            phone = user_data.get("phone", "")
            if phone:
                await self._fill_phone(page, phone)

            # Fill additional question fields
            if form_answers:
                await self._fill_modal_questions(page, form_answers)

            # Also fill any text inputs by common field heuristics
            await self._fill_common_fields(page, user_data)

            # Click Next to advance the modal
            advanced = await self._click_next_step(page)
            if not advanced:
                self.log_action("modal_navigation_stalled", step=step + 1)
                break
            self.log_action("click_next_step", step=step + 1, success=True)

        return self.log

    async def submit(self, page: Page) -> bool:
        """Click 'Submit application' in the Easy Apply modal."""
        try:
            submit_btn = page.locator(LINKEDIN_SELECTORS["submit"]).first
            if await submit_btn.is_visible(timeout=3000):
                await submit_btn.click(timeout=3000)
                await page.wait_for_timeout(2000)
                self.log_action("submit", success=True)

                # Dismiss the post-submit confirmation if present
                await self._dismiss_confirmation(page)
                return True
        except Exception:
            pass

        # Fallback: try Review then Submit
        try:
            review_btn = page.locator(LINKEDIN_SELECTORS["review"]).first
            if await review_btn.is_visible(timeout=2000):
                await review_btn.click(timeout=3000)
                await page.wait_for_timeout(1500)
                submit_btn = page.locator(LINKEDIN_SELECTORS["submit"]).first
                if await submit_btn.is_visible(timeout=3000):
                    await submit_btn.click(timeout=3000)
                    await page.wait_for_timeout(2000)
                    self.log_action("submit", method="review_then_submit", success=True)
                    await self._dismiss_confirmation(page)
                    return True
        except Exception:
            pass

        self.log_action("submit", success=False, error="Submit button not found")
        return False

    async def _is_login_required(self, page: Page) -> bool:
        """Detect if LinkedIn is showing a login wall."""
        try:
            login_form = page.locator(
                'form.login__form, input[id="session_key"], '
                'button:has-text("Sign in")'
            ).first
            return await login_form.is_visible(timeout=2000)
        except Exception:
            return False

    async def _click_easy_apply(self, page: Page) -> bool:
        """Click the Easy Apply button to open the application modal."""
        try:
            btn = page.locator(LINKEDIN_SELECTORS["easy_apply"]).first
            if await btn.is_visible(timeout=5000):
                await btn.click(timeout=3000)
                await page.wait_for_timeout(2000)
                self.log_action("click_easy_apply", success=True)
                return True
        except Exception:
            pass
        return False

    async def _try_upload_resume(self, page: Page, resume_path: Path) -> None:
        """Upload resume in the Easy Apply modal."""
        try:
            file_input = page.locator(LINKEDIN_SELECTORS["resume"]).first
            count = await page.locator(LINKEDIN_SELECTORS["resume"]).count()
            if count > 0:
                await file_input.set_input_files(str(resume_path), timeout=5000)
                self.log_action("upload_resume", success=True)
        except Exception:
            pass

    async def _fill_phone(self, page: Page, phone: str) -> None:
        """Fill the phone number field in the modal."""
        try:
            phone_input = page.locator(LINKEDIN_SELECTORS["phone"]).first
            if await phone_input.is_visible(timeout=1000):
                current_val = await phone_input.input_value()
                if not current_val.strip():
                    await phone_input.fill(phone, timeout=2000)
                    self.log_action("fill_field", field="phone", success=True)
        except Exception:
            pass

    async def _fill_common_fields(self, page: Page, user_data: dict) -> None:
        """Fill common text fields by label/name heuristics within the modal."""
        field_patterns = {
            "first_name": ["firstName", "first_name", "fname"],
            "last_name": ["lastName", "last_name", "lname"],
            "email": ["email"],
            "city": ["city", "location"],
            "linkedin": ["linkedin", "linkedInUrl"],
        }
        for field_key, patterns in field_patterns.items():
            value = user_data.get(field_key, "")
            if not value:
                continue
            for pattern in patterns:
                try:
                    el = page.locator(
                        f'input[id*="{pattern}" i], input[name*="{pattern}" i]'
                    ).first
                    if await el.is_visible(timeout=500):
                        current = await el.input_value()
                        if not current.strip():
                            await el.fill(value, timeout=2000)
                            self.log_action("fill_field", field=field_key, success=True)
                        break
                except Exception:
                    continue

    async def _fill_modal_questions(self, page: Page, form_answers: dict) -> None:
        """Fill additional question fields in the Easy Apply modal."""
        for question_key, answer in form_answers.items():
            # Try text input
            for attr in ["id", "name"]:
                try:
                    el = page.locator(f'input[{attr}*="{question_key}" i]').first
                    if await el.is_visible(timeout=500):
                        await el.fill(str(answer), timeout=2000)
                        self.log_action("fill_custom", field=question_key, type="input", success=True)
                        break
                except Exception:
                    continue
            else:
                # Try select dropdown
                try:
                    sel = page.locator(f'select[id*="{question_key}" i], select[name*="{question_key}" i]').first
                    if await sel.is_visible(timeout=500):
                        try:
                            await sel.select_option(label=str(answer), timeout=2000)
                        except Exception:
                            await sel.select_option(value=str(answer), timeout=2000)
                        self.log_action("fill_custom", field=question_key, type="select", success=True)
                except Exception:
                    pass

    async def _click_next_step(self, page: Page) -> bool:
        """Click Next/Continue to advance the Easy Apply modal."""
        for selector in [LINKEDIN_SELECTORS["next"], LINKEDIN_SELECTORS["review"]]:
            try:
                btn = page.locator(selector).first
                if await btn.is_visible(timeout=2000):
                    await btn.click(timeout=3000)
                    return True
            except Exception:
                continue
        return False

    async def _is_review_step(self, page: Page) -> bool:
        """Check if we've reached the review/submit step."""
        try:
            submit_btn = page.locator(LINKEDIN_SELECTORS["submit"]).first
            return await submit_btn.is_visible(timeout=1000)
        except Exception:
            return False

    async def _dismiss_confirmation(self, page: Page) -> None:
        """Dismiss the post-submission confirmation/done dialog."""
        for sel_key in ("done", "dismiss"):
            try:
                btn = page.locator(LINKEDIN_SELECTORS[sel_key]).first
                if await btn.is_visible(timeout=2000):
                    await btn.click(timeout=2000)
                    self.log_action("dismiss_confirmation", button=sel_key, success=True)
                    return
            except Exception:
                continue
