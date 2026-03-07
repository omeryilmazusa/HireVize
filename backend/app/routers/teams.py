import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.dependencies import get_current_user, get_db
from app.models.application import Application
from app.models.team import Team, TeamInvite, TeamMember
from app.models.user import User
from app.schemas.team import (
    MemberStats,
    TeamCreate,
    TeamDashboardStats,
    TeamInviteCreate,
    TeamInviteResponse,
    TeamMemberResponse,
    TeamResponse,
)

router = APIRouter(prefix="/teams", tags=["teams"])


def _require_team_manager(user: User) -> None:
    if user.role != "team_manager":
        raise HTTPException(status_code=403, detail="Team manager role required")


async def _get_user_team(user: User, db: AsyncSession) -> Team:
    result = await db.execute(
        select(Team)
        .join(TeamMember, TeamMember.team_id == Team.id)
        .where(TeamMember.user_id == user.id)
    )
    team = result.scalar_one_or_none()
    if not team:
        raise HTTPException(status_code=404, detail="You don't belong to a team")
    return team


@router.post("", response_model=TeamResponse, status_code=201)
async def create_team(
    data: TeamCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    _require_team_manager(user)

    # Check if user already belongs to a team
    existing = await db.execute(
        select(TeamMember).where(TeamMember.user_id == user.id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="You already belong to a team")

    team = Team(name=data.name, created_by=user.id)
    db.add(team)
    await db.flush()

    member = TeamMember(team_id=team.id, user_id=user.id, role="manager")
    db.add(member)
    await db.commit()
    await db.refresh(team)
    return team


@router.get("/my", response_model=TeamResponse)
async def get_my_team(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    _require_team_manager(user)
    team = await _get_user_team(user, db)
    return team


@router.get("/my/members", response_model=list[TeamMemberResponse])
async def list_members(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    _require_team_manager(user)
    team = await _get_user_team(user, db)

    result = await db.execute(
        select(TeamMember)
        .options(selectinload(TeamMember.user))
        .where(TeamMember.team_id == team.id)
        .order_by(TeamMember.joined_at)
    )
    members = result.scalars().all()

    return [
        TeamMemberResponse(
            id=m.id,
            user_id=m.user_id,
            role=m.role,
            joined_at=m.joined_at,
            first_name=m.user.first_name if m.user else "",
            last_name=m.user.last_name if m.user else "",
            email=m.user.email if m.user else "",
        )
        for m in members
    ]


@router.delete("/my/members/{user_id}", status_code=204)
async def remove_member(
    user_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    _require_team_manager(user)
    team = await _get_user_team(user, db)

    if user_id == user.id:
        raise HTTPException(status_code=400, detail="Cannot remove yourself from the team")

    result = await db.execute(
        select(TeamMember).where(
            TeamMember.team_id == team.id, TeamMember.user_id == user_id
        )
    )
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    await db.delete(member)
    await db.commit()


@router.post("/my/invites", response_model=TeamInviteResponse, status_code=201)
async def create_invite(
    data: TeamInviteCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    _require_team_manager(user)
    team = await _get_user_team(user, db)

    # Check if email is already a team member
    existing_member = await db.execute(
        select(TeamMember)
        .join(User, User.id == TeamMember.user_id)
        .where(TeamMember.team_id == team.id, User.email == data.email)
    )
    if existing_member.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="User is already a team member")

    # Check for existing pending invite
    existing_invite = await db.execute(
        select(TeamInvite).where(
            TeamInvite.team_id == team.id,
            TeamInvite.email == data.email,
            TeamInvite.status == "pending",
        )
    )
    if existing_invite.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Pending invite already exists for this email")

    token = str(uuid.uuid4())
    invite = TeamInvite(
        team_id=team.id,
        email=data.email,
        invited_by=user.id,
        token=token,
        expires_at=datetime.now(timezone.utc) + timedelta(days=7),
    )
    db.add(invite)
    await db.commit()
    await db.refresh(invite)
    return invite


@router.get("/my/invites", response_model=list[TeamInviteResponse])
async def list_invites(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    _require_team_manager(user)
    team = await _get_user_team(user, db)

    result = await db.execute(
        select(TeamInvite)
        .where(TeamInvite.team_id == team.id, TeamInvite.status == "pending")
        .order_by(TeamInvite.created_at.desc())
    )
    return result.scalars().all()


@router.delete("/my/invites/{invite_id}", status_code=204)
async def cancel_invite(
    invite_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    _require_team_manager(user)
    team = await _get_user_team(user, db)

    result = await db.execute(
        select(TeamInvite).where(
            TeamInvite.id == invite_id,
            TeamInvite.team_id == team.id,
            TeamInvite.status == "pending",
        )
    )
    invite = result.scalar_one_or_none()
    if not invite:
        raise HTTPException(status_code=404, detail="Invite not found")

    await db.delete(invite)
    await db.commit()


@router.get("/my/dashboard", response_model=TeamDashboardStats)
async def team_dashboard(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    _require_team_manager(user)
    team = await _get_user_team(user, db)

    # Get all team member user IDs
    members_result = await db.execute(
        select(TeamMember)
        .options(selectinload(TeamMember.user))
        .where(TeamMember.team_id == team.id)
    )
    members = members_result.scalars().all()
    member_user_ids = [m.user_id for m in members]

    if not member_user_ids:
        return TeamDashboardStats(
            team_name=team.name,
            member_count=0,
            total_applications=0,
            this_week=0,
            response_rate=0.0,
            per_member=[],
        )

    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)

    # Total applications across team
    total_result = await db.execute(
        select(func.count(Application.id)).where(
            Application.user_id.in_(member_user_ids)
        )
    )
    total_applications = total_result.scalar() or 0

    # This week across team
    week_result = await db.execute(
        select(func.count(Application.id)).where(
            Application.user_id.in_(member_user_ids),
            Application.created_at >= week_ago,
        )
    )
    this_week = week_result.scalar() or 0

    # Response rate across team
    responded_statuses = {"interviewing", "rejected", "offered", "accepted"}
    status_result = await db.execute(
        select(Application.status, func.count(Application.id))
        .where(Application.user_id.in_(member_user_ids))
        .group_by(Application.status)
    )
    by_status = {row[0]: row[1] for row in status_result.all()}
    responded = sum(by_status.get(s, 0) for s in responded_statuses)
    response_rate = (responded / total_applications * 100) if total_applications > 0 else 0.0

    # Per-member breakdown
    per_member = []
    for m in members:
        m_total_result = await db.execute(
            select(func.count(Application.id)).where(Application.user_id == m.user_id)
        )
        m_total = m_total_result.scalar() or 0

        m_week_result = await db.execute(
            select(func.count(Application.id)).where(
                Application.user_id == m.user_id,
                Application.created_at >= week_ago,
            )
        )
        m_week = m_week_result.scalar() or 0

        m_status_result = await db.execute(
            select(Application.status, func.count(Application.id))
            .where(Application.user_id == m.user_id)
            .group_by(Application.status)
        )
        m_by_status = {row[0]: row[1] for row in m_status_result.all()}
        m_responded = sum(m_by_status.get(s, 0) for s in responded_statuses)
        m_rate = (m_responded / m_total * 100) if m_total > 0 else 0.0

        per_member.append(
            MemberStats(
                user_id=m.user_id,
                first_name=m.user.first_name if m.user else "",
                last_name=m.user.last_name if m.user else "",
                total_applications=m_total,
                this_week=m_week,
                response_rate=round(m_rate, 1),
            )
        )

    return TeamDashboardStats(
        team_name=team.name,
        member_count=len(members),
        total_applications=total_applications,
        this_week=this_week,
        response_rate=round(response_rate, 1),
        per_member=per_member,
    )
