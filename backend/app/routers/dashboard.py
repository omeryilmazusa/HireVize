from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.dependencies import get_db
from app.models.application import Application
from app.models.job import Job
from app.schemas.dashboard import DashboardStats, RecentApplication, TimelineEntry

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_stats(db: AsyncSession = Depends(get_db)):
    # Total applications
    total_result = await db.execute(select(func.count(Application.id)))
    total = total_result.scalar() or 0

    # Count by status
    status_result = await db.execute(
        select(Application.status, func.count(Application.id)).group_by(Application.status)
    )
    by_status = {row[0]: row[1] for row in status_result.all()}

    # This week
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)
    week_result = await db.execute(
        select(func.count(Application.id)).where(Application.created_at >= week_ago)
    )
    this_week = week_result.scalar() or 0

    # This month
    month_ago = now - timedelta(days=30)
    month_result = await db.execute(
        select(func.count(Application.id)).where(Application.created_at >= month_ago)
    )
    this_month = month_result.scalar() or 0

    # Response rate: any status beyond "pending" and "submitted"
    responded_statuses = {"interviewing", "rejected", "offered", "accepted"}
    responded = sum(by_status.get(s, 0) for s in responded_statuses)
    response_rate = (responded / total * 100) if total > 0 else 0.0

    return DashboardStats(
        total_applications=total,
        by_status=by_status,
        this_week=this_week,
        this_month=this_month,
        response_rate=round(response_rate, 1),
    )


@router.get("/recent", response_model=list[RecentApplication])
async def get_recent(db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Application)
        .options(selectinload(Application.job))
        .order_by(Application.created_at.desc())
        .limit(10)
    )
    result = await db.execute(stmt)
    applications = result.scalars().all()

    recent = []
    for app in applications:
        recent.append(
            RecentApplication(
                id=app.id,
                status=app.status,
                created_at=app.created_at,
                company_name=app.job.company_name if app.job else None,
                job_title=app.job.job_title if app.job else None,
            )
        )
    return recent


@router.get("/timeline", response_model=list[TimelineEntry])
async def get_timeline(db: AsyncSession = Depends(get_db)):
    # Applications per day for the last 30 days
    now = datetime.now(timezone.utc)
    month_ago = now - timedelta(days=30)

    stmt = (
        select(
            func.date(Application.created_at).label("date"),
            func.count(Application.id).label("count"),
        )
        .where(Application.created_at >= month_ago)
        .group_by(func.date(Application.created_at))
        .order_by(func.date(Application.created_at))
    )
    result = await db.execute(stmt)
    return [TimelineEntry(date=str(row.date), count=row.count) for row in result.all()]
