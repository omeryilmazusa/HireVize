from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.models.job import Job
from app.models.resume import Resume
from app.models.tailored_resume import TailoredResume
from app.schemas.tailored_resume import (
    RejectRequest,
    TailoredResumeResponse,
    TailoredResumeUpdate,
    TailorRequest,
)

router = APIRouter(tags=["tailoring"])


@router.post("/jobs/{job_id}/tailor", response_model=TailoredResumeResponse, status_code=202)
async def tailor_resume(job_id: UUID, data: TailorRequest, db: AsyncSession = Depends(get_db)):
    # Verify job exists
    job_result = await db.execute(select(Job).where(Job.id == job_id))
    job = job_result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Verify base resume exists
    resume_result = await db.execute(select(Resume).where(Resume.id == data.base_resume_id))
    base_resume = resume_result.scalar_one_or_none()
    if not base_resume:
        raise HTTPException(status_code=404, detail="Base resume not found")

    # Create a draft tailored resume (copy sections from base as placeholder)
    tailored = TailoredResume(
        job_id=job_id,
        base_resume_id=data.base_resume_id,
        tailored_sections=base_resume.parsed_sections or {},
        ai_model_used=data.model or "placeholder",
        status="draft",
    )
    db.add(tailored)
    await db.commit()
    await db.refresh(tailored)
    return tailored


@router.get("/jobs/{job_id}/tailored", response_model=list[TailoredResumeResponse])
async def get_tailored_for_job(job_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(TailoredResume)
        .where(TailoredResume.job_id == job_id)
        .order_by(TailoredResume.created_at.desc())
    )
    return result.scalars().all()


@router.get("/tailored-resumes/{tailored_id}", response_model=TailoredResumeResponse)
async def get_tailored_resume(tailored_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(TailoredResume).where(TailoredResume.id == tailored_id)
    )
    tailored = result.scalar_one_or_none()
    if not tailored:
        raise HTTPException(status_code=404, detail="Tailored resume not found")
    return tailored


@router.put("/tailored-resumes/{tailored_id}", response_model=TailoredResumeResponse)
async def update_tailored_resume(
    tailored_id: UUID, data: TailoredResumeUpdate, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(TailoredResume).where(TailoredResume.id == tailored_id)
    )
    tailored = result.scalar_one_or_none()
    if not tailored:
        raise HTTPException(status_code=404, detail="Tailored resume not found")

    tailored.tailored_sections = data.tailored_sections
    await db.commit()
    await db.refresh(tailored)
    return tailored


@router.post("/tailored-resumes/{tailored_id}/approve", response_model=TailoredResumeResponse)
async def approve_tailored_resume(tailored_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(TailoredResume).where(TailoredResume.id == tailored_id)
    )
    tailored = result.scalar_one_or_none()
    if not tailored:
        raise HTTPException(status_code=404, detail="Tailored resume not found")

    tailored.status = "approved"
    await db.commit()
    await db.refresh(tailored)
    return tailored


@router.post("/tailored-resumes/{tailored_id}/reject", response_model=TailoredResumeResponse)
async def reject_tailored_resume(
    tailored_id: UUID, data: RejectRequest, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(TailoredResume).where(TailoredResume.id == tailored_id)
    )
    tailored = result.scalar_one_or_none()
    if not tailored:
        raise HTTPException(status_code=404, detail="Tailored resume not found")

    tailored.status = "rejected"
    await db.commit()
    await db.refresh(tailored)
    return tailored
