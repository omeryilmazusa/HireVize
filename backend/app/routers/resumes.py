from pathlib import Path
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.models.resume import Resume
from app.routers._helpers import get_default_user
from app.schemas.resume import ResumeResponse, ResumeUpdate
from app.services.resume_parser import extract_text
from app.utils.file_storage import delete_file, get_file_path, save_file

router = APIRouter(prefix="/resumes", tags=["resumes"])


@router.get("", response_model=list[ResumeResponse])
async def list_resumes(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Resume).order_by(Resume.created_at.desc()))
    return result.scalars().all()


@router.post("", response_model=ResumeResponse, status_code=201)
async def upload_resume(
    file: UploadFile = File(...),
    title: str = Form(...),
    db: AsyncSession = Depends(get_db),
):
    user = await get_default_user(db)

    file_bytes = await file.read()
    extension = file.filename.rsplit(".", 1)[-1].lower() if file.filename else "pdf"
    relative_path = await save_file(file_bytes, "resumes", extension)

    # Extract text from the uploaded file
    raw_text = ""
    try:
        abs_path = get_file_path(relative_path)
        raw_text = await extract_text(abs_path)
    except Exception:
        pass  # text extraction is best-effort

    resume = Resume(
        user_id=user.id,
        title=title,
        file_path=relative_path,
        file_name=file.filename or "resume",
        file_type=extension,
        raw_text=raw_text,
        parsed_sections=None,
        is_primary=False,
    )
    db.add(resume)
    await db.commit()
    await db.refresh(resume)
    return resume


@router.get("/{resume_id}", response_model=ResumeResponse)
async def get_resume(resume_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Resume).where(Resume.id == resume_id))
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume


@router.put("/{resume_id}", response_model=ResumeResponse)
async def update_resume(resume_id: UUID, data: ResumeUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Resume).where(Resume.id == resume_id))
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(resume, field, value)
    await db.commit()
    await db.refresh(resume)
    return resume


@router.delete("/{resume_id}", status_code=204)
async def delete_resume(resume_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Resume).where(Resume.id == resume_id))
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    await delete_file(resume.file_path)
    await db.delete(resume)
    await db.commit()


@router.post("/{resume_id}/reparse", response_model=ResumeResponse)
async def reparse_resume(resume_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Resume).where(Resume.id == resume_id))
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    try:
        abs_path = get_file_path(resume.file_path)
        resume.raw_text = await extract_text(abs_path)
    except Exception:
        pass

    await db.commit()
    await db.refresh(resume)
    return resume


@router.put("/{resume_id}/primary", response_model=ResumeResponse)
async def set_primary(resume_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Resume).where(Resume.id == resume_id))
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    # Unset all other resumes as primary
    all_result = await db.execute(select(Resume).where(Resume.user_id == resume.user_id))
    for r in all_result.scalars().all():
        r.is_primary = False

    resume.is_primary = True
    await db.commit()
    await db.refresh(resume)
    return resume
