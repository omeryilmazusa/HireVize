type ButtonState = "idle" | "filling" | "success" | "error";

let shadowHost: HTMLElement | null = null;
let shadowRoot: ShadowRoot | null = null;
let buttonEl: HTMLElement | null = null;

const DISMISSED_KEY = "hirevize_dismissed";

export function showFloatingButton(
  platform: string,
  callbacks: { onAutofill: () => void }
): void {
  // Don't show if dismissed this session
  if (sessionStorage.getItem(DISMISSED_KEY)) return;

  // Remove existing if present
  removeFloatingButton();

  shadowHost = document.createElement("div");
  shadowHost.id = "hirevize-floating-host";
  shadowHost.style.cssText = "position: fixed; bottom: 24px; right: 24px; z-index: 2147483647;";

  shadowRoot = shadowHost.attachShadow({ mode: "closed" });

  const style = document.createElement("style");
  style.textContent = `
    :host {
      all: initial;
    }

    .hirevize-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border: none;
      border-radius: 50px;
      background: #4f46e5;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(79, 70, 229, 0.4), 0 2px 8px rgba(0, 0, 0, 0.15);
      transition: all 0.2s ease;
      white-space: nowrap;
      line-height: 1;
    }

    .hirevize-btn:hover {
      background: #4338ca;
      transform: translateY(-1px);
      box-shadow: 0 6px 24px rgba(79, 70, 229, 0.5), 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .hirevize-btn:active {
      transform: translateY(0);
    }

    .hirevize-btn.filling {
      background: #6366f1;
      cursor: wait;
    }

    .hirevize-btn.success {
      background: #16a34a;
    }

    .hirevize-btn.error {
      background: #dc2626;
    }

    .hirevize-icon {
      width: 18px;
      height: 18px;
    }

    .hirevize-dismiss {
      position: absolute;
      top: -6px;
      right: -6px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: none;
      background: #64748b;
      color: white;
      font-size: 12px;
      line-height: 1;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.15s;
    }

    .hirevize-container:hover .hirevize-dismiss {
      opacity: 1;
    }

    .hirevize-container {
      position: relative;
    }
  `;

  const container = document.createElement("div");
  container.className = "hirevize-container";

  buttonEl = document.createElement("button");
  buttonEl.className = "hirevize-btn";
  buttonEl.innerHTML = `
    <svg class="hirevize-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
    <span class="hirevize-label">Auto-fill with Hirevize</span>
  `;
  buttonEl.addEventListener("click", () => {
    if (buttonEl?.classList.contains("filling")) return;
    callbacks.onAutofill();
  });

  const dismissBtn = document.createElement("button");
  dismissBtn.className = "hirevize-dismiss";
  dismissBtn.textContent = "\u00D7";
  dismissBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    sessionStorage.setItem(DISMISSED_KEY, "1");
    removeFloatingButton();
  });

  container.appendChild(buttonEl);
  container.appendChild(dismissBtn);
  shadowRoot.appendChild(style);
  shadowRoot.appendChild(container);
  document.body.appendChild(shadowHost);
}

export function updateFloatingButtonState(state: ButtonState): void {
  if (!buttonEl || !shadowRoot) return;

  const label = shadowRoot.querySelector(".hirevize-label");
  if (!label) return;

  buttonEl.className = `hirevize-btn ${state}`;

  switch (state) {
    case "idle":
      label.textContent = "Auto-fill with Hirevize";
      break;
    case "filling":
      label.textContent = "Filling...";
      break;
    case "success":
      label.textContent = "Filled! Review & submit";
      break;
    case "error":
      label.textContent = "Fill failed - try manually";
      break;
  }
}

export function removeFloatingButton(): void {
  if (shadowHost) {
    shadowHost.remove();
    shadowHost = null;
    shadowRoot = null;
    buttonEl = null;
  }
}
