import uuid

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class Job(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "jobs"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    source_url: Mapped[str] = mapped_column(String(2000), nullable=False)
    company_name: Mapped[str | None] = mapped_column(String(500))
    job_title: Mapped[str | None] = mapped_column(String(500))
    location: Mapped[str | None] = mapped_column(String(500))
    salary_range: Mapped[str | None] = mapped_column(String(200))
    description_text: Mapped[str | None] = mapped_column(Text)
    requirements: Mapped[dict | None] = mapped_column(JSONB)
    ats_platform: Mapped[str | None] = mapped_column(String(100))
    application_url: Mapped[str | None] = mapped_column(String(2000))
    scrape_status: Mapped[str] = mapped_column(String(50), nullable=False, default="pending", server_default="pending")
    scrape_error: Mapped[str | None] = mapped_column(Text)
    raw_html: Mapped[str | None] = mapped_column(Text)

    user = relationship("User", back_populates="jobs")
    tailored_resumes = relationship("TailoredResume", back_populates="job", cascade="all, delete-orphan")
    application = relationship("Application", back_populates="job", uselist=False, cascade="all, delete-orphan")
