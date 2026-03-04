import type { UserProfile } from "../types";
import { WORKDAY_SELECTORS } from "../selectors";
import { BaseAdapter, type FillResult } from "./base";

export class WorkdayAdapter extends BaseAdapter {
  detect(url: string): boolean {
    const lower = url.toLowerCase();
    return lower.includes("myworkdayjobs.com") || lower.includes("workday");
  }

  async fill(profile: UserProfile): Promise<FillResult> {
    this.logAction("start_fill", { platform: "workday" });

    // Fill personal info fields
    const fieldMap: Record<string, string> = {
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,
      phone: profile.phone,
      address_line1: profile.street,
      city: profile.city,
      zip: profile.zip,
    };

    for (const [fieldKey, value] of Object.entries(fieldMap)) {
      if (!value) continue;
      const selector = WORKDAY_SELECTORS[fieldKey as keyof typeof WORKDAY_SELECTORS];
      if (!selector) continue;
      this.fillBySelector(selector, value, fieldKey);
    }

    // State dropdown — Workday uses custom dropdowns
    if (profile.state) {
      await this.fillStateDropdown(profile.state);
    }

    // EEO fields
    if (profile.gender) await this.fillWorkdayDropdown("gender", profile.gender);
    if (profile.race) await this.fillWorkdayDropdown("race", profile.race);
    if (profile.veteran) await this.fillWorkdayDropdown("veteran", profile.veteran);
    if (profile.disability) await this.fillWorkdayDropdown("disability", profile.disability);

    // Custom fields from candidate_answers
    if (profile.candidate_answers) {
      this.fillCustomFields(profile.candidate_answers);
    }

    this.logAction("fill_complete", { fieldsFilled: this.fieldsFilled });
    return { fieldsFilled: this.fieldsFilled, log: this.log };
  }

  private async fillStateDropdown(state: string): Promise<void> {
    const el = document.querySelector<HTMLElement>(WORKDAY_SELECTORS.state);
    if (!el || !this.isVisible(el)) return;

    try {
      // If it's a standard select
      if (el.tagName.toLowerCase() === "select") {
        const select = el as HTMLSelectElement;
        const option = Array.from(select.options).find(
          (o) => o.text.toLowerCase().includes(state.toLowerCase())
        );
        if (option) {
          select.value = option.value;
          select.dispatchEvent(new Event("change", { bubbles: true }));
          this.fieldsFilled++;
          this.logAction("fill_field", { field: "state", success: true });
          return;
        }
      }

      // Workday custom dropdown — click to open, then select option
      el.click();
      await this.delay(500);

      const option = document.querySelector<HTMLElement>(
        `div[data-automation-id="promptOption"]`
      );
      if (option) {
        // Find the option with matching text
        const allOptions = document.querySelectorAll<HTMLElement>(
          'div[data-automation-id="promptOption"]'
        );
        for (const opt of allOptions) {
          if (opt.textContent?.toLowerCase().includes(state.toLowerCase())) {
            opt.click();
            this.fieldsFilled++;
            this.logAction("fill_field", { field: "state", success: true });
            return;
          }
        }
      }

      // Fallback: try filling as text input
      if (el instanceof HTMLInputElement) {
        this.fillInput(el, state);
        this.fieldsFilled++;
        this.logAction("fill_field", { field: "state", success: true });
      }
    } catch {
      this.logAction("fill_field", { field: "state", success: false });
    }
  }

  private async fillWorkdayDropdown(fieldKey: string, value: string): Promise<void> {
    // Look for a Workday dropdown with the field key in its automation ID
    const dropdown = document.querySelector<HTMLElement>(
      `[data-automation-id*="${fieldKey}" i], select[data-automation-id*="${fieldKey}" i]`
    );
    if (!dropdown || !this.isVisible(dropdown)) return;

    try {
      if (dropdown.tagName.toLowerCase() === "select") {
        const select = dropdown as HTMLSelectElement;
        const option = Array.from(select.options).find(
          (o) => o.text.toLowerCase() === value.toLowerCase()
        );
        if (option) {
          select.value = option.value;
          select.dispatchEvent(new Event("change", { bubbles: true }));
          this.fieldsFilled++;
          this.logAction("fill_eeo", { field: fieldKey, success: true });
          return;
        }
      }

      // Custom dropdown — click and pick
      dropdown.click();
      await this.delay(500);
      const allOptions = document.querySelectorAll<HTMLElement>(
        'div[data-automation-id="promptOption"]'
      );
      for (const opt of allOptions) {
        if (opt.textContent?.toLowerCase().includes(value.toLowerCase())) {
          opt.click();
          this.fieldsFilled++;
          this.logAction("fill_eeo", { field: fieldKey, success: true });
          return;
        }
      }
    } catch {
      this.logAction("fill_eeo", { field: fieldKey, success: false });
    }
  }

  private fillCustomFields(answers: Record<string, unknown>): void {
    for (const [key, value] of Object.entries(answers)) {
      if (value === null || value === undefined) continue;
      const strValue = String(value);

      for (const attr of ["name", "id", "data-automation-id"]) {
        const el = document.querySelector<HTMLInputElement>(
          `input[${attr}*="${key}" i]`
        );
        if (el && this.isVisible(el)) {
          this.fillInput(el, strValue);
          this.fieldsFilled++;
          this.logAction("fill_custom", { field: key, success: true });
          break;
        }
      }
    }
  }
}
