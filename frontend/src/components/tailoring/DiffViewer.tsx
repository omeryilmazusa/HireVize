"use client";

import { SuggestionCard } from "./SuggestionCard";

export function DiffViewer() {
  // TODO: receive diff_summary from tailored resume and render per-section
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Generate a tailored resume to see AI suggestions here.
      </p>
    </div>
  );
}
