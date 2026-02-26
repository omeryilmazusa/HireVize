"use client";

import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { api } from "@/lib/api";

interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  preferences: Record<string, string>;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [defaultModel, setDefaultModel] = useState("claude-sonnet-4-20250514");

  useEffect(() => {
    api.get<Profile>("/api/v1/profile").then((data) => {
      setProfile(data);
      setName(data.name || "");
      setEmail(data.email || "");
      setPhone(data.phone || "");
      setLinkedinUrl(data.linkedin_url || "");
      setPortfolioUrl(data.portfolio_url || "");
      setDefaultModel(data.preferences?.default_model || "claude-sonnet-4-20250514");
    });
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    setMessage("");
    try {
      const updated = await api.put<Profile>("/api/v1/profile", {
        name,
        email,
        phone: phone || null,
        linkedin_url: linkedinUrl || null,
        portfolio_url: portfolioUrl || null,
      });
      setProfile(updated);
      setMessage("Profile saved successfully.");
    } catch {
      setMessage("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    setMessage("");
    try {
      const updated = await api.put<Profile>("/api/v1/profile", {
        preferences: { default_model: defaultModel },
      });
      setProfile(updated);
      setMessage("Preferences saved successfully.");
    } catch {
      setMessage("Failed to save preferences.");
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return (
      <PageContainer>
        <div className="text-center text-gray-500">Loading...</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {message && (
        <div
          className={`mb-6 rounded-lg px-4 py-3 text-sm ${
            message.includes("Failed")
              ? "bg-red-50 text-red-700"
              : "bg-green-50 text-green-700"
          }`}
        >
          {message}
        </div>
      )}

      <div className="space-y-8">
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold">Profile</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Email"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                LinkedIn URL
              </label>
              <input
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Portfolio URL
              </label>
              <input
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>
          <button
            onClick={saveProfile}
            disabled={saving}
            className="mt-4 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold">Preferences</h3>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Default AI Model
            </label>
            <select
              value={defaultModel}
              onChange={(e) => setDefaultModel(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="claude-sonnet-4-20250514">Claude Sonnet</option>
              <option value="gpt-4o">GPT-4o</option>
            </select>
          </div>
          <button
            onClick={savePreferences}
            disabled={saving}
            className="mt-4 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save Preferences"}
          </button>
        </section>
      </div>
    </PageContainer>
  );
}
