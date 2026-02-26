"""Playwright form automation service: fills and submits job application forms."""

from pathlib import Path

from playwright.async_api import Page


async def fill_and_submit(
    page: Page,
    application_url: str,
    ats_platform: str,
    user_data: dict,
    resume_path: Path,
    cover_letter: str | None = None,
    form_answers: dict | None = None,
) -> list[dict]:
    """Fill out a job application form and return an action log.

    Args:
        page: Playwright page instance
        application_url: URL of the application form
        ats_platform: detected ATS (greenhouse, lever, workday, unknown)
        user_data: dict with name, email, phone, linkedin_url, portfolio_url
        resume_path: path to the resume PDF to upload
        cover_letter: optional cover letter text
        form_answers: optional dict of additional form field answers

    Returns:
        List of action log entries: [{step, action, details, timestamp, success}]
    """
    from app.automation.base_adapter import get_adapter

    adapter = get_adapter(ats_platform)
    return await adapter.fill(page, application_url, user_data, resume_path, cover_letter, form_answers)
