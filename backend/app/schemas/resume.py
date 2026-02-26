from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class ResumeBase(BaseModel):
    title: str


class ResumeCreate(ResumeBase):
    pass


class ResumeUpdate(BaseModel):
    title: Optional[str] = None
    parsed_sections: Optional[dict] = None


class ResumeResponse(ResumeBase):
    id: UUID
    file_name: str
    file_type: str
    is_primary: bool
    parsed_sections: Optional[dict] = None
    raw_text: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
