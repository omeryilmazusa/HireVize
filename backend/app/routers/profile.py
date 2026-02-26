from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.routers._helpers import get_default_user
from app.schemas.user import UserResponse, UserUpdate

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("", response_model=UserResponse)
async def get_profile(db: AsyncSession = Depends(get_db)):
    user = await get_default_user(db)
    return user


@router.put("", response_model=UserResponse)
async def update_profile(data: UserUpdate, db: AsyncSession = Depends(get_db)):
    user = await get_default_user(db)
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    await db.commit()
    await db.refresh(user)
    return user
