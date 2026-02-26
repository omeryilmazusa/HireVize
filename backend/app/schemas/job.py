from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, HttpUrl


class JobCreate(BaseModel):
    source_url: str


class JobResponse(BaseModel):
    id: UUID
    source_url: str
    company_name: str | None = None
    job_title: str | None = None
    location: str | None = None
    salary_range: str | None = None
    description_text: str | None = None
    requirements: dict | None = None
    ats_platform: str | None = None
    scrape_status: str
    scrape_error: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
