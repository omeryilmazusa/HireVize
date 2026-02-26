"""CAPTCHA detection utilities."""

from playwright.async_api import Page


async def detect_captcha(page: Page) -> bool:
    """Check if the page contains a CAPTCHA that would block automation."""
    captcha_indicators = [
        'iframe[src*="recaptcha"]',
        'iframe[src*="hcaptcha"]',
        '[class*="captcha"]',
        '[id*="captcha"]',
    ]
    for selector in captcha_indicators:
        element = await page.query_selector(selector)
        if element:
            return True
    return False
