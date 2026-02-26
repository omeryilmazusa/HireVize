from __future__ import annotations

"""Greenhouse ATS adapter for automating job applications."""

from pathlib import Path

from playwright.async_api import Page

from automation.base_adapter import BaseATSAdapter


class GreenhouseAdapter(BaseATSAdapter):
    async def detect(self, url: str, page: Page) -> bool:
        return "greenhouse.io" in url.lower() or "boards.greenhouse" in url.lower()

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

        # TODO: Greenhouse-specific form filling logic
        # Common fields: first_name, last_name, email, phone, resume, cover_letter
        self.log_action("fill_fields", status="not_implemented")

        return self.log

    async def submit(self, page: Page) -> bool:
        # TODO: click Greenhouse submit button
        return False
