from __future__ import annotations

"""Workday ATS adapter for automating job applications.

Workday uses a multi-page SPA wizard. Each page transition requires clicking
the Next button and waiting for the SPA to re-render.
"""

import logging
from pathlib import Path

from playwright.async_api import Page

from automation.base_adapter import BaseATSAdapter
from automation.utils.selectors import WORKDAY_SELECTORS

logger = logging.getLogger(__name__)


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
        await page.wait_for_timeout(3000)

        # Page 1 — Click Apply button on the job posting
        await self._click_apply_button(page)

        # Page 2 — Account / sign-in page: try to skip or apply manually
        await self._handle_signin_page(page)

        # Page 3 — Personal information
        await self._fill_personal_info(page, user_data)
        await self._click_next(page)

        # Page 4 — Resume upload
        await self._upload_resume(page, resume_path)
        await self._click_next(page)

        # Page 5 — Experience / EEO questions
        await self._fill_eeo_fields(page, user_data)

        # Handle any additional custom fields
        if form_answers:
            await self._fill_custom_fields(page, form_answers)

        await self._click_next(page)

        return self.log

    async def submit(self, page: Page) -> bool:
        """Click Next on the final review page to submit."""
        return await self._click_next(page)

    async def _click_apply_button(self, page: Page) -> None:
        """Click the Apply button on the Workday job posting page."""
        selector = WORKDAY_SELECTORS["apply"]
        try:
            btn = page.locator(selector).first
            if await btn.is_visible(timeout=5000):
                await btn.click(timeout=3000)
                await self._wait_for_spa_transition(page)
                self.log_action("click_apply", success=True)
                return
        except Exception:
            pass
        # Fallback: try generic apply buttons
        for sel in [
            'a:has-text("Apply")',
            'button:has-text("Apply")',
        ]:
            try:
                btn = page.locator(sel).first
                if await btn.is_visible(timeout=2000):
                    await btn.click(timeout=3000)
                    await self._wait_for_spa_transition(page)
                    self.log_action("click_apply", selector=sel, success=True)
                    return
            except Exception:
                continue
        self.log_action("click_apply", success=False)

    async def _handle_signin_page(self, page: Page) -> None:
        """Handle the sign-in / create-account interstitial page."""
        # Try "Apply Manually" link to bypass account creation
        try:
            manual_link = page.locator(
                'a:has-text("Apply Manually"), button:has-text("Apply Manually")'
            ).first
            if await manual_link.is_visible(timeout=3000):
                await manual_link.click(timeout=3000)
                await self._wait_for_spa_transition(page)
                self.log_action("skip_signin", method="apply_manually", success=True)
                return
        except Exception:
            pass

        # Try "Use My Last Application" link
        try:
            reuse_link = page.locator(
                'a:has-text("Use My Last Application"), button:has-text("Use My Last Application")'
            ).first
            if await reuse_link.is_visible(timeout=2000):
                await reuse_link.click(timeout=3000)
                await self._wait_for_spa_transition(page)
                self.log_action("skip_signin", method="reuse_application", success=True)
                return
        except Exception:
            pass

        self.log_action("skip_signin", success=False, detail="No bypass option found")

    async def _fill_personal_info(self, page: Page, user_data: dict) -> None:
        """Fill the personal information page fields."""
        field_map = {
            "first_name": user_data.get("first_name", ""),
            "last_name": user_data.get("last_name", ""),
            "email": user_data.get("email", ""),
            "phone": user_data.get("phone", ""),
            "address_line1": user_data.get("street", ""),
            "city": user_data.get("city", ""),
            "zip": user_data.get("zip", ""),
        }
        for field_key, value in field_map.items():
            if not value:
                continue
            selector = WORKDAY_SELECTORS.get(field_key)
            if not selector:
                continue
            try:
                el = page.locator(selector).first
                if await el.is_visible(timeout=1500):
                    await el.fill(value, timeout=2000)
                    self.log_action("fill_field", field=field_key, success=True)
            except Exception:
                self.log_action("fill_field", field=field_key, success=False)

        # State is typically a dropdown in Workday
        state = user_data.get("state", "")
        if state:
            try:
                state_el = page.locator(WORKDAY_SELECTORS["state"]).first
                if await state_el.is_visible(timeout=1500):
                    # Workday uses custom dropdowns — click to open, then select
                    await state_el.click(timeout=2000)
                    await page.wait_for_timeout(500)
                    option = page.locator(f'div[data-automation-id="promptOption"]:has-text("{state}")').first
                    if await option.is_visible(timeout=2000):
                        await option.click(timeout=2000)
                        self.log_action("fill_field", field="state", success=True)
                    else:
                        # Fallback: try typing into the dropdown search
                        await state_el.fill(state, timeout=2000)
                        await page.wait_for_timeout(500)
                        self.log_action("fill_field", field="state", success=True)
            except Exception:
                self.log_action("fill_field", field="state", success=False)

    async def _upload_resume(self, page: Page, resume_path: Path) -> None:
        """Upload resume via Workday file input."""
        if not resume_path or not Path(resume_path).exists():
            self.log_action("upload_resume", success=False, detail="No resume file")
            return
        try:
            file_input = page.locator(WORKDAY_SELECTORS["resume"]).first
            await file_input.set_input_files(str(resume_path), timeout=5000)
            await page.wait_for_timeout(2000)
            self.log_action("upload_resume", success=True)
        except Exception:
            # Fallback to generic file input
            try:
                file_input = page.locator('input[type="file"]').first
                await file_input.set_input_files(str(resume_path), timeout=5000)
                self.log_action("upload_resume", fallback=True, success=True)
            except Exception:
                self.log_action("upload_resume", success=False)

    async def _fill_eeo_fields(self, page: Page, user_data: dict) -> None:
        """Fill EEO / voluntary self-identification fields (gender, race, veteran, disability)."""
        eeo_fields = {
            "gender": user_data.get("gender", ""),
            "race": user_data.get("race", ""),
            "veteran": user_data.get("veteran", ""),
            "disability": user_data.get("disability", ""),
        }
        for field_key, value in eeo_fields.items():
            if not value:
                continue
            # Workday uses custom dropdown selects with data-automation-id
            try:
                dropdown = page.locator(
                    f'[data-automation-id*="{field_key}" i], '
                    f'select[data-automation-id*="{field_key}" i]'
                ).first
                if await dropdown.is_visible(timeout=1500):
                    # Try as standard select
                    tag = await dropdown.evaluate("el => el.tagName.toLowerCase()")
                    if tag == "select":
                        try:
                            await dropdown.select_option(label=value, timeout=2000)
                        except Exception:
                            await dropdown.select_option(value=value, timeout=2000)
                    else:
                        # Workday custom dropdown — click and pick option
                        await dropdown.click(timeout=2000)
                        await page.wait_for_timeout(500)
                        option = page.locator(
                            f'div[data-automation-id="promptOption"]:has-text("{value}")'
                        ).first
                        if await option.is_visible(timeout=2000):
                            await option.click(timeout=2000)
                    self.log_action("fill_eeo", field=field_key, success=True)
                    continue
            except Exception:
                pass
            self.log_action("fill_eeo", field=field_key, success=False)

    async def _fill_custom_fields(self, page: Page, form_answers: dict) -> None:
        """Fill additional custom question fields."""
        for question_key, answer in form_answers.items():
            for attr in ["name", "id", "data-automation-id"]:
                selector = f'input[{attr}*="{question_key}" i]'
                try:
                    el = page.locator(selector).first
                    if await el.is_visible(timeout=500):
                        await el.fill(str(answer), timeout=2000)
                        self.log_action("fill_custom", field=question_key, success=True)
                        break
                except Exception:
                    continue

    async def _click_next(self, page: Page) -> bool:
        """Click the Workday Next / Continue button and wait for SPA transition."""
        try:
            btn = page.locator(WORKDAY_SELECTORS["submit"]).first
            if await btn.is_visible(timeout=3000):
                await btn.click(timeout=3000)
                await self._wait_for_spa_transition(page)
                self.log_action("click_next", success=True)
                return True
        except Exception:
            pass
        self.log_action("click_next", success=False)
        return False

    async def _wait_for_spa_transition(self, page: Page) -> None:
        """Wait for Workday SPA page transitions."""
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=8000)
        except Exception:
            pass
        await page.wait_for_timeout(2000)
