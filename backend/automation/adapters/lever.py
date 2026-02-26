from __future__ import annotations

"""Lever ATS adapter for automating job applications."""

from pathlib import Path

from playwright.async_api import Page

from automation.base_adapter import BaseATSAdapter


class LeverAdapter(BaseATSAdapter):
    async def detect(self, url: str, page: Page) -> bool:
        return "lever.co" in url.lower() or "jobs.lever" in url.lower()

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

        # TODO: Lever-specific form filling logic
        self.log_action("fill_fields", status="not_implemented")

        return self.log

    async def submit(self, page: Page) -> bool:
        # TODO: click Lever submit button
        return False
