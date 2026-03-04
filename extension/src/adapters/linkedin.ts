import type { UserProfile } from "../types";
import { LINKEDIN_SELECTORS } from "../selectors";
import { BaseAdapter, type FillResult } from "./base";

export class LinkedInAdapter extends BaseAdapter {
  detect(url: string): boolean {
    return url.toLowerCase().includes("linkedin.com/jobs");
  }

  async fill(profile: UserProfile): Promise<FillResult> {
    this.logAction("start_fill", { platform: "linkedin" });

    // Fill phone number if present
    if (profile.phone) {
      const phoneInputs = document.querySelectorAll<HTMLInputElement>(
        LINKEDIN_SELECTORS.phone
      );
      for (const input of phoneInputs) {
        if (this.isVisible(input)) {
          const current = input.value;
          if (!current.trim()) {
            this.fillInput(input, profile.phone);
            this.fieldsFilled++;
            this.logAction("fill_field", { field: "phone", success: true });
          }
          break;
        }
      }
    }

    // Fill common fields by heuristic patterns
    const fieldPatterns: Record<string, string[]> = {
      first_name: ["firstName", "first_name", "fname"],
      last_name: ["lastName", "last_name", "lname"],
      email: ["email"],
      city: ["city", "location"],
      linkedin: ["linkedin", "linkedInUrl"],
    };

    for (const [fieldKey, patterns] of Object.entries(fieldPatterns)) {
      const value = profile[fieldKey as keyof UserProfile] as string;
      if (!value) continue;

      for (const pattern of patterns) {
        const el = document.querySelector<HTMLInputElement>(
          `input[id*="${pattern}" i], input[name*="${pattern}" i]`
        );
        if (el && this.isVisible(el)) {
          const current = el.value;
          if (!current.trim()) {
            this.fillInput(el, value);
            this.fieldsFilled++;
            this.logAction("fill_field", { field: fieldKey, success: true });
          }
          break;
        }
      }
    }

    // Fill custom question fields from candidate_answers
    if (profile.candidate_answers) {
      this.fillModalQuestions(profile.candidate_answers);
    }

    this.logAction("fill_complete", { fieldsFilled: this.fieldsFilled });
    return { fieldsFilled: this.fieldsFilled, log: this.log };
  }

  private fillModalQuestions(answers: Record<string, unknown>): void {
    for (const [key, value] of Object.entries(answers)) {
      if (value === null || value === undefined) continue;
      const strValue = String(value);

      // Try text input
      for (const attr of ["id", "name"]) {
        const el = document.querySelector<HTMLInputElement>(
          `input[${attr}*="${key}" i]`
        );
        if (el && this.isVisible(el)) {
          this.fillInput(el, strValue);
          this.fieldsFilled++;
          this.logAction("fill_custom", { field: key, type: "input", success: true });
          break;
        }
      }

      // Try select dropdown
      const sel = document.querySelector<HTMLSelectElement>(
        `select[id*="${key}" i], select[name*="${key}" i]`
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
      }
    }
  }
}
