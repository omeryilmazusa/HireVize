"""Job scraping service: uses Playwright to extract job posting details from URLs."""

from playwright.async_api import Page


async def scrape_job(page: Page, url: str) -> dict:
    """Navigate to a job URL and extract structured job data.

    Returns dict with: company_name, job_title, location, salary_range,
    description_text, requirements, ats_platform, application_url
    """
    await page.goto(url, wait_until="domcontentloaded", timeout=30000)

    ats_platform = detect_ats_platform(url, await page.content())

    # TODO: extract fields based on ATS platform
    title = await page.title()

    return {
        "company_name": None,
        "job_title": title,
        "location": None,
        "salary_range": None,
        "description_text": await _extract_description(page),
        "requirements": None,
        "ats_platform": ats_platform,
        "application_url": url,
        "raw_html": await page.content(),
    }


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


async def _extract_description(page: Page) -> str:
    """Extract the main job description text from the page."""
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
