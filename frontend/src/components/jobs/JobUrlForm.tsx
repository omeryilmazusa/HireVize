"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export function JobUrlForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    try {
      await api.post("/api/v1/jobs", { source_url: url });
      setUrl("");
      // TODO: refresh job list
    } catch (err) {
      console.error("Failed to submit job URL:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste a job listing URL..."
        required
        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
      >
        {loading ? "Scraping..." : "Add Job"}
      </button>
    </form>
  );
}
