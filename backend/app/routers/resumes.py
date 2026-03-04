from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_user, get_db
from app.models.resume import Resume
from app.models.user import User
from app.schemas.resume import ResumeResponse, ResumeUpdate
from app.utils.file_storage import delete_file, get_file_path, save_file

router = APIRouter(prefix="/resumes", tags=["resumes"])


@router.get("", response_model=list[ResumeResponse])
async def list_resumes(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Resume).where(Resume.user_id == user.id).order_by(Resume.created_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=ResumeResponse, status_code=201)
async def upload_resume(
    file: UploadFile = File(...),
    title: str = Form(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):

    file_bytes = await file.read()
    extension = file.filename.rsplit(".", 1)[-1].lower() if file.filename else "pdf"
    relative_path = await save_file(file_bytes, "resumes", extension)

    resume = Resume(
        user_id=user.id,
        title=title,
        file_path=relative_path,
        file_name=file.filename or "resume.pdf",
        file_type=extension,
        is_primary=False,
    )
    db.add(resume)
    await db.commit()
    await db.refresh(resume)
    return resume


@router.get("/{resume_id}", response_model=ResumeResponse)
async def get_resume(
    resume_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Resume).where(Resume.id == resume_id, Resume.user_id == user.id)
    )
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume


@router.get("/{resume_id}/download")
async def download_resume(
    resume_id: UUID,
    user: User = Depends(get_current_user),
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
        raise HTTPException(status_code=404, detail="File not found on disk")

    media_type = "application/pdf" if resume.file_type == "pdf" else "application/octet-stream"
    return FileResponse(
        path=str(abs_path),
        media_type=media_type,
        headers={"Content-Disposition": f'inline; filename="{resume.file_name}"'},
    )


@router.put("/{resume_id}", response_model=ResumeResponse)
async def update_resume(
    resume_id: UUID,
    data: ResumeUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Resume).where(Resume.id == resume_id, Resume.user_id == user.id)
    )
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
async def delete_resume(
    resume_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Resume).where(Resume.id == resume_id, Resume.user_id == user.id)
    )
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    await delete_file(resume.file_path)
    await db.delete(resume)
    await db.commit()


@router.put("/{resume_id}/primary", response_model=ResumeResponse)
async def set_primary(
    resume_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Resume).where(Resume.id == resume_id, Resume.user_id == user.id)
    )
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    # Unset all other resumes as primary for this user
    all_result = await db.execute(select(Resume).where(Resume.user_id == user.id))
    for r in all_result.scalars().all():
        r.is_primary = False

    resume.is_primary = True
    await db.commit()
    await db.refresh(resume)
    return resume
