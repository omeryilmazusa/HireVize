from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class TailorRequest(BaseModel):
    base_resume_id: UUID
    model: str | None = None


class TailoredResumeUpdate(BaseModel):
    tailored_sections: dict


class TailoredResumeResponse(BaseModel):
    id: UUID
    job_id: UUID
    base_resume_id: UUID
    tailored_sections: dict
    diff_summary: dict | None = None
    ai_model_used: str
    ai_prompt_tokens: int | None = None
    ai_completion_tokens: int | None = None
    status: str
    file_path: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class RejectRequest(BaseModel):
    regenerate: bool = False
