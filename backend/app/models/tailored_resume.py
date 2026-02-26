import uuid

from sqlalchemy import ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class TailoredResume(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "tailored_resumes"
    __table_args__ = (
        UniqueConstraint("job_id", "base_resume_id", name="uq_tailored_per_job_base"),
    )

    job_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("jobs.id"), nullable=False)
    base_resume_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("resumes.id"), nullable=False)
    tailored_sections: Mapped[dict] = mapped_column(JSONB, nullable=False)
    diff_summary: Mapped[dict | None] = mapped_column(JSONB)
    ai_model_used: Mapped[str] = mapped_column(String(100), nullable=False)
    ai_prompt_tokens: Mapped[int | None] = mapped_column(Integer)
    ai_completion_tokens: Mapped[int | None] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="draft", server_default="draft")
    file_path: Mapped[str | None] = mapped_column(String(1000))

    job = relationship("Job", back_populates="tailored_resumes")
    base_resume = relationship("Resume", back_populates="tailored_resumes")
    application = relationship("Application", back_populates="tailored_resume", uselist=False)
