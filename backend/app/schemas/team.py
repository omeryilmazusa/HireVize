from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class TeamCreate(BaseModel):
    name: str


class TeamResponse(BaseModel):
    id: UUID
    name: str
    created_by: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TeamMemberResponse(BaseModel):
    id: UUID
    user_id: UUID
    role: str
    joined_at: datetime
    first_name: str = ""
    last_name: str = ""
    email: str = ""

    model_config = {"from_attributes": True}


class TeamInviteCreate(BaseModel):
    email: str


class TeamInviteResponse(BaseModel):
    id: UUID
    email: str
    status: str
    token: str
    created_at: datetime
    expires_at: datetime

    model_config = {"from_attributes": True}


class MemberStats(BaseModel):
    user_id: UUID
    first_name: str
    last_name: str
    total_applications: int
    this_week: int
    response_rate: float


class TeamDashboardStats(BaseModel):
    team_name: str
    member_count: int
    total_applications: int
    this_week: int
    response_rate: float
    per_member: list[MemberStats]
