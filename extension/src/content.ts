import { getAdapter, detectPlatform } from "./adapters";
import { detectJobApplicationPage } from "./detector";
import {
  showFloatingButton,
  updateFloatingButtonState,
  removeFloatingButton,
} from "./floating-button";
import type { AutofillResult, UserProfile } from "./types";

let lastUrl = "";

async function init(): Promise<void> {
  console.log("[Hirevize] Content script loaded on:", window.location.href);

  try {
    const state = await chrome.runtime.sendMessage({ type: "GET_STATE" });
    console.log("[Hirevize] State:", JSON.stringify(state));

    if (!state?.authenticated) {
      console.log("[Hirevize] Not authenticated — sign in via the extension popup first");
      return;
    }
    if (!state?.enabled) {
      console.log("[Hirevize] Auto-fill is disabled");
      return;
    }

    evaluatePage();
  } catch (err) {
    console.error("[Hirevize] init() error:", err);
  }
}

function evaluatePage(): void {
  const url = window.location.href;

  // Skip non-http pages
  if (!url.startsWith("http")) return;

  const detection = detectJobApplicationPage(url);
  if (!detection.isJobApplication) {
    removeFloatingButton();
    return;
  }

  const platform = detection.platform;
  console.log(`[Hirevize] Detected ${platform} job application (${detection.confidence} confidence)`);

  showFloatingButton(platform, {
    onAutofill: () => runAutofill(platform),
  });
}

let autofillRunning = false;

async function runAutofill(platform: string): Promise<void> {
  if (autofillRunning) {
    console.log("[Hirevize] Auto-fill already running, skipping");
    return;
  }
  autofillRunning = true;
  updateFloatingButtonState("filling");

  try {
    // Get profile from background script
    const response = await chrome.runtime.sendMessage({ type: "GET_PROFILE" });
    if (!response?.ok || !response.profile) {
      throw new Error(response?.error || "Failed to fetch profile");
    }

    const profile: UserProfile = response.profile;
    console.log("[Hirevize] Profile received:", JSON.stringify({
      name: `${profile.first_name} ${profile.last_name}`,
      email: profile.email,
      resume_id: profile.resume_id,
    }));

    const url = window.location.href;
    const adapter = getAdapter(url);

    console.log(`[Hirevize] Auto-filling with ${platform} adapter`);

    // Log all form inputs on the page for debugging
    const inputs = document.querySelectorAll("input, select, textarea");
    console.log(`[Hirevize] Found ${inputs.length} form elements on page:`);
    inputs.forEach((el, i) => {
      const e = el as HTMLElement;
      if (i < 30) {
        console.log(`  [${i}] <${el.tagName.toLowerCase()}> id="${el.id}" name="${(el as any).name}" type="${(el as any).type}" class="${el.className?.substring?.(0, 50)}"`);
      }
    });

    const { fieldsFilled, log } = await adapter.fill(profile);
    console.log(`[Hirevize] Fill complete: ${fieldsFilled} fields filled`, log);

    const result: AutofillResult = {
      url,
      platform,
      fieldsFilled,
      status: fieldsFilled > 0 ? "completed" : "partial",
      entries: log,
    };

    // Report to background
    chrome.runtime.sendMessage({ type: "AUTOFILL_COMPLETE", result });

    if (fieldsFilled > 0) {
      updateFloatingButtonState("success");
    } else {
      updateFloatingButtonState("error");
    }
  } catch (err) {
    console.error("[Hirevize] Autofill error:", err);

    const result: AutofillResult = {
      url: window.location.href,
      platform,
      fieldsFilled: 0,
      status: "failed",
      entries: [
        {
          step: 1,
          action: "error",
          timestamp: new Date().toISOString(),
          success: false,
          details: String(err),
        },
      ],
    };

    chrome.runtime.sendMessage({ type: "AUTOFILL_COMPLETE", result });
    updateFloatingButtonState("error");
  } finally {
    autofillRunning = false;
  }
}

// Watch for SPA navigation (URL changes without full page reload)
function watchNavigation(): void {
  lastUrl = window.location.href;

  const observer = new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      removeFloatingButton();
      // Small delay for SPA page to render
      setTimeout(() => evaluatePage(), 1000);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// Run on page load
init();
watchNavigation();
