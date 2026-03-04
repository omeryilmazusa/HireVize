"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useJobs } from "@/hooks/useJobs";
import { useApplications } from "@/hooks/useApplications";

export function JobUrlForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { mutate: mutateJobs } = useJobs();
  const { mutate: mutateApplications } = useApplications();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await api.post("/api/v1/jobs", { source_url: url });
      setUrl("");
      mutateJobs();
      mutateApplications();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.detail);
      } else {
        setError("Failed to submit job URL. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Paste a job listing URL..."
          required
          className="flex-1 rounded-lg border border-border-card bg-white px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary-500 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? "Scraping..." : "Add Job"}
        </button>
      </form>
      {error && (
        <div className="mt-2 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
