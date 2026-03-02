import logging
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
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
from app.services.auto_applier import auto_apply

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/applications", tags=["applications"])


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


@router.post("/{application_id}/submit", response_model=ApplicationResponse)
async def submit_application(application_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Application).options(selectinload(Application.job)).where(
            Application.id == application_id
        )
    )
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    if application.status not in ("pending", "failed"):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot submit application with status '{application.status}'",
        )

    logger.info("Starting auto-apply for application %s", application_id)
    updated = await auto_apply(application_id, db)

    resp = ApplicationResponse.model_validate(updated)
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
