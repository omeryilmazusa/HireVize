"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useSWRConfig } from "swr";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/jobs": "Jobs",
  "/resumes": "Resumes",
  "/applications": "Applications",
  "/settings": "Settings",
  "/profile": "Profile",
};

export function Header() {
  const pathname = usePathname();
  const { mutate } = useSWRConfig();
  const [showModal, setShowModal] = useState(false);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title =
    Object.entries(pageTitles).find(([path]) =>
      pathname.startsWith(path)
    )?.[1] ?? "Hirevize";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await api.post("/api/v1/jobs", { source_url: url });
      setUrl("");
      setShowModal(false);
      mutate("/api/v1/jobs");
      mutate("/api/v1/applications");
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
    <>
      <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button
          onClick={() => setShowModal(true)}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
        >
          Paste Job URL
        </button>
      </header>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => !loading && setShowModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-lg font-semibold">Add Job</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Paste a job listing URL..."
                required
                autoFocus
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                >
                  {loading ? "Scraping..." : "Add Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
