from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phones: Optional[list] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    addresses: Optional[list] = None
    candidate_answers: Optional[dict] = None
    eeo: Optional[dict] = None
    veteran_status: Optional[dict] = None
    disability_status: Optional[dict] = None
    work_authorization: Optional[str] = None
    preferences: Optional[dict] = None


class UserResponse(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    email: str
    role: str = "member"
    phones: Optional[list] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    addresses: Optional[list] = None
    candidate_answers: Optional[dict] = None
    eeo: Optional[dict] = None
    veteran_status: Optional[dict] = None
    disability_status: Optional[dict] = None
    work_authorization: Optional[str] = None
    preferences: dict
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
