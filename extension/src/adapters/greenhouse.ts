import type { UserProfile } from "../types";
import { BaseAdapter, type FillResult } from "./base";

export class GreenhouseAdapter extends BaseAdapter {
  detect(url: string): boolean {
    const lower = url.toLowerCase();
    return lower.includes("greenhouse.io") || lower.includes("boards.greenhouse");
  }

  async fill(profile: UserProfile): Promise<FillResult> {
    this.logAction("start_fill", { platform: "greenhouse" });

    // Standard text fields — try by ID first, then by name
    this.fillField(["#first_name", 'input[name="first_name"]'], profile.first_name, "first_name");
    this.fillField(["#last_name", 'input[name="last_name"]'], profile.last_name, "last_name");
    this.fillField(["#email", 'input[name="email"]'], profile.email, "email");
    this.fillField(["#phone", 'input[name="phone"]', 'input[type="tel"]'], profile.phone, "phone");

    // Scan all fields by their label text for custom questions (linkedin, portfolio, work auth, sponsorship)
    await this.fillQuestionsByLabel(profile);

    // Fill EEO / demographic dropdowns by known IDs
    await this.fillEEOById(profile);

    // Upload resume via background script (avoids CORS)
    if (profile.resume_id) {
      await this.uploadResumeViaBackground(profile.resume_id);
    }

    this.logAction("fill_complete", { fieldsFilled: this.fieldsFilled });
    return { fieldsFilled: this.fieldsFilled, log: this.log };
  }

  /** Try multiple selectors until one matches */
  private fillField(selectors: string[], value: string, fieldName: string): boolean {
    if (!value) return false;
    for (const selector of selectors) {
      if (this.fillBySelector(selector, value, fieldName)) return true;
    }
    return false;
  }

  /**
   * Scan every visible input on the page, find its label text,
   * and fill based on pattern matching.
   */
  private async fillQuestionsByLabel(profile: UserProfile): Promise<void> {
    const allInputs = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      'input:not([type="hidden"]):not([type="file"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]), textarea, select'
    );

    for (const el of allInputs) {
      if (!this.isVisible(el)) continue;
      const label = this.getLabelText(el);
      if (!label) continue;

      const isCustomSelect = el.classList.contains("select__input");
      const isNativeSelect = el.tagName === "SELECT";

      // LinkedIn
      if (/linkedin/i.test(label) && profile.linkedin && !el.value) {
        if (isCustomSelect) {
          await this.selectDropdownOption(el as HTMLInputElement, profile.linkedin, "linkedin");
        } else if (isNativeSelect) {
          this.fillNativeSelect(el as HTMLSelectElement, profile.linkedin, "linkedin");
        } else {
          this.fillAndLog(el as HTMLInputElement | HTMLTextAreaElement, profile.linkedin, "linkedin");
        }
      }
      // Portfolio / website
      else if (/portfolio|website|personal.*url|github/i.test(label) && profile.portfolio && !el.value) {
        if (isCustomSelect) {
          await this.selectDropdownOption(el as HTMLInputElement, profile.portfolio, "portfolio");
        } else if (isNativeSelect) {
          this.fillNativeSelect(el as HTMLSelectElement, profile.portfolio, "portfolio");
        } else {
          this.fillAndLog(el as HTMLInputElement | HTMLTextAreaElement, profile.portfolio, "portfolio");
        }
      }
      // Work authorization
      else if (/authorized.*work|work.*authorization|legally.*authorized|eligible.*work|authorized.*us.*without/i.test(label)) {
        if (isCustomSelect) {
          await this.selectDropdownOption(el as HTMLInputElement, profile.work_authorization || "Yes", "work_authorization");
        } else if (isNativeSelect) {
          this.fillNativeSelect(el as HTMLSelectElement, profile.work_authorization || "Yes", "work_authorization");
        }
      }
      // Sponsorship
      else if (/sponsor|visa.*sponsor|require.*sponsor/i.test(label)) {
        const spValue = (profile.candidate_answers?.sponsorship as string) || "No";
        if (isCustomSelect) {
          await this.selectDropdownOption(el as HTMLInputElement, spValue, "sponsorship");
        } else if (isNativeSelect) {
          this.fillNativeSelect(el as HTMLSelectElement, spValue, "sponsorship");
        }
      }
      // Eligible to work in the US
      else if (/eligible.*work|eligible.*us/i.test(label)) {
        const ewValue = (profile.candidate_answers?.eligible_to_work_us as string) || "Yes";
        if (isCustomSelect) {
          await this.selectDropdownOption(el as HTMLInputElement, ewValue, "eligible_to_work_us");
        } else if (isNativeSelect) {
          this.fillNativeSelect(el as HTMLSelectElement, ewValue, "eligible_to_work_us");
        }
      }
      // Technical Challenge
      else if (/technical.*challenge|required.*technical/i.test(label)) {
        const tcValue = (profile.candidate_answers?.technical_challenge as string) || "Yes";
        if (isCustomSelect) {
          await this.selectDropdownOption(el as HTMLInputElement, tcValue, "technical_challenge");
        } else if (isNativeSelect) {
          this.fillNativeSelect(el as HTMLSelectElement, tcValue, "technical_challenge");
        } else {
          this.fillAndLog(el as HTMLInputElement | HTMLTextAreaElement, tcValue, "technical_challenge");
        }
      }
    }

