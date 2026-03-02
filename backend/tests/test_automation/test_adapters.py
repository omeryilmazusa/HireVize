"""Tests for ATS platform adapters and adapter registry."""

from __future__ import annotations

from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import pytest_asyncio

from automation.adapters.generic import GenericAdapter
from automation.adapters.greenhouse import GreenhouseAdapter
from automation.adapters.lever import LeverAdapter
from automation.adapters.linkedin import LinkedInAdapter
from automation.adapters.workday import WorkdayAdapter
from automation.base_adapter import get_adapter
from automation.utils.selectors import (
    GREENHOUSE_SELECTORS,
    LEVER_SELECTORS,
    LINKEDIN_SELECTORS,
    WORKDAY_SELECTORS,
)


# ---------------------------------------------------------------------------
# Selector constants
# ---------------------------------------------------------------------------


class TestSelectors:
    def test_greenhouse_selectors_has_required_keys(self):
        for key in ("first_name", "last_name", "email", "phone", "resume", "submit"):
            assert key in GREENHOUSE_SELECTORS

    def test_lever_selectors_has_required_keys(self):
        for key in ("name", "email", "phone", "resume", "submit"):
            assert key in LEVER_SELECTORS

    def test_workday_selectors_has_required_keys(self):
        for key in (
            "apply", "first_name", "last_name", "email", "phone",
            "address_line1", "city", "state", "zip", "resume", "submit",
        ):
            assert key in WORKDAY_SELECTORS

    def test_linkedin_selectors_has_required_keys(self):
        for key in ("easy_apply", "resume", "phone", "submit", "next", "review", "done", "dismiss"):
            assert key in LINKEDIN_SELECTORS


# ---------------------------------------------------------------------------
# get_adapter registry
# ---------------------------------------------------------------------------


class TestGetAdapter:
    def test_greenhouse(self):
        adapter = get_adapter("greenhouse")
        assert isinstance(adapter, GreenhouseAdapter)

    def test_lever(self):
        adapter = get_adapter("lever")
        assert isinstance(adapter, LeverAdapter)

    def test_workday(self):
        adapter = get_adapter("workday")
        assert isinstance(adapter, WorkdayAdapter)

    def test_linkedin(self):
        adapter = get_adapter("linkedin")
        assert isinstance(adapter, LinkedInAdapter)

    def test_unknown_falls_back_to_generic(self):
        adapter = get_adapter("unknown")
        assert isinstance(adapter, GenericAdapter)

    def test_empty_string_falls_back_to_generic(self):
        adapter = get_adapter("")
        assert isinstance(adapter, GenericAdapter)

    def test_each_adapter_starts_with_empty_log(self):
        for platform in ("greenhouse", "lever", "workday", "linkedin", "unknown"):
            adapter = get_adapter(platform)
            assert adapter.log == []


# ---------------------------------------------------------------------------
# detect() methods
# ---------------------------------------------------------------------------


class TestDetect:
    @pytest.mark.asyncio
    async def test_greenhouse_detect_boards(self):
        adapter = GreenhouseAdapter()
        assert await adapter.detect("https://boards.greenhouse.io/acme/jobs/1", AsyncMock())

    @pytest.mark.asyncio
    async def test_greenhouse_detect_greenhouse_io(self):
        adapter = GreenhouseAdapter()
        assert await adapter.detect("https://app.greenhouse.io/x", AsyncMock())

    @pytest.mark.asyncio
    async def test_greenhouse_reject_other(self):
        adapter = GreenhouseAdapter()
        assert not await adapter.detect("https://example.com", AsyncMock())

    @pytest.mark.asyncio
    async def test_lever_detect_lever_co(self):
        adapter = LeverAdapter()
        assert await adapter.detect("https://jobs.lever.co/acme/abc", AsyncMock())

    @pytest.mark.asyncio
    async def test_lever_reject_other(self):
        adapter = LeverAdapter()
        assert not await adapter.detect("https://example.com", AsyncMock())

    @pytest.mark.asyncio
    async def test_workday_detect_myworkdayjobs(self):
        adapter = WorkdayAdapter()
        assert await adapter.detect("https://acme.wd5.myworkdayjobs.com/en-US/jobs/1", AsyncMock())

    @pytest.mark.asyncio
    async def test_workday_detect_workday_keyword(self):
        adapter = WorkdayAdapter()
        assert await adapter.detect("https://acme.workday.com/jobs/1", AsyncMock())

    @pytest.mark.asyncio
    async def test_workday_reject_other(self):
        adapter = WorkdayAdapter()
        assert not await adapter.detect("https://example.com", AsyncMock())

    @pytest.mark.asyncio
    async def test_linkedin_detect(self):
        adapter = LinkedInAdapter()
        assert await adapter.detect("https://www.linkedin.com/jobs/view/123", AsyncMock())

    @pytest.mark.asyncio
    async def test_linkedin_reject_other(self):
        adapter = LinkedInAdapter()
        assert not await adapter.detect("https://example.com", AsyncMock())

    @pytest.mark.asyncio
    async def test_generic_detect_always_true(self):
        adapter = GenericAdapter()
        assert await adapter.detect("https://anything.com", AsyncMock())


