"use client";

import { useState } from "react";
import { DiffViewer } from "./DiffViewer";

export function TailoringPanel({ jobId }: { jobId: string }) {
  const [generating, setGenerating] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold">Resume Tailoring</h3>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Base Resume
        </label>
        <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option>Select a resume...</option>
        </select>
      </div>

      <button
        onClick={() => setGenerating(true)}
        disabled={generating}
        className="w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
      >
        {generating ? "Generating..." : "Tailor Resume with AI"}
      </button>

      <div className="mt-6">
        <DiffViewer />
      </div>
    </div>
  );
}
