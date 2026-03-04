from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import extract, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.dependencies import get_current_user, get_db
from app.models.application import Application
from app.models.interview import Interview
from app.models.user import User
from app.schemas.interview import InterviewCreate, InterviewResponse, InterviewUpdate

router = APIRouter(prefix="/interviews", tags=["interviews"])


def _enrich(interview: Interview) -> InterviewResponse:
    resp = InterviewResponse.model_validate(interview)
    if interview.application and interview.application.job:
        resp.company_name = interview.application.job.company_name
        resp.job_title = interview.application.job.job_title
    return resp


@router.get("", response_model=list[InterviewResponse])
async def list_interviews(
    status: Optional[str] = Query(None),
    month: Optional[str] = Query(None, description="YYYY-MM format"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Interview)
        .where(Interview.user_id == user.id)
        .options(selectinload(Interview.application).selectinload(Application.job))
    )

    if status:
        stmt = stmt.where(Interview.status == status)

    if month:
        try:
            year, mon = month.split("-")
            stmt = stmt.where(
                extract("year", Interview.scheduled_at) == int(year),
                extract("month", Interview.scheduled_at) == int(mon),
            )
        except ValueError:
            raise HTTPException(status_code=400, detail="month must be YYYY-MM format")

    stmt = stmt.order_by(Interview.scheduled_at.asc())
    result = await db.execute(stmt)
    interviews = result.scalars().all()
    return [_enrich(i) for i in interviews]


@router.post("", response_model=InterviewResponse, status_code=201)
async def create_interview(
    data: InterviewCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify application exists and belongs to user
    app_result = await db.execute(
        select(Application)
        .options(selectinload(Application.job))
        .where(Application.id == data.application_id, Application.user_id == user.id)
    )
    application = app_result.scalar_one_or_none()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    interview = Interview(
        application_id=data.application_id,
        user_id=user.id,
        interview_type=data.interview_type,
        scheduled_at=data.scheduled_at,
        duration_minutes=data.duration_minutes,
        location=data.location,
        interviewer_name=data.interviewer_name,
        notes=data.notes,
    )
    db.add(interview)
    await db.commit()
    await db.refresh(interview, attribute_names=["application"])

    resp = InterviewResponse.model_validate(interview)
    if application.job:
        resp.company_name = application.job.company_name
        resp.job_title = application.job.job_title
    return resp


@router.get("/{interview_id}", response_model=InterviewResponse)
async def get_interview(
    interview_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Interview)
        .where(Interview.id == interview_id, Interview.user_id == user.id)
        .options(selectinload(Interview.application).selectinload(Application.job))
    )
    result = await db.execute(stmt)
    interview = result.scalar_one_or_none()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    return _enrich(interview)


@router.put("/{interview_id}", response_model=InterviewResponse)
async def update_interview(
    interview_id: UUID,
    data: InterviewUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Interview)
        .where(Interview.id == interview_id, Interview.user_id == user.id)
        .options(selectinload(Interview.application).selectinload(Application.job))
    )
    result = await db.execute(stmt)
    interview = result.scalar_one_or_none()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(interview, field, value)

    await db.commit()
    await db.refresh(interview)
    return _enrich(interview)


@router.delete("/{interview_id}", status_code=204)
async def delete_interview(
    interview_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Interview).where(Interview.id == interview_id, Interview.user_id == user.id)
    )
    interview = result.scalar_one_or_none()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    await db.delete(interview)
    await db.commit()