# ---------------------------------------------------------------------------
# log_action
# ---------------------------------------------------------------------------


class TestLogAction:
    def test_log_action_increments_step(self):
        adapter = get_adapter("greenhouse")
        adapter.log_action("a")
        adapter.log_action("b")
        assert adapter.log[0]["step"] == 1
        assert adapter.log[1]["step"] == 2

    def test_log_action_includes_details(self):
        adapter = get_adapter("lever")
        adapter.log_action("fill", field="email", success=True)
        entry = adapter.log[0]
        assert entry["action"] == "fill"
        assert entry["field"] == "email"
        assert entry["success"] is True
        assert "timestamp" in entry


# ---------------------------------------------------------------------------
# Helpers for building mock Playwright pages
# ---------------------------------------------------------------------------


def _make_mock_page() -> MagicMock:
    """Return a MagicMock that behaves like a Playwright Page for adapter tests."""
    page = AsyncMock()
    page.goto = AsyncMock()
    page.wait_for_timeout = AsyncMock()
    page.wait_for_load_state = AsyncMock()
    page.inner_text = AsyncMock(return_value="")
    page.content = AsyncMock(return_value="<html></html>")

    # Default locator: returns an element that is NOT visible
    default_el = AsyncMock()
    default_el.is_visible = AsyncMock(return_value=False)
    default_el.count = AsyncMock(return_value=0)

    page.locator = MagicMock(return_value=default_el)
    # Also make .first resolve to the same mock
    default_el.first = default_el

    page.query_selector = AsyncMock(return_value=None)

    return page


def _make_visible_locator(page: MagicMock, selector: str, **attrs) -> AsyncMock:
    """Register a locator on the mock page that is visible."""
    el = AsyncMock()
    el.is_visible = AsyncMock(return_value=True)
    el.first = el
    el.fill = AsyncMock()
    el.click = AsyncMock()
    el.set_input_files = AsyncMock()
    el.inner_text = AsyncMock(return_value=attrs.get("text", "Submit"))
    el.input_value = AsyncMock(return_value=attrs.get("value", ""))
    el.count = AsyncMock(return_value=1)
    el.get_attribute = AsyncMock(return_value=attrs.get("for_id"))

    original_locator = page.locator

    def smart_locator(sel):
        if sel == selector:
            return el
        return original_locator(sel)

    page.locator = MagicMock(side_effect=smart_locator)
    return el


# ---------------------------------------------------------------------------
# Greenhouse fill / submit
# ---------------------------------------------------------------------------


class TestGreenhouseAdapter:
    @pytest.mark.asyncio
    async def test_fill_navigates_to_url(self):
        adapter = GreenhouseAdapter()
        page = _make_mock_page()
        await adapter.fill(page, "https://boards.greenhouse.io/acme/jobs/1", {}, Path("/tmp/r.pdf"))
        page.goto.assert_called_once()

    @pytest.mark.asyncio
    async def test_fill_logs_actions(self):
        adapter = GreenhouseAdapter()
        page = _make_mock_page()
        log = await adapter.fill(
            page,
            "https://boards.greenhouse.io/acme/jobs/1",
            {"first_name": "Jane", "email": "j@e.com"},
            Path("/tmp/r.pdf"),
        )
        assert len(log) > 0
        assert log[0]["action"] == "navigate"

    @pytest.mark.asyncio
    async def test_submit_returns_false_when_no_button(self):
        adapter = GreenhouseAdapter()
        page = _make_mock_page()
        result = await adapter.submit(page)
        assert result is False


