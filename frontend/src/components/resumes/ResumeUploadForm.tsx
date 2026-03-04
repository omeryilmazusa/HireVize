"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useResumes } from "@/hooks/useResumes";

export function ResumeUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const { mutate } = useResumes();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      await api.upload("/api/v1/resumes", formData);
      setFile(null);
      setTitle("");
      mutate();
    } catch (err) {
      console.error("Failed to upload resume:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-card border border-border-card bg-white p-6">
      <h3 className="mb-4 font-display text-lg font-bold text-navy-900">Upload Resume</h3>
      <div className="flex flex-col gap-4 sm:flex-row">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Resume title (e.g., SWE Resume v2)"
          required
          className="flex-1 rounded-lg border border-border-card bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
        />
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
          className="text-sm text-navy-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary-500 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </form>
  );
}
