from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class InterviewCreate(BaseModel):
    application_id: UUID
    interview_type: str
    scheduled_at: datetime
    duration_minutes: int = 60
    location: Optional[str] = None
    interviewer_name: Optional[str] = None
    notes: Optional[str] = None


class InterviewUpdate(BaseModel):
    interview_type: Optional[str] = None
    status: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    location: Optional[str] = None
    interviewer_name: Optional[str] = None
    notes: Optional[str] = None
    feedback: Optional[str] = None
    result: Optional[str] = None


class InterviewResponse(BaseModel):
    id: UUID
    application_id: UUID
    user_id: UUID
    interview_type: str
    status: str
    scheduled_at: datetime
    duration_minutes: int
    location: Optional[str] = None
    interviewer_name: Optional[str] = None
    notes: Optional[str] = None
    feedback: Optional[str] = None
    result: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    company_name: Optional[str] = None
    job_title: Optional[str] = None

    model_config = {"from_attributes": True}
