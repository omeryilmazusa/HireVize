"""ARQ task definitions for async background jobs."""

from uuid import UUID

from app.database import async_session


async def scrape_job_task(ctx: dict, job_id: str) -> dict:
    """Scrape a job posting URL using Playwright.

    1. Load the job record from the database
    2. Launch Playwright, navigate to the URL
    3. Extract job details (title, company, description, requirements)
    4. Update the job record with parsed data
    """
    from app.workers.playwright_pool import get_page

    async with async_session() as db:
        # TODO: load job, scrape with Playwright, update record
        pass

    return {"status": "completed", "job_id": job_id}


async def tailor_resume_task(ctx: dict, job_id: str, base_resume_id: str, model: str | None = None) -> dict:
    """Generate a tailored resume using AI.

    1. Load job description and base resume from database
    2. Call AI service to generate tailored sections
    3. Store the tailored resume record
    """
    async with async_session() as db:
        # TODO: load data, call AI, store result
        pass

    return {"status": "completed", "job_id": job_id}


async def submit_application_task(ctx: dict, application_id: str) -> dict:
    """Submit a job application using Playwright.

    1. Load application, job, resume, and user data
    2. Launch Playwright, navigate to application form
    3. Fill form fields, upload resume
    4. Log each step
    5. Submit (or pause for user confirmation)
    """
    from app.workers.playwright_pool import get_page

    async with async_session() as db:
        # TODO: load data, fill form, submit
        pass

    return {"status": "completed", "application_id": application_id}
