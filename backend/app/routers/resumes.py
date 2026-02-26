from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.schemas.resume import ResumeResponse, ResumeUpdate

router = APIRouter(prefix="/resumes", tags=["resumes"])


@router.get("", response_model=list[ResumeResponse])
async def list_resumes(db: AsyncSession = Depends(get_db)):
    # TODO: query all resumes
    return []


@router.post("", response_model=ResumeResponse, status_code=201)
async def upload_resume(
    file: UploadFile = File(...),
    title: str = Form(...),
    db: AsyncSession = Depends(get_db),
):
    # TODO: save file, parse, create record
    pass


@router.get("/{resume_id}", response_model=ResumeResponse)
async def get_resume(resume_id: UUID, db: AsyncSession = Depends(get_db)):
    # TODO: fetch by id
    pass


@router.put("/{resume_id}", response_model=ResumeResponse)
async def update_resume(resume_id: UUID, data: ResumeUpdate, db: AsyncSession = Depends(get_db)):
    # TODO: update title or parsed_sections
    pass


@router.delete("/{resume_id}", status_code=204)
async def delete_resume(resume_id: UUID, db: AsyncSession = Depends(get_db)):
    # TODO: delete record + file
    pass


@router.post("/{resume_id}/reparse", response_model=ResumeResponse)
async def reparse_resume(resume_id: UUID, db: AsyncSession = Depends(get_db)):
    # TODO: re-trigger AI section parsing
    pass


@router.put("/{resume_id}/primary", response_model=ResumeResponse)
async def set_primary(resume_id: UUID, db: AsyncSession = Depends(get_db)):
    # TODO: set as primary, unset others
    pass
