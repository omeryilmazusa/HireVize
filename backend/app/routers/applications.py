from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.schemas.application import ApplicationCreate, ApplicationResponse, ApplicationStatusUpdate

router = APIRouter(prefix="/applications", tags=["applications"])


@router.get("", response_model=list[ApplicationResponse])
async def list_applications(
    status: str | None = Query(None),
    sort: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    # TODO: query with filters + sorting
    return []


@router.post("", response_model=ApplicationResponse, status_code=201)
async def create_application(data: ApplicationCreate, db: AsyncSession = Depends(get_db)):
    # TODO: create application record
    pass


@router.get("/{application_id}", response_model=ApplicationResponse)
async def get_application(application_id: UUID, db: AsyncSession = Depends(get_db)):
    # TODO: fetch by id with automation log
    pass


@router.post("/{application_id}/submit", response_model=ApplicationResponse, status_code=202)
async def submit_application(application_id: UUID, db: AsyncSession = Depends(get_db)):
    # TODO: enqueue Playwright submission task
    pass


@router.put("/{application_id}/status", response_model=ApplicationResponse)
async def update_status(
    application_id: UUID, data: ApplicationStatusUpdate, db: AsyncSession = Depends(get_db)
):
    # TODO: manually update status
    pass


@router.delete("/{application_id}", status_code=204)
async def delete_application(application_id: UUID, db: AsyncSession = Depends(get_db)):
    # TODO: delete application
    pass
