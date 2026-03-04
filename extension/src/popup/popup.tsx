import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./popup.css";

interface LastResult {
  fieldsFilled: number;
  status: string;
  platform: string;
  completedAt: string;
}

interface UserInfo {
  email: string;
  first_name: string;
  last_name: string;
}

function Popup() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(true);
  const [lastResult, setLastResult] = useState<LastResult | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    chrome.storage.local.get(
      ["hirevize_token", "autofill_enabled", "lastAutofillResult", "hirevize_user"],
      (data) => {
        setAuthenticated(!!data.hirevize_token);
        setEnabled(data.autofill_enabled !== false);
        setLastResult(data.lastAutofillResult || null);
        setUserInfo(data.hirevize_user || null);
        setLoading(false);
      }
    );
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const response = await chrome.runtime.sendMessage({
        type: "LOGIN",
        email,
        password,
      });

      if (response?.ok) {
        setAuthenticated(true);
        setUserInfo(response.user || null);
      } else {
        setLoginError(response?.error || "Login failed");
      }
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignOut = () => {
    chrome.storage.local.remove(
      ["hirevize_token", "lastAutofillResult", "hirevize_user"],
      () => {
        setAuthenticated(false);
        setLastResult(null);
        setUserInfo(null);
      }
    );
  };

  const handleToggle = () => {
    const newValue = !enabled;
    setEnabled(newValue);
    chrome.storage.local.set({ autofill_enabled: newValue });
  };

  if (loading) {
    return (
      <div className="popup">
        <div className="header">
          <h1>Hirevize</h1>
        </div>
        <div className="content">
          <p className="muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="popup">
      <div className="header">
        <h1>Hirevize</h1>
        <span className="subtitle">Auto-Fill</span>
      </div>

      <div className="content">
        {!authenticated ? (
          <form className="login-form" onSubmit={handleLogin}>
            <p className="login-hint">Sign in with your Hirevize account</p>
            <input
              className="input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            <input
              className="input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {loginError && <p className="error-text">{loginError}</p>}
            <button
              className="btn btn-primary"
              type="submit"
              disabled={loginLoading}
            >
              {loginLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        ) : (
          <>
            {/* Connection status */}
            <div className="status-row">
              <span className="dot dot-green" />
              <span>Connected</span>
            </div>

            {/* User info */}
            {userInfo && (
              <div className="user-info">
                <div className="user-name">
                  {userInfo.first_name} {userInfo.last_name}
                </div>
                <div className="user-email">{userInfo.email}</div>
              </div>
            )}

            {/* Auto-fill toggle */}
            <div className="toggle-row">
              <span>Auto-fill enabled</span>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={handleToggle}
                />
                <span className="toggle-slider" />
              </label>
            </div>

            {/* Last result */}
            {lastResult && (
              <div className="result-card">
                <div className="result-label">Last auto-fill</div>
                <div className="result-detail">
                  {lastResult.fieldsFilled} field
                  {lastResult.fieldsFilled !== 1 ? "s" : ""} filled
                  <span className={`result-status status-${lastResult.status}`}>
                    {lastResult.status}
                  </span>
                </div>
                {lastResult.platform && (
                  <div className="result-platform">{lastResult.platform}</div>
                )}
                <div className="result-time">
                  {new Date(lastResult.completedAt).toLocaleString()}
                </div>
              </div>
            )}

            <button className="btn btn-outline" onClick={handleSignOut}>
              Sign Out
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<Popup />);