# ---------------------------------------------------------------------------
# Lever fill / submit
# ---------------------------------------------------------------------------


class TestLeverAdapter:
    @pytest.mark.asyncio
    async def test_fill_navigates_to_url(self):
        adapter = LeverAdapter()
        page = _make_mock_page()
        await adapter.fill(page, "https://jobs.lever.co/acme/abc", {}, Path("/tmp/r.pdf"))
        page.goto.assert_called_once()

    @pytest.mark.asyncio
    async def test_fill_logs_navigate(self):
        adapter = LeverAdapter()
        page = _make_mock_page()
        log = await adapter.fill(page, "https://jobs.lever.co/acme/abc", {}, Path("/tmp/r.pdf"))
        assert log[0]["action"] == "navigate"

    @pytest.mark.asyncio
    async def test_submit_returns_false_when_no_button(self):
        adapter = LeverAdapter()
        page = _make_mock_page()
        result = await adapter.submit(page)
        assert result is False


# ---------------------------------------------------------------------------
# Workday fill / submit
# ---------------------------------------------------------------------------


class TestWorkdayAdapter:
    @pytest.mark.asyncio
    async def test_fill_navigates_to_url(self):
        adapter = WorkdayAdapter()
        page = _make_mock_page()
        await adapter.fill(
            page,
            "https://acme.wd5.myworkdayjobs.com/en-US/jobs/1",
            {},
            Path("/tmp/r.pdf"),
        )
        page.goto.assert_called_once()

    @pytest.mark.asyncio
    async def test_fill_logs_navigate(self):
        adapter = WorkdayAdapter()
        page = _make_mock_page()
        log = await adapter.fill(
            page,
            "https://acme.wd5.myworkdayjobs.com/en-US/jobs/1",
            {"first_name": "Jane"},
            Path("/tmp/r.pdf"),
        )
        assert log[0]["action"] == "navigate"

    @pytest.mark.asyncio
    async def test_submit_returns_false_when_no_button(self):
        adapter = WorkdayAdapter()
        page = _make_mock_page()
        result = await adapter.submit(page)
        assert result is False


# ---------------------------------------------------------------------------
# LinkedIn fill / submit
# ---------------------------------------------------------------------------


class TestLinkedInAdapter:
    @pytest.mark.asyncio
    async def test_fill_navigates_to_url(self):
        adapter = LinkedInAdapter()
        page = _make_mock_page()
        await adapter.fill(
            page,
            "https://www.linkedin.com/jobs/view/123",
            {},
            Path("/tmp/r.pdf"),
        )
        page.goto.assert_called_once()

    @pytest.mark.asyncio
    async def test_fill_logs_login_wall_when_detected(self):
        adapter = LinkedInAdapter()
        page = _make_mock_page()
        # Simulate login wall: locator for login form is visible
        login_el = AsyncMock()
        login_el.is_visible = AsyncMock(return_value=True)
        login_el.first = login_el

        original_locator = page.locator

        def locator_side_effect(sel):
            if "session_key" in sel or "login" in sel:
                return login_el
            return original_locator(sel)

        page.locator = MagicMock(side_effect=locator_side_effect)

        log = await adapter.fill(
            page,
            "https://www.linkedin.com/jobs/view/123",
            {},
            Path("/tmp/r.pdf"),
        )
        actions = [e["action"] for e in log]
        assert "login_wall" in actions

    @pytest.mark.asyncio
    async def test_submit_returns_false_when_no_button(self):
        adapter = LinkedInAdapter()
        page = _make_mock_page()
        result = await adapter.submit(page)
        assert result is False


# ---------------------------------------------------------------------------
# GenericAdapter
# ---------------------------------------------------------------------------


class TestGenericAdapter:
    @pytest.mark.asyncio
    async def test_fill_navigates_to_url(self):
        adapter = GenericAdapter()
        page = _make_mock_page()
        await adapter.fill(page, "https://example.com/apply", {}, Path("/tmp/r.pdf"))
        page.goto.assert_called_once()

    @pytest.mark.asyncio
    async def test_submit_returns_false_when_no_button(self):
        adapter = GenericAdapter()
        page = _make_mock_page()
        result = await adapter.submit(page)
        assert result is False
