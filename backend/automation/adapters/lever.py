from __future__ import annotations

"""Lever ATS adapter for automating job applications."""

import logging
from pathlib import Path

from playwright.async_api import Page

from automation.base_adapter import BaseATSAdapter
from automation.utils.selectors import LEVER_SELECTORS

logger = logging.getLogger(__name__)


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
        await page.wait_for_timeout(2000)

        # Click "Apply for this job" link to open the application form
        try:
            apply_link = page.locator(
                'a:has-text("Apply for this job"), a.postings-btn'
            ).first
            if await apply_link.is_visible(timeout=3000):
                await apply_link.click(timeout=3000)
                await page.wait_for_timeout(2000)
                self.log_action("click_apply", success=True)
        except Exception:
            self.log_action("click_apply", success=False, detail="Apply link not found or already on form")

        # Lever uses a combined "name" field (first + last)
        full_name = f"{user_data.get('first_name', '')} {user_data.get('last_name', '')}".strip()
        if full_name:
            try:
                name_el = page.locator(LEVER_SELECTORS["name"]).first
                if await name_el.is_visible(timeout=1000):
                    await name_el.fill(full_name, timeout=2000)
                    self.log_action("fill_field", field="name", value=full_name, success=True)
            except Exception:
                self.log_action("fill_field", field="name", success=False)

        # Fill email and phone
        for field_key in ("email", "phone"):
            value = user_data.get(field_key, "")
            if not value:
                continue
            selector = LEVER_SELECTORS.get(field_key)
            if not selector:
                continue
            try:
                el = page.locator(selector).first
                if await el.is_visible(timeout=1000):
                    await el.fill(value, timeout=2000)
                    self.log_action("fill_field", field=field_key, success=True)
            except Exception:
                self.log_action("fill_field", field=field_key, success=False)

        # Upload resume
        if resume_path and Path(resume_path).exists():
            try:
                file_input = page.locator(LEVER_SELECTORS["resume"]).first
                await file_input.set_input_files(str(resume_path), timeout=5000)
                self.log_action("upload_resume", success=True)
            except Exception:
                self.log_action("upload_resume", success=False)

        # Fill LinkedIn, portfolio, and website URLs
        url_fields = {
            "linkedin": user_data.get("linkedin", ""),
            "portfolio": user_data.get("portfolio", ""),
        }
        for field_key, value in url_fields.items():
            if not value:
                continue
            filled = await self._try_fill_by_attr(page, field_key, value)
            # Also try "urls[LinkedIn]" style names used by Lever
            if not filled and field_key == "linkedin":
                filled = await self._try_fill_by_attr(page, "LinkedIn", value)
            if not filled and field_key == "portfolio":
                filled = await self._try_fill_by_attr(page, "website", value)
                if not filled:
                    filled = await self._try_fill_by_attr(page, "portfolio", value)
            self.log_action("fill_field", field=field_key, success=filled)

        # Fill cover letter
        if cover_letter:
            try:
                textarea = page.locator(
                    'textarea[name*="comments"], textarea[name*="cover"], '
                    'textarea[id*="additional"]'
                ).first
                if await textarea.is_visible(timeout=1000):
                    await textarea.fill(cover_letter, timeout=3000)
                    self.log_action("fill_cover_letter", success=True)
            except Exception:
                self.log_action("fill_cover_letter", success=False)

        # Handle custom "Additional information" fields
        if form_answers:
            await self._fill_custom_fields(page, form_answers)

        return self.log

    async def submit(self, page: Page) -> bool:
        try:
            btn = page.locator(LEVER_SELECTORS["submit"]).first
            if await btn.is_visible(timeout=2000):
                await btn.click(timeout=3000)
                self.log_action("submit", success=True)
                return True
        except Exception:
            pass
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

    async def _fill_custom_fields(self, page: Page, form_answers: dict) -> None:
        """Fill additional custom fields from form_answers dict."""
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

            # Try select
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
