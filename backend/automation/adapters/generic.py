"""Generic form-fill fallback adapter using heuristics."""

from pathlib import Path

from playwright.async_api import Page

from automation.base_adapter import BaseATSAdapter


class GenericAdapter(BaseATSAdapter):
    """Fallback adapter that uses heuristics to fill common form fields."""

    FIELD_MAPPINGS = {
        "name": ["name", "full_name", "fullname", "applicant_name"],
        "first_name": ["first_name", "firstname", "fname"],
        "last_name": ["last_name", "lastname", "lname"],
        "email": ["email", "e-mail", "email_address"],
        "phone": ["phone", "telephone", "phone_number", "mobile"],
        "linkedin": ["linkedin", "linkedin_url", "linkedin_profile"],
        "portfolio": ["portfolio", "website", "url", "personal_website"],
    }

    async def detect(self, url: str, page: Page) -> bool:
        return True  # Generic adapter always matches as fallback

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

        # Try to fill fields by common name/id/label patterns
        for field_key, selectors in self.FIELD_MAPPINGS.items():
            value = user_data.get(field_key)
            if not value:
                continue
            for selector_name in selectors:
                filled = await self._try_fill(page, selector_name, value)
                if filled:
                    self.log_action("fill_field", field=field_key, selector=selector_name, success=True)
                    break

        # Try to upload resume
        file_input = await page.query_selector('input[type="file"]')
        if file_input:
            await file_input.set_input_files(str(resume_path))
            self.log_action("upload_resume", file=str(resume_path), success=True)

        # Fill cover letter if a textarea is found
        if cover_letter:
            textarea = await page.query_selector('textarea[name*="cover"], textarea[id*="cover"]')
            if textarea:
                await textarea.fill(cover_letter)
                self.log_action("fill_cover_letter", success=True)

        return self.log

    async def _try_fill(self, page: Page, name: str, value: str) -> bool:
        """Try to fill a form field matching the given name pattern."""
        for attr in ["name", "id"]:
            selector = f'input[{attr}*="{name}" i]'
            element = await page.query_selector(selector)
            if element:
                await element.fill(value)
                return True
        return False

    async def submit(self, page: Page) -> bool:
        # Try common submit button selectors
        for selector in [
            'button[type="submit"]',
            'input[type="submit"]',
            'button:has-text("Submit")',
            'button:has-text("Apply")',
        ]:
            btn = await page.query_selector(selector)
            if btn:
                await btn.click()
                self.log_action("submit", selector=selector, success=True)
                return True
        self.log_action("submit", success=False, error="No submit button found")
        return False
