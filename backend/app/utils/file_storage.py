"""Local file storage utility with an S3-swappable interface."""

import uuid
from pathlib import Path

import aiofiles

from app.config import settings


def _storage_root() -> Path:
    return Path(settings.storage_path)


async def save_file(file_bytes: bytes, directory: str, extension: str) -> str:
    """Save a file to local storage and return the relative path.

    Args:
        file_bytes: raw file content
        directory: subdirectory (e.g. "resumes", "tailored")
        extension: file extension without dot (e.g. "pdf", "docx")

    Returns:
        Relative path like "resumes/abc123.pdf"
    """
    file_id = str(uuid.uuid4())
    filename = f"{file_id}.{extension}"
    dir_path = _storage_root() / directory
    dir_path.mkdir(parents=True, exist_ok=True)
    file_path = dir_path / filename

    async with aiofiles.open(file_path, "wb") as f:
        await f.write(file_bytes)

    return f"{directory}/{filename}"


def get_file_path(relative_path: str) -> Path:
    """Get the absolute path for a stored file."""
    return _storage_root() / relative_path


async def delete_file(relative_path: str) -> None:
    """Delete a file from storage."""
    path = get_file_path(relative_path)
    if path.exists():
        path.unlink()
