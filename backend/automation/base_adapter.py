from __future__ import annotations

"""Abstract base class for ATS-specific form filling adapters."""

from abc import ABC, abstractmethod
from datetime import datetime, timezone
from pathlib import Path

from playwright.async_api import Page


class BaseATSAdapter(ABC):
    """Base adapter for automating job application forms on different ATS platforms."""

    def __init__(self) -> None:
        self.log: list[dict] = []

    def log_action(self, action: str, **details: object) -> None:
        self.log.append({
            "step": len(self.log) + 1,
            "action": action,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            **details,
        })

    @abstractmethod
    async def detect(self, url: str, page: Page) -> bool:
        """Return True if this adapter can handle the given URL/page."""

    @abstractmethod
    async def fill(
        self,
        page: Page,
        url: str,
        user_data: dict,
        resume_path: Path,
        cover_letter: str | None = None,
        form_answers: dict | None = None,
    ) -> list[dict]:
        """Fill out the application form and return the action log."""

    @abstractmethod
    async def submit(self, page: Page) -> bool:
        """Click the submit button. Return True on success."""


def get_adapter(ats_platform: str) -> BaseATSAdapter:
    """Return the appropriate adapter for the given ATS platform."""
    from automation.adapters.generic import GenericAdapter
    from automation.adapters.greenhouse import GreenhouseAdapter
    from automation.adapters.lever import LeverAdapter
    from automation.adapters.linkedin import LinkedInAdapter
    from automation.adapters.workday import WorkdayAdapter

    adapters: dict[str, type[BaseATSAdapter]] = {
        "greenhouse": GreenhouseAdapter,
        "lever": LeverAdapter,
        "workday": WorkdayAdapter,
        "linkedin": LinkedInAdapter,
    }
    adapter_class = adapters.get(ats_platform, GenericAdapter)
    return adapter_class()
