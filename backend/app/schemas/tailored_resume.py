from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class TailorRequest(BaseModel):
    base_resume_id: UUID
    model: Optional[str] = None


class TailoredResumeUpdate(BaseModel):
    tailored_sections: dict


class TailoredResumeResponse(BaseModel):
    id: UUID
    job_id: UUID
    base_resume_id: UUID
    tailored_sections: dict
    diff_summary: Optional[dict] = None
    ai_model_used: str
    ai_prompt_tokens: Optional[int] = None
    ai_completion_tokens: Optional[int] = None
    status: str
    file_path: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class RejectRequest(BaseModel):
    regenerate: bool = False
