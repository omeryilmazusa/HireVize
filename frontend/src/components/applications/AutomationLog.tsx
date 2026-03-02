"use client";

import type { LogEntry } from "@/types/application";

export function AutomationLog({ log }: { log: LogEntry[] | null }) {
  const entries = log ?? [];

  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">Automation Log</h3>
        <p className="text-sm text-gray-500">No automation actions recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold">Automation Log</h3>
      <div className="space-y-2">
        {entries.map((entry) => (
          <div key={entry.step} className="flex items-start gap-3 text-sm">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                entry.success === false
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {entry.success === false ? "\u2717" : "\u2713"}
            </span>
            <div className="min-w-0">
              <p className="font-medium text-gray-900">{entry.action}</p>
              {entry.details && (
                <p className="truncate text-gray-500">{entry.details}</p>
              )}
              <p className="text-xs text-gray-400">
                Step {entry.step} &mdash;{" "}
                {new Date(entry.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
