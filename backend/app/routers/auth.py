from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Response
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.auth import AuthResponse, ExtensionTokenResponse, LoginRequest, RegisterRequest

router = APIRouter(prefix="/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)


def _set_token_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,  # set True in production with HTTPS
        max_age=settings.access_token_expire_minutes * 60,
        path="/",
    )


@router.post("/register", response_model=AuthResponse, status_code=201)
async def register(
    data: RegisterRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        password_hash=pwd_context.hash(data.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = _create_access_token(str(user.id))
    _set_token_cookie(response, token)
    return user


@router.post("/login", response_model=AuthResponse)
async def login(
    data: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    if not user or not pwd_context.verify(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = _create_access_token(str(user.id))
    _set_token_cookie(response, token)
    return user


@router.post("/logout", status_code=204)
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")


EXTENSION_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days


@router.get("/me", response_model=AuthResponse)
async def get_me(user: User = Depends(get_current_user)):
    return user


@router.post("/extension-token", response_model=ExtensionTokenResponse)
async def create_extension_token(user: User = Depends(get_current_user)):
    expire = datetime.now(timezone.utc) + timedelta(minutes=EXTENSION_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": str(user.id), "exp": expire, "type": "extension"}
    token = jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)
    return ExtensionTokenResponse(token=token, expires_in=EXTENSION_TOKEN_EXPIRE_MINUTES * 60)


@router.post("/extension-login", response_model=ExtensionTokenResponse)
async def extension_login(
    data: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    if not user or not pwd_context.verify(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    expire = datetime.now(timezone.utc) + timedelta(minutes=EXTENSION_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": str(user.id), "exp": expire, "type": "extension"}
    token = jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)
    return ExtensionTokenResponse(token=token, expires_in=EXTENSION_TOKEN_EXPIRE_MINUTES * 60)
