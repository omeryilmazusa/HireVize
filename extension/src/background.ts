import { fetchProfile, fetchResume, login, postAutofillLog, isAuthenticated, clearToken } from "./api";
import type { AutofillResult, ExtensionMessage } from "./types";

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, sender, sendResponse) => {
    // Special handler that needs the tab ID
    if (message.type === "SELECT_DROPDOWN") {
      handleSelectDropdown(message, sender.tab?.id)
        .then((response) => sendResponse(response))
        .catch((err) => sendResponse({ ok: false, error: String(err) }));
      return true;
    }

    const handler = messageHandlers[message.type];
    if (handler) {
      handler(message)
        .then((response) => sendResponse(response))
        .catch((err) => sendResponse({ ok: false, error: String(err) }));
      return true; // Keep channel open for async
    }

    sendResponse({ ok: false, error: "Unknown message type" });
    return true;
  }
);

const messageHandlers: Record<
  string,
  (message: ExtensionMessage) => Promise<unknown>
> = {
  GET_STATE: handleGetState,
  GET_PROFILE: handleGetProfile,
  GET_RESUME: handleGetResume,
  AUTOFILL_COMPLETE: handleAutofillComplete,
  CHECK_AUTH: handleCheckAuth,
  LOGIN: handleLogin,
};

async function handleGetState(_message: ExtensionMessage) {
  const authenticated = await isAuthenticated();
  const data = await chrome.storage.local.get("autofill_enabled");
  const enabled = data.autofill_enabled !== false;
  return { authenticated, enabled };
}

async function handleGetProfile(_message: ExtensionMessage) {
  try {
    const profile = await fetchProfile();
    return { ok: true, profile };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

async function handleGetResume(message: ExtensionMessage) {
  const resumeId = message.resumeId as string;
  try {
    const { blob, fileName } = await fetchResume(resumeId);
    // Convert blob to base64 for message passing
    const buffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    return { ok: true, base64, fileName, type: blob.type };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

async function handleAutofillComplete(message: ExtensionMessage) {
  const result = message.result as AutofillResult;

  try {
    await postAutofillLog(result);
  } catch (err) {
    console.error("Failed to post autofill log:", err);
  }

  // Store last result for popup display
  await chrome.storage.local.set({
    lastAutofillResult: {
      ...result,
      completedAt: new Date().toISOString(),
    },
  });

  return { ok: true };
}

async function handleCheckAuth(_message: ExtensionMessage) {
  const authenticated = await isAuthenticated();
  return { authenticated };
}

async function handleSelectDropdown(message: ExtensionMessage, tabId?: number) {
  if (!tabId) return { ok: false, error: "No tab ID" };

  const inputId = message.inputId as string;
  const value = message.value as string;

  const results = await chrome.scripting.executeScript({
    target: { tabId },
    world: "MAIN" as any,
    func: (elId: string, val: string) => {
      const el = document.getElementById(elId) as HTMLInputElement;
      if (!el) return { error: "element_not_found" };

      // Step 1: Use React fiber to call onChange (updates parent form data)
      const fk = Object.keys(el).find(
        (k) => k.startsWith("__reactFiber$") || k.startsWith("__reactInternalInstance$")
      );
      if (!fk) return { error: "no_fiber" };

      let fiber = (el as any)[fk];
      let selectOnChange: any = null;
      let selectOptions: any[] = [];

      for (let i = 0; i < 50 && fiber; i++) {
        const props = fiber.memoizedProps || fiber.pendingProps;
        if (props?.options && Array.isArray(props.options) && props.onChange) {
          selectOnChange = props.onChange;
          selectOptions = props.options;
        }
        fiber = fiber.return;
      }

      if (!selectOnChange || selectOptions.length === 0) {
        return { error: "no_select_component" };
      }

      const opts = selectOptions as Array<{ label: string; value: string }>;
      const valLower = val.toLowerCase();
      const labels = opts.map((o: any) => o.label);

      const match =
        opts.find((o: any) => (o.label || "").toLowerCase() === valLower) ||
        opts.find((o: any) => (o.value || "").toLowerCase() === valLower) ||
        opts.find((o: any) => (o.label || "").toLowerCase().includes(valLower)) ||
        opts.find((o: any) => (o.value || "").toLowerCase().includes(valLower));

      if (!match) return { error: "no_match", available: labels };

      // Call onChange to update parent form state
      selectOnChange(match, { action: "select-option", option: match });

      // Step 2: Update the DOM display so the dropdown shows the selected value
      // Walk up to find the React Select root container
      let container = el.parentElement;
      for (let i = 0; i < 10 && container; i++) {
        if (container.querySelector('[class*="indicator"]')) break;
        container = container.parentElement;
      }

      if (container) {
        // Hide the placeholder
        const placeholder = container.querySelector('[class*="placeholder"]');
        if (placeholder) (placeholder as HTMLElement).style.display = "none";

        // Find or create the single-value display
        const valueContainer = container.querySelector('[class*="ValueContainer"], [class*="value-container"]');
        if (valueContainer) {
          let singleValue = container.querySelector('[class*="singleValue"], [class*="single-value"]') as HTMLElement;
          if (!singleValue) {
            // Create the single-value element by cloning placeholder style
            singleValue = document.createElement("div");
            if (placeholder) {
              singleValue.className = (placeholder as HTMLElement).className.replace(/placeholder/gi, "singleValue");
            }
            singleValue.style.cssText = "grid-area: 1/1/2/3; margin-left: 2px; margin-right: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: rgb(51, 51, 51);";
            valueContainer.insertBefore(singleValue, valueContainer.firstChild);
          }
          singleValue.textContent = match.label;
          singleValue.style.display = "";
        }
      }

      return { ok: true, label: match.label, available: labels };
    },
    args: [inputId, value],
  });

  return results?.[0]?.result || { error: "script_failed" };
}

async function handleLogin(message: ExtensionMessage) {
  const email = message.email as string;
  const password = message.password as string;

  try {
    await login(email, password);

    // Fetch profile to store user info for popup display
    const profile = await fetchProfile();
    await chrome.storage.local.set({
      hirevize_user: {
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
      },
    });

    return {
      ok: true,
      user: {
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
      },
    };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
