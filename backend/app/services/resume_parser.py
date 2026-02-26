"""Resume parsing service: extracts text and structures sections from PDF/DOCX files."""

from pathlib import Path


async def extract_text(file_path: Path) -> str:
    """Extract raw text from a PDF or DOCX file."""
    suffix = file_path.suffix.lower()
    if suffix == ".pdf":
        return _extract_pdf_text(file_path)
    elif suffix == ".docx":
        return _extract_docx_text(file_path)
    raise ValueError(f"Unsupported file type: {suffix}")


def _extract_pdf_text(file_path: Path) -> str:
    """Extract text from PDF using pdfplumber."""
    import pdfplumber

    text_parts = []
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n\n".join(text_parts)


def _extract_docx_text(file_path: Path) -> str:
    """Extract text from DOCX using python-docx."""
    from docx import Document

    doc = Document(file_path)
    return "\n\n".join(para.text for para in doc.paragraphs if para.text.strip())


async def parse_sections(raw_text: str) -> dict:
    """Use AI to parse raw resume text into structured sections.

    Returns dict with keys: summary, experience, education, skills, certifications, projects
    """
    # TODO: call OpenAI/Claude to parse resume into structured JSON
    return {
        "summary": "",
        "experience": [],
        "education": [],
        "skills": [],
        "certifications": [],
        "projects": [],
    }
