import type { LogEntry, UserProfile } from "../types";

export interface FillResult {
  fieldsFilled: number;
  log: LogEntry[];
}

export abstract class BaseAdapter {
  protected log: LogEntry[] = [];
  protected fieldsFilled = 0;

  protected logAction(action: string, details?: Record<string, unknown>): void {
    this.log.push({
      step: this.log.length + 1,
      action,
      timestamp: new Date().toISOString(),
      ...details,
    });
  }

  abstract detect(url: string): boolean;
  abstract fill(profile: UserProfile): Promise<FillResult>;

  /** Set the value of an input element and dispatch change/input events. */
  protected fillInput(el: HTMLInputElement | HTMLTextAreaElement, value: string): boolean {
    if (!el || !value) return false;

    // Use native setter to trigger React/Vue controlled components
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value"
    )?.set;
    const nativeTextareaValueSetter = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      "value"
    )?.set;

    const setter =
      el instanceof HTMLTextAreaElement
        ? nativeTextareaValueSetter
        : nativeInputValueSetter;

    if (setter) {
      setter.call(el, value);
    } else {
      el.value = value;
    }

    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new Event("blur", { bubbles: true }));
    return true;
  }

  /** Try to fill an input matching a CSS selector. */
  protected fillBySelector(selector: string, value: string, fieldName: string): boolean {
    if (!value) return false;
    const el = document.querySelector<HTMLInputElement>(selector);
    if (!el || !this.isVisible(el)) return false;

    const filled = this.fillInput(el, value);
    if (filled) {
      this.fieldsFilled++;
      this.logAction("fill_field", { field: fieldName, success: true });
    }
    return filled;
  }

  /** Try to fill by matching name or id attributes. */
  protected fillByAttr(name: string, value: string, fieldName?: string): boolean {
    if (!value) return false;
    for (const attr of ["name", "id"]) {
      const selector = `input[${attr}*="${name}" i]`;
      const el = document.querySelector<HTMLInputElement>(selector);
      if (el && this.isVisible(el)) {
        const filled = this.fillInput(el, value);
        if (filled) {
          this.fieldsFilled++;
          this.logAction("fill_field", { field: fieldName || name, success: true });
          return true;
        }
      }
    }
    return false;
  }

  /** Upload a file to a file input via DataTransfer. */
  protected uploadFile(
    selector: string,
    fileBlob: Blob,
    fileName: string,
    fieldName = "resume"
  ): boolean {
    const input = document.querySelector<HTMLInputElement>(selector);
    if (!input) return false;

    try {
      const file = new File([fileBlob], fileName, { type: fileBlob.type });
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      input.dispatchEvent(new Event("change", { bubbles: true }));
      this.fieldsFilled++;
      this.logAction("upload_resume", { field: fieldName, success: true });
      return true;
    } catch {
      this.logAction("upload_resume", { field: fieldName, success: false });
      return false;
    }
  }

  /** Check if an element is visible. */
  protected isVisible(el: Element): boolean {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.opacity !== "0" &&
      (el as HTMLElement).offsetParent !== null
    );
  }

  /** Wait for an element to appear in the DOM. */
  protected waitForElement(
    selector: string,
    timeout = 5000
  ): Promise<Element | null> {
    return new Promise((resolve) => {
      const existing = document.querySelector(selector);
      if (existing) return resolve(existing);

      const observer = new MutationObserver(() => {
        const el = document.querySelector(selector);
        if (el) {
          observer.disconnect();
          resolve(el);
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });

      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);
    });
  }

  /** Helper to wait a specified number of ms. */
  protected delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
