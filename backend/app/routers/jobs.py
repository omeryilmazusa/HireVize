import logging
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_user, get_db
from app.models.application import Application
from app.models.job import Job
from app.models.user import User
from app.schemas.job import JobCreate, JobResponse
from app.services.job_scraper import scrape_job

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("", response_model=list[JobResponse])
async def list_jobs(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Job).where(Job.user_id == user.id)

    if status:
        stmt = stmt.where(Job.scrape_status == status)
    if search:
        pattern = f"%{search}%"
        stmt = stmt.where(
            or_(
                Job.company_name.ilike(pattern),
                Job.job_title.ilike(pattern),
                Job.source_url.ilike(pattern),
            )
        )

    stmt = stmt.order_by(Job.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("", response_model=JobResponse, status_code=201)
async def create_job(
    data: JobCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):

    # Duplicate check
    existing = await db.execute(
        select(Job).where(Job.source_url == data.source_url)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=409,
            detail="You can't apply to the same job twice",
        )

    # Scrape the job URL
    scraped = {}
    scrape_status = "failed"
    scrape_error = None
    try:
        scraped = await scrape_job(data.source_url)
        scrape_status = "completed"
    except Exception as exc:
        scrape_error = str(exc)
        logger.warning("Scrape failed for %s: %s", data.source_url, exc)

    job = Job(
        user_id=user.id,
        source_url=data.source_url,
        company_name=scraped.get("company_name"),
        job_title=scraped.get("job_title"),
        location=scraped.get("location"),
        salary_range=scraped.get("salary_range"),
        description_text=scraped.get("description_text"),
        requirements=scraped.get("requirements"),
        ats_platform=scraped.get("ats_platform"),
        application_url=scraped.get("application_url"),
        raw_html=scraped.get("raw_html"),
        scrape_status=scrape_status,
        scrape_error=scrape_error,
    )
    db.add(job)
    await db.flush()

    # Auto-create application
    application = Application(
        user_id=user.id,
        job_id=job.id,
        status="added",
    )
    db.add(application)

    await db.commit()
    await db.refresh(job)
    return job


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Job).where(Job.id == job_id, Job.user_id == user.id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.delete("/{job_id}", status_code=204)
async def delete_job(
    job_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Job).where(Job.id == job_id, Job.user_id == user.id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    await db.delete(job)
    await db.commit()


@router.post("/{job_id}/rescrape", response_model=JobResponse)
async def rescrape_job(
    job_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Job).where(Job.id == job_id, Job.user_id == user.id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    job.scrape_status = "pending"
    job.scrape_error = None
    await db.commit()
    await db.refresh(job)
    return job
