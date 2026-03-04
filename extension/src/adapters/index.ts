import type { ATSPlatform } from "../types";
import type { BaseAdapter } from "./base";
import { GenericAdapter } from "./generic";
import { GreenhouseAdapter } from "./greenhouse";
import { LeverAdapter } from "./lever";
import { LinkedInAdapter } from "./linkedin";
import { WorkdayAdapter } from "./workday";

const adapters: BaseAdapter[] = [
  new GreenhouseAdapter(),
  new LeverAdapter(),
  new WorkdayAdapter(),
  new LinkedInAdapter(),
];

/** Detect ATS platform from URL and return the matching adapter. */
export function getAdapter(url: string): BaseAdapter {
  for (const adapter of adapters) {
    if (adapter.detect(url)) return adapter;
  }
  return new GenericAdapter();
}

/** Detect ATS platform name from URL. */
export function detectPlatform(url: string): ATSPlatform {
  const lower = url.toLowerCase();
  if (lower.includes("greenhouse.io") || lower.includes("boards.greenhouse"))
    return "greenhouse";
  if (lower.includes("lever.co") || lower.includes("jobs.lever"))
    return "lever";
  if (lower.includes("myworkdayjobs.com") || lower.includes("workday"))
    return "workday";
  if (lower.includes("linkedin.com/jobs")) return "linkedin";
  return "generic";
}
