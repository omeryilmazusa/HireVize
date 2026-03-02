from __future__ import annotations

"""Greenhouse ATS adapter for automating job applications."""

import logging
from pathlib import Path

from playwright.async_api import Page

from automation.base_adapter import BaseATSAdapter
from automation.utils.selectors import GREENHOUSE_SELECTORS

logger = logging.getLogger(__name__)


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
        await page.wait_for_timeout(2000)

        # Fill standard Greenhouse fields by ID
        field_map = {
            "first_name": user_data.get("first_name", ""),
            "last_name": user_data.get("last_name", ""),
            "email": user_data.get("email", ""),
            "phone": user_data.get("phone", ""),
        }
        for field_key, value in field_map.items():
            if not value:
                continue
            selector = GREENHOUSE_SELECTORS.get(field_key)
            if not selector:
                continue
            try:
                el = page.locator(selector).first
                if await el.is_visible(timeout=1000):
                    await el.fill(value, timeout=2000)
                    self.log_action("fill_field", field=field_key, success=True)
            except Exception:
                self.log_action("fill_field", field=field_key, success=False)

        # Fill LinkedIn / portfolio fields by name/id heuristic
        url_fields = {
            "linkedin": user_data.get("linkedin", ""),
            "portfolio": user_data.get("portfolio", ""),
        }
        for field_key, value in url_fields.items():
            if not value:
                continue
            filled = await self._try_fill_by_attr(page, field_key, value)
            self.log_action("fill_field", field=field_key, success=filled)

        # Upload resume
        if resume_path and Path(resume_path).exists():
            try:
                file_input = page.locator(GREENHOUSE_SELECTORS["resume"]).first
                await file_input.set_input_files(str(resume_path), timeout=5000)
                self.log_action("upload_resume", success=True)
            except Exception:
                self.log_action("upload_resume", success=False)

        # Fill cover letter textarea if present
        if cover_letter:
            try:
                textarea = page.locator(
                    'textarea[name*="cover"], textarea[id*="cover"], '
                    'textarea[name*="Cover"], textarea[id*="Cover"]'
                ).first
                if await textarea.is_visible(timeout=1000):
                    await textarea.fill(cover_letter, timeout=3000)
                    self.log_action("fill_cover_letter", success=True)
            except Exception:
                self.log_action("fill_cover_letter", success=False)

        # Handle custom questions via form_answers
        if form_answers:
            await self._fill_custom_questions(page, form_answers)

        return self.log

    async def submit(self, page: Page) -> bool:
        selector = GREENHOUSE_SELECTORS["submit"]
        for sel in selector.split(", "):
            try:
                btn = page.locator(sel).first
                if await btn.is_visible(timeout=2000):
                    await btn.click(timeout=3000)
                    self.log_action("submit", selector=sel, success=True)
                    return True
            except Exception:
                continue
        self.log_action("submit", success=False, error="No submit button found")
        return False

    async def _try_fill_by_attr(self, page: Page, name: str, value: str) -> bool:
        """Fill an input matching by name or id attribute substring."""
        for attr in ["name", "id"]:
            selector = f'input[{attr}*="{name}" i]'
            try:
                el = page.locator(selector).first
                if await el.is_visible(timeout=500):
                    await el.fill(value, timeout=2000)
                    return True
            except Exception:
                continue
        return False

    async def _fill_custom_questions(self, page: Page, form_answers: dict) -> None:
        """Fill custom question fields using form_answers dict.

        Keys in form_answers are matched against field name/id/label text.
        """
        for question_key, answer in form_answers.items():
            # Try textarea
            try:
                ta = page.locator(
                    f'textarea[name*="{question_key}" i], textarea[id*="{question_key}" i]'
                ).first
                if await ta.is_visible(timeout=500):
                    await ta.fill(str(answer), timeout=2000)
                    self.log_action("fill_custom", field=question_key, type="textarea", success=True)
                    continue
            except Exception:
                pass

            # Try select dropdown
            try:
                sel = page.locator(
                    f'select[name*="{question_key}" i], select[id*="{question_key}" i]'
                ).first
                if await sel.is_visible(timeout=500):
                    try:
                        await sel.select_option(label=str(answer), timeout=2000)
                    except Exception:
                        await sel.select_option(value=str(answer), timeout=2000)
                    self.log_action("fill_custom", field=question_key, type="select", success=True)
                    continue
            except Exception:
                pass

            # Try text input
            filled = await self._try_fill_by_attr(page, question_key, str(answer))
            if filled:
                self.log_action("fill_custom", field=question_key, type="input", success=True)
