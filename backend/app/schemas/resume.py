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


class ResumeResponse(ResumeBase):
    id: UUID
    file_name: str
    file_type: str
    is_primary: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
