from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.schemas.job import JobCreate, JobResponse

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("", response_model=list[JobResponse])
async def list_jobs(
    status: str | None = Query(None),
    search: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    # TODO: query with filters
    return []


@router.post("", response_model=JobResponse, status_code=201)
async def create_job(data: JobCreate, db: AsyncSession = Depends(get_db)):
    # TODO: insert job, enqueue scrape task
    pass


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: UUID, db: AsyncSession = Depends(get_db)):
    # TODO: fetch by id
    pass


@router.delete("/{job_id}", status_code=204)
async def delete_job(job_id: UUID, db: AsyncSession = Depends(get_db)):
    # TODO: delete job + related tailored resumes
    pass


@router.post("/{job_id}/rescrape", response_model=JobResponse)
async def rescrape_job(job_id: UUID, db: AsyncSession = Depends(get_db)):
    # TODO: re-enqueue scrape task
    pass
