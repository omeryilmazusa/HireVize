import logging
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.dependencies import get_current_user, get_db
from app.models.application import Application
from app.models.job import Job
from app.models.user import User
from app.schemas.application import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationStatusUpdate,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/applications", tags=["applications"])


class StartApplyResponse(BaseModel):
    application_id: str
    application_url: str


class ApplyResultRequest(BaseModel):
    status: str  # "submitted" or "failed"
    automation_log: Optional[dict] = None
    error_message: Optional[str] = None


@router.get("", response_model=list[ApplicationResponse])
async def list_applications(
    status: Optional[str] = Query(None),
    sort: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Application).options(selectinload(Application.job))

    if status:
        stmt = stmt.where(Application.status == status)

    stmt = stmt.order_by(Application.created_at.desc())
    result = await db.execute(stmt)
    applications = result.scalars().all()

    # Attach job info to response
    response = []
    for app in applications:
        data = ApplicationResponse.model_validate(app)
        if app.job:
            data.company_name = app.job.company_name
            data.job_title = app.job.job_title
        response.append(data)
    return response


@router.post("", response_model=ApplicationResponse, status_code=201)
async def create_application(
    data: ApplicationCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):

    # Verify the job exists
    job_result = await db.execute(select(Job).where(Job.id == data.job_id))
    job = job_result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    application = Application(
        user_id=user.id,
        job_id=data.job_id,
        cover_letter=data.cover_letter,
        form_answers=data.form_answers,
        status="pending",
    )
    db.add(application)
    await db.commit()
    await db.refresh(application)

    resp = ApplicationResponse.model_validate(application)
    resp.company_name = job.company_name
    resp.job_title = job.job_title
    return resp


@router.get("/{application_id}", response_model=ApplicationResponse)
async def get_application(application_id: UUID, db: AsyncSession = Depends(get_db)):
    stmt = select(Application).options(selectinload(Application.job)).where(
        Application.id == application_id
    )
    result = await db.execute(stmt)
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    resp = ApplicationResponse.model_validate(application)
    if application.job:
        resp.company_name = application.job.company_name
        resp.job_title = application.job.job_title
    return resp


@router.post("/{application_id}/start-apply", response_model=StartApplyResponse)
async def start_apply(
    application_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Application).options(selectinload(Application.job)).where(
            Application.id == application_id,
            Application.user_id == user.id,
        )
    )
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    if application.status not in ("pending", "failed"):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot start apply for application with status '{application.status}'",
        )

    job = application.job
    if not job:
        raise HTTPException(status_code=400, detail="Application has no associated job")

    application_url = job.application_url or job.source_url
    if not application_url:
        raise HTTPException(status_code=400, detail="No application URL available")

    application.status = "applying"
    await db.commit()

    return StartApplyResponse(
        application_id=str(application.id),
        application_url=application_url,
    )


@router.put("/{application_id}/apply-result", response_model=ApplicationResponse)
async def apply_result(
    application_id: UUID,
    data: ApplyResultRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Application).options(selectinload(Application.job)).where(
            Application.id == application_id,
            Application.user_id == user.id,
        )
    )
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    if data.status == "submitted":
        application.status = "submitted"
        application.submitted_at = datetime.now(timezone.utc)
        application.error_message = None
    elif data.status == "failed":
        application.status = "failed"
        application.error_message = data.error_message
    else:
        raise HTTPException(status_code=400, detail="Status must be 'submitted' or 'failed'")

    if data.automation_log:
        application.automation_log = data.automation_log

    await db.commit()
    await db.refresh(application)

    resp = ApplicationResponse.model_validate(application)
    if application.job:
        resp.company_name = application.job.company_name
        resp.job_title = application.job.job_title
    return resp


@router.put("/{application_id}/status", response_model=ApplicationResponse)
async def update_status(
    application_id: UUID, data: ApplicationStatusUpdate, db: AsyncSession = Depends(get_db)
):
    stmt = select(Application).options(selectinload(Application.job)).where(
        Application.id == application_id
    )
    result = await db.execute(stmt)
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    application.status = data.status
    if data.notes is not None:
        application.notes = data.notes
    await db.commit()
    await db.refresh(application)

    resp = ApplicationResponse.model_validate(application)
    if application.job:
        resp.company_name = application.job.company_name
        resp.job_title = application.job.job_title
    return resp


@router.delete("/{application_id}", status_code=204)
async def delete_application(application_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Application).where(Application.id == application_id)
    )
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    await db.delete(application)
    await db.commit()
