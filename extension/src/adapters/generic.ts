import type { UserProfile } from "../types";
import { BaseAdapter, type FillResult } from "./base";

/** Fallback adapter using heuristics to fill common form fields. */
export class GenericAdapter extends BaseAdapter {
  private static readonly FIELD_MAPPINGS: Record<string, string[]> = {
    name: ["name", "full_name", "fullname", "applicant_name"],
    first_name: ["first_name", "firstname", "fname"],
    last_name: ["last_name", "lastname", "lname"],
    email: ["email", "e-mail", "email_address"],
    phone: ["phone", "telephone", "phone_number", "mobile"],
    linkedin: ["linkedin", "linkedin_url", "linkedin_profile"],
    portfolio: ["portfolio", "website", "url", "personal_website"],
  };

  detect(): boolean {
    return true; // Generic always matches as fallback
  }

  async fill(profile: UserProfile): Promise<FillResult> {
    this.logAction("start_fill", { platform: "generic" });

    // Try combined name field
    const fullName = `${profile.first_name} ${profile.last_name}`.trim();
    for (const pattern of GenericAdapter.FIELD_MAPPINGS.name) {
      if (this.fillByAttr(pattern, fullName, "name")) break;
    }

    // Try individual fields
    const fieldValues: Record<string, string> = {
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,
      phone: profile.phone,
      linkedin: profile.linkedin,
      portfolio: profile.portfolio,
    };

    for (const [fieldKey, value] of Object.entries(fieldValues)) {
      if (!value) continue;
      const patterns = GenericAdapter.FIELD_MAPPINGS[fieldKey];
      if (!patterns) continue;

      for (const pattern of patterns) {
        if (this.fillByAttr(pattern, value, fieldKey)) break;
      }
    }

    // Try address fields
    if (profile.street) this.fillByAttr("street", profile.street, "street") || this.fillByAttr("address", profile.street, "street");
    if (profile.city) this.fillByAttr("city", profile.city, "city");
    if (profile.state) this.fillByAttr("state", profile.state, "state");
    if (profile.zip) this.fillByAttr("zip", profile.zip, "zip") || this.fillByAttr("postal", profile.zip, "zip");

    // Custom answers
    if (profile.candidate_answers) {
      for (const [key, value] of Object.entries(profile.candidate_answers)) {
        if (value === null || value === undefined) continue;
        this.fillByAttr(key, String(value), key);
      }
    }

    this.logAction("fill_complete", { fieldsFilled: this.fieldsFilled });
    return { fieldsFilled: this.fieldsFilled, log: this.log };
  }
}
