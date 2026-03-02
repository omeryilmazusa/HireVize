"""Tests for the refactored auto_applier service (adapter delegation)."""

from __future__ import annotations

from app.services.auto_applier import _is_success_page
from app.services.job_scraper import detect_ats_platform


class TestIsSuccessPage:
    def test_thank_you(self):
        assert _is_success_page("Thank you for applying!")

    def test_application_submitted(self):
        assert _is_success_page("Your application has been submitted.")

    def test_successfully_submitted(self):
        assert _is_success_page("Your application was successfully submitted.")

    def test_thanks_for_applying(self):
        assert _is_success_page("Thanks for applying to Acme Corp!")

    def test_we_have_received(self):
        assert _is_success_page("We have received your application and will review it.")

    def test_you_have_successfully_applied(self):
        assert _is_success_page("You have successfully applied for this position.")

    def test_case_insensitive(self):
        assert _is_success_page("APPLICATION RECEIVED")

    def test_no_match(self):
        assert not _is_success_page("Please fill out the form below.")

    def test_empty_string(self):
        assert not _is_success_page("")

    def test_job_description_page(self):
        assert not _is_success_page("We are looking for a senior engineer. Apply now!")


class TestDetectAtsPlatform:
    def test_greenhouse_boards(self):
        assert detect_ats_platform("https://boards.greenhouse.io/acme/jobs/1", "") == "greenhouse"

    def test_greenhouse_io(self):
        assert detect_ats_platform("https://app.greenhouse.io/x", "") == "greenhouse"

    def test_lever_co(self):
        assert detect_ats_platform("https://jobs.lever.co/acme/abc", "") == "lever"

    def test_lever_alt(self):
        assert detect_ats_platform("https://acme.lever.co/abc", "") == "lever"

    def test_workday_myworkdayjobs(self):
        assert detect_ats_platform("https://acme.wd5.myworkdayjobs.com/en-US/jobs/1", "") == "workday"

    def test_workday_keyword(self):
        assert detect_ats_platform("https://acme.workday.com/job/1", "") == "workday"

    def test_linkedin(self):
        assert detect_ats_platform("https://www.linkedin.com/jobs/view/123", "") == "linkedin"

    def test_linkedin_no_www(self):
        assert detect_ats_platform("https://linkedin.com/jobs/view/123", "") == "linkedin"

    def test_unknown(self):
        assert detect_ats_platform("https://example.com/careers", "") == "unknown"

    def test_case_insensitive(self):
        assert detect_ats_platform("https://BOARDS.GREENHOUSE.IO/acme", "") == "greenhouse"
