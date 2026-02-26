from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ApplicationCreate(BaseModel):
    job_id: UUID
    tailored_resume_id: UUID | None = None
    cover_letter: str | None = None
    form_answers: dict | None = None


class ApplicationStatusUpdate(BaseModel):
    status: str
    notes: str | None = None


class ApplicationResponse(BaseModel):
    id: UUID
    job_id: UUID
    tailored_resume_id: UUID | None = None
    status: str
    cover_letter: str | None = None
    form_answers: dict | None = None
    automation_log: dict | None = None
    submitted_at: datetime | None = None
    error_message: str | None = None
    notes: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
