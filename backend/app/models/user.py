from typing import Optional

from sqlalchemy import String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class User(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "users"

    first_name: Mapped[str] = mapped_column(String(255), nullable=False, server_default="")
    last_name: Mapped[str] = mapped_column(String(255), nullable=False, server_default="")
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False, server_default="")
    phones: Mapped[Optional[list]] = mapped_column(JSONB, server_default="[]", default=list)
    linkedin_url: Mapped[Optional[str]] = mapped_column(String(500))
    portfolio_url: Mapped[Optional[str]] = mapped_column(String(500))
    addresses: Mapped[Optional[list]] = mapped_column(JSONB, server_default="[]", default=list)
    candidate_answers: Mapped[Optional[dict]] = mapped_column(JSONB, server_default="{}", default=dict)
    eeo: Mapped[Optional[dict]] = mapped_column(JSONB, server_default="{}", default=dict)
    veteran_status: Mapped[Optional[dict]] = mapped_column(JSONB, server_default="{}", default=dict)
    disability_status: Mapped[Optional[dict]] = mapped_column(JSONB, server_default="{}", default=dict)
    work_authorization: Mapped[Optional[str]] = mapped_column(String(50), server_default="")
    preferences: Mapped[dict] = mapped_column(JSONB, server_default="{}", default=dict)

    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    jobs = relationship("Job", back_populates="user", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="user", cascade="all, delete-orphan")
    interviews = relationship("Interview", back_populates="user", cascade="all, delete-orphan")
