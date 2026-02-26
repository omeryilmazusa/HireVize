from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class JobCreate(BaseModel):
    source_url: str


class JobResponse(BaseModel):
    id: UUID
    source_url: str
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    location: Optional[str] = None
    salary_range: Optional[str] = None
    description_text: Optional[str] = None
    requirements: Optional[dict] = None
    ats_platform: Optional[str] = None
    scrape_status: str
    scrape_error: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
