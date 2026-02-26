import uuid

from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class Resume(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "resumes"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(1000), nullable=False)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_type: Mapped[str] = mapped_column(String(20), nullable=False)
    raw_text: Mapped[str | None] = mapped_column(Text)
    parsed_sections: Mapped[dict | None] = mapped_column(JSONB)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")

    user = relationship("User", back_populates="resumes")
    tailored_resumes = relationship("TailoredResume", back_populates="base_resume", cascade="all, delete-orphan")
