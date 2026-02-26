import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class Application(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "applications"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    job_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("jobs.id"), nullable=False, unique=True)
    tailored_resume_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tailored_resumes.id")
    )
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="pending", server_default="pending")
    cover_letter: Mapped[str | None] = mapped_column(Text)
    form_answers: Mapped[dict | None] = mapped_column(JSONB)
    automation_log: Mapped[dict | None] = mapped_column(JSONB)
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    error_message: Mapped[str | None] = mapped_column(Text)
    notes: Mapped[str | None] = mapped_column(Text)

    user = relationship("User", back_populates="applications")
    job = relationship("Job", back_populates="application")
    tailored_resume = relationship("TailoredResume", back_populates="application")
