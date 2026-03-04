"""Job scraping service: uses httpx + BeautifulSoup to extract job posting details from URLs."""

import re
from typing import Optional
from urllib.parse import urlparse

import httpx
from bs4 import BeautifulSoup

_USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/125.0.0.0 Safari/537.36"
)


async def scrape_job(url: str) -> dict:
    """Fetch a job URL and extract structured job data.

    Returns dict with: company_name, job_title, location, salary_range,
    description_text, requirements, ats_platform, application_url, raw_html
    """
    async with httpx.AsyncClient(
        follow_redirects=True,
        timeout=30.0,
        headers={"User-Agent": _USER_AGENT},
    ) as client:
        response = await client.get(url)
        response.raise_for_status()

    html = response.text
    soup = BeautifulSoup(html, "html.parser")
    ats_platform = detect_ats_platform(url, html)

    company_name = _extract_company_name(soup, url, ats_platform)
    job_title = _extract_job_title(soup)
    description_text = _extract_description(soup, ats_platform)

    return {
        "company_name": company_name,
        "job_title": job_title,
        "location": None,
        "salary_range": None,
        "description_text": description_text,
        "requirements": None,
        "ats_platform": ats_platform,
        "application_url": url,
        "raw_html": html,
    }


def _extract_company_name(
    soup: BeautifulSoup, url: str, ats_platform: str
) -> Optional[str]:
    """Extract company name from meta tags, page title, or URL."""
    # Try og:site_name
    og_site = soup.find("meta", property="og:site_name")
    if og_site and og_site.get("content", "").strip():
        return og_site["content"].strip()

    # Workday: extract from URL subdomain
    if ats_platform == "workday":
        host = urlparse(url).hostname or ""
        match = re.match(r"^([^.]+)\.", host)
        if match:
            return match.group(1).replace("-", " ").title()

    # Greenhouse: company name is in the URL path
    if ats_platform == "greenhouse":
        path = urlparse(url).path
        match = re.match(r"^/([^/]+)/", path)
        if match:
            return match.group(1).replace("-", " ").title()

    # Try splitting page title on common separators
    title_tag = soup.find("title")
    title = title_tag.string.strip() if title_tag and title_tag.string else ""
    if title:
        for sep in [" at ", " - ", " | "]:
            if sep in title:
                parts = title.split(sep)
                candidate = parts[-1].strip()
                if candidate:
                    return candidate

    return None


def _extract_job_title(soup: BeautifulSoup) -> Optional[str]:
    """Extract job title from meta tags, h1, or page title."""
    # Try og:title
    og_title = soup.find("meta", property="og:title")
    if og_title and og_title.get("content", "").strip():
        return og_title["content"].strip()

    # Try first h1
    h1 = soup.find("h1")
    if h1 and h1.get_text(strip=True):
        return h1.get_text(strip=True)

    # Fall back to page title
    title_tag = soup.find("title")
    title = title_tag.string.strip() if title_tag and title_tag.string else ""
    if title:
        for sep in [" at ", " - ", " | "]:
            if sep in title:
                candidate = title.split(sep)[0].strip()
                if candidate:
                    return candidate
        return title

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
    if "linkedin.com" in url_lower:
        return "linkedin"
    return "unknown"


def _extract_description(soup: BeautifulSoup, ats_platform: str) -> str:
    """Extract the main job description text from the page."""
    # Workday-specific selector
    if ats_platform == "workday":
        el = soup.find(attrs={"data-automation-id": "jobPostingDescription"})
        if el:
            text = el.get_text(strip=True)
            if text:
                return text

    # Try common selectors for job descriptions
    for attr_name in ["class", "id"]:
        for pattern in ["description", "job-description", "content"]:
            el = soup.find(attrs={attr_name: re.compile(pattern, re.I)})
            if el:
                text = el.get_text(separator="\n", strip=True)
                if len(text) > 100:
                    return text

    # Try article or main
    for tag in ["article", "main"]:
        el = soup.find(tag)
        if el:
            text = el.get_text(separator="\n", strip=True)
            if len(text) > 100:
                return text

    # Fallback: get body text
    body = soup.find("body")
    if body:
        return body.get_text(separator="\n", strip=True)[:5000]
    return ""
