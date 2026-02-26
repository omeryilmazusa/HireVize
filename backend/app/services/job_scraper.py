"""Job scraping service: uses Playwright to extract job posting details from URLs."""

import re
from typing import Optional
from urllib.parse import urlparse

from playwright.async_api import Page


async def scrape_job(page: Page, url: str) -> dict:
    """Navigate to a job URL and extract structured job data.

    Returns dict with: company_name, job_title, location, salary_range,
    description_text, requirements, ats_platform, application_url
    """
    await page.goto(url, wait_until="domcontentloaded", timeout=30000)

    ats_platform = detect_ats_platform(url, await page.content())

    # Workday SPAs need extra time for JS to render
    if ats_platform == "workday":
        try:
            await page.wait_for_selector(
                '[data-automation-id="jobPostingDescription"]', timeout=8000
            )
        except Exception:
            await page.wait_for_timeout(3000)

    title = await page.title()
    company_name = await _extract_company_name(page, title, url, ats_platform)
    job_title = await _extract_job_title(page, title)

    return {
        "company_name": company_name,
        "job_title": job_title,
        "location": None,
        "salary_range": None,
        "description_text": await _extract_description(page, ats_platform),
        "requirements": None,
        "ats_platform": ats_platform,
        "application_url": url,
        "raw_html": await page.content(),
    }


async def _extract_company_name(
    page: Page, title: str, url: str, ats_platform: str
) -> Optional[str]:
    """Extract company name from meta tags, page title, or URL."""
    # Try og:site_name
    og_site = await page.evaluate(
        "document.querySelector('meta[property=\"og:site_name\"]')?.content"
    )
    if og_site and og_site.strip():
        return og_site.strip()

    # Workday: extract from URL subdomain (e.g. fortra.wd12.myworkdayjobs.com -> Fortra)
    if ats_platform == "workday":
        host = urlparse(url).hostname or ""
        match = re.match(r"^([^.]+)\.", host)
        if match:
            return match.group(1).replace("-", " ").title()

    # Greenhouse: company name is in the URL path (e.g. /anthropic/jobs/...)
    if ats_platform == "greenhouse":
        path = urlparse(url).path
        match = re.match(r"^/([^/]+)/", path)
        if match:
            return match.group(1).replace("-", " ").title()

    # Try splitting page title on common separators
    if title:
        for sep in [" at ", " - ", " | "]:
            if sep in title:
                parts = title.split(sep)
                # Company is usually the last meaningful part
                candidate = parts[-1].strip()
                if candidate:
                    return candidate

    return None


async def _extract_job_title(page: Page, title: str) -> Optional[str]:
    """Extract job title from meta tags, h1, or page title."""
    # Try og:title
    og_title = await page.evaluate(
        "document.querySelector('meta[property=\"og:title\"]')?.content"
    )
    if og_title and og_title.strip():
        return og_title.strip()

    # Try first h1
    h1 = await page.evaluate(
        "document.querySelector('h1')?.innerText"
    )
    if h1 and h1.strip():
        return h1.strip()

    # Fall back to page title (first part before separator)
    if title:
        for sep in [" at ", " - ", " | "]:
            if sep in title:
                candidate = title.split(sep)[0].strip()
                if candidate:
                    return candidate
        return title.strip()

    return None


def detect_ats_platform(url: str, html: str) -> str:
    """Detect which ATS platform the job is hosted on."""
    url_lower = url.lower()
    if "greenhouse.io" in url_lower or "boards.greenhouse" in url_lower:
        return "greenhouse"
    if "lever.co" in url_lower or "jobs.lever" in url_lower:
        return "lever"
    if "myworkdayjobs.com" in url_lower or "workday" in url_lower:
        return "workday"
    return "unknown"


async def _extract_description(page: Page, ats_platform: str) -> str:
    """Extract the main job description text from the page."""
    # Workday-specific selector
    if ats_platform == "workday":
        el = await page.query_selector('[data-automation-id="jobPostingDescription"]')
        if el:
            text = await el.inner_text()
            if text.strip():
                return text.strip()

    # Try common selectors for job descriptions
    selectors = [
        "[class*='description']",
        "[class*='job-description']",
        "[id*='description']",
        "article",
        "main",
    ]
    for selector in selectors:
        element = await page.query_selector(selector)
        if element:
            text = await element.inner_text()
            if len(text) > 100:
                return text.strip()
    # Fallback: get all body text
    return (await page.inner_text("body"))[:5000]
