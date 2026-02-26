from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.schemas.dashboard import DashboardStats, TimelineEntry

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_stats(db: AsyncSession = Depends(get_db)):
    # TODO: aggregate stats
    return DashboardStats(
        total_applications=0,
        by_status={},
        this_week=0,
        this_month=0,
        response_rate=0.0,
    )


@router.get("/recent")
async def get_recent(db: AsyncSession = Depends(get_db)):
    # TODO: recent activity feed
    return {"recent": []}


@router.get("/timeline", response_model=list[TimelineEntry])
async def get_timeline(db: AsyncSession = Depends(get_db)):
    # TODO: applications over time
    return []
