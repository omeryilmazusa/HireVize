"use client";

import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { api } from "@/lib/api";

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phones: Array<{ type: string; number: string }> | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  work_authorization: string | null;
  candidate_answers: Record<string, string> | null;
  preferences: Record<string, string>;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [workAuthorization, setWorkAuthorization] = useState("");
  const [technicalChallenge, setTechnicalChallenge] = useState("");
  const [eligibleToWork, setEligibleToWork] = useState("");
  const [sponsorship, setSponsorship] = useState("");

  useEffect(() => {
    api.get<Profile>("/api/v1/profile").then((data) => {
      setProfile(data);
      setFirstName(data.first_name || "");
      setLastName(data.last_name || "");
      setEmail(data.email || "");
      setLinkedinUrl(data.linkedin_url || "");
      setPortfolioUrl(data.portfolio_url || "");
      setWorkAuthorization(data.work_authorization || "");
      setTechnicalChallenge(data.candidate_answers?.technical_challenge || "");
      setEligibleToWork(data.candidate_answers?.eligible_to_work_us || "");
      setSponsorship(data.candidate_answers?.sponsorship || "");
    });
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    setMessage("");
    try {
      const updated = await api.put<Profile>("/api/v1/profile", {
        first_name: firstName,
        last_name: lastName,
        email,
        linkedin_url: linkedinUrl || null,
        portfolio_url: portfolioUrl || null,
        work_authorization: workAuthorization || null,
        candidate_answers: {
          ...(profile?.candidate_answers || {}),
          technical_challenge: technicalChallenge || undefined,
          eligible_to_work_us: eligibleToWork || undefined,
          sponsorship: sponsorship || undefined,
        },
      });
      setProfile(updated);
      setMessage("Profile saved successfully.");
    } catch {
      setMessage("Failed to save profile.");
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

      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">Profile Information</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
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
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Authorized to work in the US?
            </label>
            <select
              value={workAuthorization}
              onChange={(e) => setWorkAuthorization(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">-- Select --</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Required Technical Challenge?
            </label>
            <select
              value={technicalChallenge}
              onChange={(e) => setTechnicalChallenge(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">-- Select --</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Are you eligible to work in the USA?
            </label>
            <select
              value={eligibleToWork}
              onChange={(e) => setEligibleToWork(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">-- Select --</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Will you now or in the future require sponsorship?
            </label>
            <select
              value={sponsorship}
              onChange={(e) => setSponsorship(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">-- Select --</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
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
    </PageContainer>
  );
}
