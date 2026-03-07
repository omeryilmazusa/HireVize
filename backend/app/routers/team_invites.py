from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_user, get_db
from app.models.team import TeamInvite, TeamMember
from app.models.user import User

router = APIRouter(prefix="/invites", tags=["team-invites"])


@router.post("/{token}/accept", status_code=200)
async def accept_invite(
    token: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(TeamInvite).where(TeamInvite.token == token, TeamInvite.status == "pending")
    )
    invite = result.scalar_one_or_none()
    if not invite:
        raise HTTPException(status_code=404, detail="Invite not found or already used")

    if invite.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=410, detail="Invite has expired")

    if invite.email != user.email:
        raise HTTPException(status_code=403, detail="This invite is for a different email address")

    # Check if user already belongs to a team
    existing = await db.execute(
        select(TeamMember).where(TeamMember.user_id == user.id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="You already belong to a team")

    member = TeamMember(team_id=invite.team_id, user_id=user.id, role="member")
    db.add(member)

    invite.status = "accepted"
    await db.commit()

    return {"detail": "Invite accepted"}


@router.post("/{token}/decline", status_code=200)
async def decline_invite(
    token: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(TeamInvite).where(TeamInvite.token == token, TeamInvite.status == "pending")
    )
    invite = result.scalar_one_or_none()
    if not invite:
        raise HTTPException(status_code=404, detail="Invite not found or already used")

    invite.status = "declined"
    await db.commit()

    return {"detail": "Invite declined"}
