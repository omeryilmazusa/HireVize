from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_applications: int
    by_status: dict[str, int]
    this_week: int
    this_month: int
    response_rate: float


class RecentApplication(BaseModel):
    id: UUID
    status: str
    created_at: datetime
    company_name: Optional[str] = None
    job_title: Optional[str] = None


class TimelineEntry(BaseModel):
    date: str
    count: int
