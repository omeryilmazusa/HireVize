import type { UserProfile } from "../types";
import { LEVER_SELECTORS } from "../selectors";
import { BaseAdapter, type FillResult } from "./base";

export class LeverAdapter extends BaseAdapter {
  detect(url: string): boolean {
    const lower = url.toLowerCase();
    return lower.includes("lever.co") || lower.includes("jobs.lever");
  }

  async fill(profile: UserProfile): Promise<FillResult> {
    this.logAction("start_fill", { platform: "lever" });

    // Lever uses a combined "name" field
    const fullName = `${profile.first_name} ${profile.last_name}`.trim();
    if (fullName) {
      this.fillBySelector(LEVER_SELECTORS.name, fullName, "name");
    }

    this.fillBySelector(LEVER_SELECTORS.email, profile.email, "email");
    this.fillBySelector(LEVER_SELECTORS.phone, profile.phone, "phone");

    // LinkedIn / portfolio URL fields
    if (profile.linkedin) {
      this.fillByAttr("linkedin", profile.linkedin, "linkedin") ||
        this.fillByAttr("LinkedIn", profile.linkedin, "linkedin");
    }
    if (profile.portfolio) {
      this.fillByAttr("portfolio", profile.portfolio, "portfolio") ||
        this.fillByAttr("website", profile.portfolio, "portfolio");
    }

    // Cover letter / comments textarea
    const commentTextarea = document.querySelector<HTMLTextAreaElement>(
      'textarea[name*="comments"], textarea[name*="cover"], textarea[id*="additional"]'
    );
    if (commentTextarea && this.isVisible(commentTextarea)) {
      // Leave empty — user can fill this themselves
    }

    // Custom fields from candidate_answers
    if (profile.candidate_answers) {
      this.fillCustomFields(profile.candidate_answers);
    }

    this.logAction("fill_complete", { fieldsFilled: this.fieldsFilled });
    return { fieldsFilled: this.fieldsFilled, log: this.log };
  }

  private fillCustomFields(answers: Record<string, unknown>): void {
    for (const [key, value] of Object.entries(answers)) {
      if (value === null || value === undefined) continue;
      const strValue = String(value);

      // Try textarea
      for (const attr of ["name", "id"]) {
        const ta = document.querySelector<HTMLTextAreaElement>(
          `textarea[${attr}*="${key}" i]`
        );
        if (ta && this.isVisible(ta)) {
          this.fillInput(ta, strValue);
          this.fieldsFilled++;
          this.logAction("fill_custom", { field: key, type: "textarea", success: true });
          break;
        }
      }

      // Try select
      for (const attr of ["name", "id"]) {
        const sel = document.querySelector<HTMLSelectElement>(
          `select[${attr}*="${key}" i]`
        );
        if (sel && this.isVisible(sel)) {
          const option = Array.from(sel.options).find(
            (o) => o.text.toLowerCase() === strValue.toLowerCase()
          );
          if (option) {
            sel.value = option.value;
          } else {
            sel.value = strValue;
          }
          sel.dispatchEvent(new Event("change", { bubbles: true }));
          this.fieldsFilled++;
          this.logAction("fill_custom", { field: key, type: "select", success: true });
          break;
        }
      }

      // Try text input
      this.fillByAttr(key, strValue, key);
    }
  }
}
