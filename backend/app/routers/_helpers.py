"""Shared helpers for all routers."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


async def get_default_user(db: AsyncSession) -> User:
    """Get the single user, or create a default one on first access."""
    result = await db.execute(select(User).limit(1))
    user = result.scalar_one_or_none()
    if user is None:
        user = User(name="", email="user@example.com")
        db.add(user)
        await db.commit()
        await db.refresh(user)
    return user
