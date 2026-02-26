from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    preferences: Optional[dict] = None


class UserResponse(BaseModel):
    id: UUID
    name: str
    email: str
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    preferences: dict
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
