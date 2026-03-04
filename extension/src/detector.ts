import type { ATSPlatform } from "./types";

export interface DetectionResult {
  isJobApplication: boolean;
  platform: ATSPlatform;
  confidence: "high" | "medium" | "low";
}

const KNOWN_ATS_PATTERNS: { pattern: RegExp; platform: ATSPlatform }[] = [
  { pattern: /greenhouse\.io\/|boards\.greenhouse/i, platform: "greenhouse" },
  { pattern: /lever\.co\/|jobs\.lever/i, platform: "lever" },
  { pattern: /myworkdayjobs\.com|workday/i, platform: "workday" },
  { pattern: /linkedin\.com\/jobs/i, platform: "linkedin" },
];

export function detectJobApplicationPage(url: string): DetectionResult {
  // Check known ATS URLs first
  for (const { pattern, platform } of KNOWN_ATS_PATTERNS) {
    if (pattern.test(url)) {
      return { isJobApplication: true, platform, confidence: "high" };
    }
  }

  // Generic heuristic: check the page DOM for application form indicators
  if (hasApplicationFormHeuristics()) {
    return { isJobApplication: true, platform: "generic", confidence: "medium" };
  }

  return { isJobApplication: false, platform: "generic", confidence: "low" };
}

function hasApplicationFormHeuristics(): boolean {
  const forms = document.querySelectorAll("form");
  if (forms.length === 0) return false;

  let score = 0;

  // Check for common job application fields
  const indicators = [
    'input[name*="name" i]',
    'input[name*="email" i]',
    'input[type="email"]',
    'input[name*="phone" i]',
    'input[type="tel"]',
    'input[name*="resume" i]',
    'input[type="file"]',
    'input[name*="linkedin" i]',
    'input[name*="cover" i]',
    'textarea[name*="cover" i]',
    'select[name*="gender" i]',
    'select[name*="veteran" i]',
    'select[name*="race" i]',
    'select[name*="ethnicity" i]',
  ];

  for (const selector of indicators) {
    if (document.querySelector(selector)) {
      score++;
    }
  }

  // Check for keywords in labels and headings
  const pageText = document.body?.innerText?.toLowerCase() || "";
  const keywords = [
    "apply for",
    "job application",
    "submit application",
    "upload resume",
    "upload cv",
    "cover letter",
    "equal opportunity",
    "work authorization",
  ];

  for (const keyword of keywords) {
    if (pageText.includes(keyword)) {
      score++;
    }
  }

  // Need at least 3 indicators to consider it a job application page
  return score >= 3;
}
