"""Extension API endpoints — used by the Hirevize Chrome Extension."""

from __future__ import annotations

import io
import zipfile
from pathlib import Path
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.dependencies import get_current_user_bearer, get_db
from app.models.application import Application
from app.models.resume import Resume
from app.models.user import User
from app.utils.file_storage import get_file_path

router = APIRouter(prefix="/extension", tags=["extension"])

EXTENSION_DIST_DIR = Path(__file__).resolve().parents[3] / "extension" / "dist"


@router.get("/download")
async def download_extension():
    """Zip the extension/dist/ folder on-the-fly and return it."""
    if not EXTENSION_DIST_DIR.is_dir():
        raise HTTPException(status_code=404, detail="Extension build not found")

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for file in EXTENSION_DIST_DIR.rglob("*"):
            if file.is_file():
                zf.write(file, file.relative_to(EXTENSION_DIST_DIR))
    buf.seek(0)

    return StreamingResponse(
        buf,
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=hirevize-extension.zip"},
    )


class ExtensionProfileResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: str
    phone: str
    street: str
    city: str
    state: str
    zip: str
    linkedin: str
    portfolio: str
    gender: str
    race: str
    veteran: str
    disability: str
    candidate_answers: dict
    work_authorization: str
    resume_id: Optional[str] = None
    resume_name: Optional[str] = None


class AutofillLogRequest(BaseModel):
    application_id: Optional[UUID] = None
    url: str = ""
    platform: str = ""
    entries: list[dict]
    fields_filled: int = 0
    status: str = "completed"


class AutofillLogResponse(BaseModel):
    ok: bool


@router.get("/profile", response_model=ExtensionProfileResponse)
async def get_extension_profile(
    user: User = Depends(get_current_user_bearer),
    db: AsyncSession = Depends(get_db),
):
    address = (user.addresses or [{}])[0] if user.addresses else {}
    phone_raw = (user.phones or [""])[0] if user.phones else ""
    phone = phone_raw if isinstance(phone_raw, str) else phone_raw.get("number", "")
    # Ensure phone has country code (default to +1 US)
    if phone and not phone.startswith("+"):
        phone = "+1" + phone.lstrip("1")
    eeo = user.eeo or {}
    veteran = user.veteran_status or {}
    disability = user.disability_status or {}

    # Find the primary resume (or the most recent one)
    resume_result = await db.execute(
        select(Resume)
        .where(Resume.user_id == user.id)
        .order_by(Resume.is_primary.desc(), Resume.created_at.desc())
        .limit(1)
    )
    resume = resume_result.scalar_one_or_none()

    return ExtensionProfileResponse(
        id=str(user.id),
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        phone=phone,
        street=address.get("street", ""),
        city=address.get("city", ""),
        state=address.get("state", ""),
        zip=address.get("zip", ""),
        linkedin=user.linkedin_url or "",
        portfolio=user.portfolio_url or "",
        gender=eeo.get("gender", ""),
        race=eeo.get("race", ""),
        veteran=veteran.get("status", ""),
        disability=disability.get("status", ""),
        candidate_answers=user.candidate_answers or {},
        work_authorization=user.work_authorization or "",
        resume_id=str(resume.id) if resume else None,
        resume_name=resume.file_name if resume else None,
    )


@router.get("/resume/{resume_id}/download")
async def download_resume_for_extension(
    resume_id: UUID,
    user: User = Depends(get_current_user_bearer),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Resume).where(Resume.id == resume_id, Resume.user_id == user.id)
    )
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    abs_path = get_file_path(resume.file_path)
    if not abs_path.exists():
        raise HTTPException(status_code=404, detail="Resume file not found on disk")

    media_type = "application/pdf" if resume.file_type == "pdf" else "application/octet-stream"
    return FileResponse(
        path=str(abs_path),
        filename=resume.file_name,
        media_type=media_type,
    )


@router.post("/autofill-log", response_model=AutofillLogResponse)
async def post_autofill_log(
    data: AutofillLogRequest,
    user: User = Depends(get_current_user_bearer),
    db: AsyncSession = Depends(get_db),
):
    if data.application_id is not None:
        result = await db.execute(
            select(Application).where(
                Application.id == data.application_id,
                Application.user_id == user.id,
            )
        )
        application = result.scalar_one_or_none()
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")

        application.automation_log = {
            "source": "extension",
            "fields_filled": data.fields_filled,
            "status": data.status,
            "entries": data.entries,
            "url": data.url,
            "platform": data.platform,
        }
        await db.commit()

    return AutofillLogResponse(ok=True)
