"""Dismiss cookie consent banners so they don't block form interaction."""

from playwright.async_api import Page


async def dismiss_cookie_banner(page: Page) -> bool:
    """Try to dismiss cookie banners by clicking reject/dismiss/close buttons.

    Uses a short timeout (2s) and silently continues if no banner is found.
    Returns True if a banner was dismissed, False otherwise.
    """
    selectors = [
        # Reject / decline buttons (prefer these to avoid unnecessary cookies)
        'button:has-text("Reject All")',
        'button:has-text("Reject")',
        'button:has-text("Decline")',
        'button:has-text("Decline All")',
        # Accept buttons (fallback — just get past the banner)
        'button:has-text("Accept All")',
        'button:has-text("Accept Cookies")',
        'button:has-text("Accept")',
        'button:has-text("I Agree")',
        'button:has-text("Got It")',
        'button:has-text("OK")',
        # Dismiss / close buttons
        'button:has-text("Dismiss")',
        'button:has-text("Close")',
        '[id*="cookie"] button',
        '[class*="cookie"] button',
        '[id*="consent"] button',
        '[class*="consent"] button',
        '[aria-label="Close"]',
        '[aria-label="Dismiss"]',
    ]

    for selector in selectors:
        try:
            btn = page.locator(selector).first
            if await btn.is_visible(timeout=2000):
                await btn.click(timeout=2000)
                return True
        except Exception:
            continue

    return False