    // Fallback: try to fill LinkedIn by direct field ID patterns (Greenhouse custom questions)
    if (profile.linkedin) {
      this.fillLinkedInFallback(profile.linkedin);
    }
  }

  /** Fill a native <select> element by matching option text */
  private fillNativeSelect(select: HTMLSelectElement, value: string, fieldName: string): void {
    const lowerValue = value.toLowerCase();
    for (const option of select.options) {
      if (option.text.toLowerCase().includes(lowerValue) || option.value.toLowerCase() === lowerValue) {
        select.value = option.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        this.fieldsFilled++;
        this.logAction("fill_native_select", { field: fieldName, value: option.text, success: true });
        return;
      }
    }
  }

  /** Fallback: scan inputs whose ID looks like a Greenhouse custom question and whose label says LinkedIn */
  private fillLinkedInFallback(linkedinUrl: string): void {
    const candidates = document.querySelectorAll<HTMLInputElement>('input[id^="question_"]');
    for (const el of candidates) {
      if (el.value) continue;
      const label = this.getLabelText(el);
      if (label && /linkedin/i.test(label)) {
        console.log(`[Hirevize] LinkedIn fallback: filling #${el.id} (label: "${label}")`);
        this.fillAndLog(el, linkedinUrl, "linkedin_fallback");
        return;
      }
    }
  }

  /**
   * Fill EEO dropdowns by their known IDs.
   * Greenhouse uses: #gender, #hispanic_ethnicity, #veteran_status, #disability_status
   */
  private async fillEEOById(profile: UserProfile): Promise<void> {
    // Map profile values to Greenhouse's actual dropdown option labels
    const eeoFields: Array<{ id: string; value: string; name: string }> = [
      { id: "gender", value: profile.gender, name: "gender" },
      // hispanic_ethnicity asks "Are you Hispanic/Latino?" — answer Yes or No
      { id: "hispanic_ethnicity", value: profile.race?.toLowerCase().includes("hispanic") ? "Yes" : "No", name: "hispanic_ethnicity" },
      // veteran_status uses full sentence options
      { id: "veteran_status", value: profile.veteran === "not_a_veteran" || profile.veteran === "no"
          ? "I am not a protected veteran"
          : profile.veteran || "", name: "veteran" },
      // disability_status uses full sentence options
      { id: "disability_status", value: profile.disability === "no" || profile.disability === "none"
          ? "No, I do not have a disability"
          : profile.disability || "", name: "disability" },
    ];

    for (const field of eeoFields) {
      if (!field.value) continue;
      const input = document.querySelector<HTMLInputElement>(`#${field.id}`);
      if (input && input.classList.contains("select__input")) {
        console.log(`[Hirevize] Filling EEO field #${field.id} with "${field.value}"`);
        await this.selectDropdownOption(input, field.value, field.name);
      }
    }
  }

  /**
   * Select a React Select option via the background script's chrome.scripting.executeScript.
   * This runs in the page's MAIN world, bypassing both CSP and the isolated world limitation.
   */
  private async selectDropdownOption(input: HTMLInputElement, value: string, fieldName: string): Promise<void> {
    try {
      // Ensure the input has an ID so the background script can find it
      const origId = input.id;
      if (!origId) {
        input.id = `hirevize-tmp-${Date.now()}`;
      }

      const result = await chrome.runtime.sendMessage({
        type: "SELECT_DROPDOWN",
        inputId: input.id,
        value,
      });

      // Restore original ID if we set a temp one
      if (!origId) input.removeAttribute("id");

      if (result?.ok) {
        console.log(`[Hirevize] ${fieldName}: selected "${result.label}"`);
        this.fieldsFilled++;
        this.logAction("select_dropdown", { field: fieldName, value: result.label, success: true });
      } else {
        console.log(`[Hirevize] ${fieldName}: ${result?.error}. Available:`, result?.available);
        this.logAction("select_dropdown", { field: fieldName, value, success: false, details: result?.error });
      }
    } catch (err) {
      console.error(`[Hirevize] Error selecting dropdown ${fieldName}:`, err);
      this.logAction("select_dropdown", { field: fieldName, success: false, details: String(err) });
    }
  }

  /** Get the label text for a form element */
  private getLabelText(el: HTMLElement): string {
    // 1. Try <label for="id">
    if (el.id) {
      const label = document.querySelector<HTMLLabelElement>(`label[for="${el.id}"]`);
      if (label) return label.textContent?.trim() || "";
    }

    // 2. Try parent/ancestor label
    const parentLabel = el.closest("label");
    if (parentLabel) return parentLabel.textContent?.trim() || "";

    // 3. Try preceding label sibling
    const prev = el.previousElementSibling;
    if (prev?.tagName === "LABEL") return prev.textContent?.trim() || "";

    // 4. Walk up to find a label in parent containers (common in Greenhouse)
    let container = el.parentElement;
    for (let i = 0; i < 5 && container; i++) {
      const label = container.querySelector("label");
      if (label && label.textContent?.trim()) {
        return label.textContent.trim();
      }
      container = container.parentElement;
    }

    // 5. Try aria-label or placeholder
    return el.getAttribute("aria-label") || (el as HTMLInputElement).placeholder || "";
  }

  /** Fill an input/textarea and log it */
  private fillAndLog(el: HTMLInputElement | HTMLTextAreaElement, value: string, fieldName: string): void {
    if (this.fillInput(el, value)) {
      this.fieldsFilled++;
      this.logAction("fill_by_label", { field: fieldName, success: true });
    }
  }

  /**
   * Upload resume by requesting it from the background script (avoids CORS).
   * Background script downloads the file and returns it as base64.
   */
  private async uploadResumeViaBackground(resumeId: string): Promise<void> {
    const fileInput =
      document.querySelector<HTMLInputElement>('#resume[type="file"]') ||
      document.querySelector<HTMLInputElement>('input[type="file"]') ||
      document.querySelector<HTMLInputElement>('input[name="resume"]');

    if (!fileInput) {
      this.logAction("upload_resume", { success: false, details: "No file input found" });
      return;
    }

    try {
      console.log(`[Hirevize] Requesting resume ${resumeId} from background script`);
      const response = await chrome.runtime.sendMessage({ type: "GET_RESUME", resumeId });

      if (!response?.ok) {
        throw new Error(response?.error || "Failed to get resume from background");
      }

      // Convert base64 back to Blob
      const binaryString = atob(response.base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: response.type || "application/pdf" });
      const fileName = response.fileName || "resume.pdf";

      const file = new File([blob], fileName, { type: blob.type });
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInput.files = dt.files;
      fileInput.dispatchEvent(new Event("change", { bubbles: true }));
      fileInput.dispatchEvent(new Event("input", { bubbles: true }));

      this.fieldsFilled++;
      this.logAction("upload_resume", { field: "resume", fileName, success: true });
      console.log(`[Hirevize] Resume uploaded: ${fileName}`);
    } catch (err) {
      console.error("[Hirevize] Resume upload failed:", err);
      this.logAction("upload_resume", { success: false, details: String(err) });
    }
  }
}
