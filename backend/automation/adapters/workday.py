"""Workday ATS adapter for automating job applications."""

from pathlib import Path

from playwright.async_api import Page

from automation.base_adapter import BaseATSAdapter


class WorkdayAdapter(BaseATSAdapter):
    async def detect(self, url: str, page: Page) -> bool:
        return "myworkdayjobs.com" in url.lower() or "workday" in url.lower()

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

        # TODO: Workday-specific form filling logic
        self.log_action("fill_fields", status="not_implemented")

        return self.log

    async def submit(self, page: Page) -> bool:
        # TODO: click Workday submit button
        return False
