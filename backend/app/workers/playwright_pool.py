from __future__ import annotations

"""Playwright browser pool: maintains a persistent browser instance with fresh contexts per task."""

from playwright.async_api import Browser, BrowserContext, Page, async_playwright

from app.config import settings

_browser: Browser | None = None
_playwright_instance = None


async def get_browser() -> Browser:
    """Get or create a persistent browser instance."""
    global _browser, _playwright_instance
    if _browser is None or not _browser.is_connected():
        _playwright_instance = await async_playwright().start()
        _browser = await _playwright_instance.chromium.launch(headless=settings.playwright_headless)
    return _browser


async def get_page() -> tuple[BrowserContext, Page]:
    """Create a fresh browser context and page for a task.

    Returns (context, page) — caller must close context when done.
    """
    browser = await get_browser()
    context = await browser.new_context()
    page = await context.new_page()
    return context, page


async def shutdown():
    """Close the browser and Playwright instance."""
    global _browser, _playwright_instance
    if _browser:
        await _browser.close()
        _browser = None
    if _playwright_instance:
        await _playwright_instance.stop()
        _playwright_instance = None
