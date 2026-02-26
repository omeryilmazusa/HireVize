"use client";

import { useState } from "react";
import { useResumes } from "@/hooks/useResumes";
import { useTailoredResumes } from "@/hooks/useTailoring";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/applications/StatusBadge";
import { DiffViewer } from "./DiffViewer";

export function TailoringPanel({ jobId }: { jobId: string }) {
  const [generating, setGenerating] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const { resumes } = useResumes();
  const { tailoredResumes, mutate } = useTailoredResumes(jobId);

  const handleTailor = async () => {
    if (!selectedResumeId) return;
    setGenerating(true);
    try {
      await api.post(`/api/v1/jobs/${jobId}/tailor`, {
        base_resume_id: selectedResumeId,
      });
      mutate();
    } catch (err) {
      console.error("Failed to tailor resume:", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold">Resume Tailoring</h3>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Base Resume
        </label>
        <select
          value={selectedResumeId}
          onChange={(e) => setSelectedResumeId(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Select a resume...</option>
          {resumes?.map((r) => (
            <option key={r.id} value={r.id}>
              {r.title} {r.is_primary ? "(Primary)" : ""}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleTailor}
        disabled={generating || !selectedResumeId}
        className="w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
      >
        {generating ? "Generating..." : "Tailor Resume with AI"}
      </button>

      {tailoredResumes && tailoredResumes.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">
            Tailored Versions
          </h4>
          {tailoredResumes.map((tr) => (
            <div
              key={tr.id}
              className="flex items-center justify-between rounded border border-gray-100 p-3"
            >
              <div className="text-sm">
                <p className="font-medium text-gray-900">
                  {tr.ai_model_used}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(tr.created_at).toLocaleString()}
                </p>
              </div>
              <StatusBadge status={tr.status} />
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <DiffViewer />
      </div>
    </div>
  );
}
