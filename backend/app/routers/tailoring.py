from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.schemas.tailored_resume import (
    RejectRequest,
    TailoredResumeResponse,
    TailoredResumeUpdate,
    TailorRequest,
)

router = APIRouter(tags=["tailoring"])


@router.post("/jobs/{job_id}/tailor", response_model=TailoredResumeResponse, status_code=202)
async def tailor_resume(job_id: UUID, data: TailorRequest, db: AsyncSession = Depends(get_db)):
    # TODO: enqueue AI tailoring task
    pass


@router.get("/jobs/{job_id}/tailored", response_model=list[TailoredResumeResponse])
async def get_tailored_for_job(job_id: UUID, db: AsyncSession = Depends(get_db)):
    # TODO: list tailored resumes for job
    return []


@router.get("/tailored-resumes/{tailored_id}", response_model=TailoredResumeResponse)
async def get_tailored_resume(tailored_id: UUID, db: AsyncSession = Depends(get_db)):
    # TODO: fetch by id
    pass


@router.put("/tailored-resumes/{tailored_id}", response_model=TailoredResumeResponse)
async def update_tailored_resume(
    tailored_id: UUID, data: TailoredResumeUpdate, db: AsyncSession = Depends(get_db)
):
    # TODO: update sections manually
    pass


@router.post("/tailored-resumes/{tailored_id}/approve", response_model=TailoredResumeResponse)
async def approve_tailored_resume(tailored_id: UUID, db: AsyncSession = Depends(get_db)):
    # TODO: approve + generate PDF
    pass


@router.post("/tailored-resumes/{tailored_id}/reject", response_model=TailoredResumeResponse)
async def reject_tailored_resume(
    tailored_id: UUID, data: RejectRequest, db: AsyncSession = Depends(get_db)
):
    # TODO: reject, optionally regenerate
    pass
