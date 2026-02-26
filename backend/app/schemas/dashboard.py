from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_applications: int
    by_status: dict[str, int]
    this_week: int
    this_month: int
    response_rate: float


class TimelineEntry(BaseModel):
    date: str
    count: int
