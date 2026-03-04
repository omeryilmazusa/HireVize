export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  linkedin: string;
  portfolio: string;
  gender: string;
  race: string;
  veteran: string;
  disability: string;
  candidate_answers: Record<string, unknown>;
  work_authorization: string;
  resume_id: string | null;
  resume_name: string | null;
}

export interface AutofillData {
  applicationId?: string;
  applicationUrl: string;
  profile: UserProfile;
}

export interface AutofillResult {
  applicationId?: string;
  url: string;
  platform: string;
  fieldsFilled: number;
  status: "completed" | "partial" | "failed";
  entries: LogEntry[];
}

export interface LogEntry {
  step: number;
  action: string;
  timestamp: string;
  success?: boolean;
  details?: string;
  field?: string;
}

export type ATSPlatform =
  | "greenhouse"
  | "lever"
  | "workday"
  | "linkedin"
  | "generic";

export interface ExtensionMessage {
  type: string;
  [key: string]: unknown;
}
