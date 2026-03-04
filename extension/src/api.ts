import type { AutofillResult, UserProfile } from "./types";

const API_URL = "https://hirevize-api-492152296979.us-central1.run.app";

async function getToken(): Promise<string | null> {
  const result = await chrome.storage.local.get("hirevize_token");
  return result.hirevize_token || null;
}

export async function setToken(token: string): Promise<void> {
  await chrome.storage.local.set({ hirevize_token: token });
}

export async function clearToken(): Promise<void> {
  await chrome.storage.local.remove("hirevize_token");
}

export async function login(
  email: string,
  password: string
): Promise<{ token: string; expires_in: number }> {
  const res = await fetch(`${API_URL}/api/v1/auth/extension-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body.detail) detail = body.detail;
    } catch {
      // no json body
    }
    throw new Error(detail);
  }

  const data = await res.json();
  await setToken(data.token);
  return data;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });

  if (res.status === 401) {
    await clearToken();
    throw new Error("Session expired");
  }

  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body.detail) detail = body.detail;
    } catch {
      // no json body
    }
    throw new Error(detail);
  }

  return res.json();
}

export async function fetchProfile(): Promise<UserProfile> {
  return request<UserProfile>("/api/v1/extension/profile");
}

export async function postAutofillLog(result: AutofillResult): Promise<void> {
  await request("/api/v1/extension/autofill-log", {
    method: "POST",
    body: JSON.stringify({
      application_id: result.applicationId || null,
      url: result.url,
      platform: result.platform,
      entries: result.entries,
      fields_filled: result.fieldsFilled,
      status: result.status,
    }),
  });
}

export async function fetchResume(resumeId: string): Promise<{ blob: Blob; fileName: string }> {
  const token = await getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_URL}/api/v1/extension/resume/${resumeId}/download`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(`Failed to download resume: ${res.status}`);

  const blob = await res.blob();
  const disposition = res.headers.get("content-disposition") || "";
  const match = disposition.match(/filename="?([^"]+)"?/);
  const fileName = match ? match[1] : "resume.pdf";

  return { blob, fileName };
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getToken();
  if (!token) return false;
  try {
    await fetchProfile();
    return true;
  } catch {
    return false;
  }
}
