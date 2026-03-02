from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class ApplicationCreate(BaseModel):
    job_id: UUID
    cover_letter: Optional[str] = None
    form_answers: Optional[dict] = None


class ApplicationStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None


class ApplicationResponse(BaseModel):
    id: UUID
    job_id: UUID
    status: str
    cover_letter: Optional[str] = None
    form_answers: Optional[dict] = None
    automation_log: Optional[dict] = None
    submitted_at: Optional[datetime] = None
    error_message: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    # Joined from Job
    company_name: Optional[str] = None
    job_title: Optional[str] = None

    model_config = {"from_attributes": True}
