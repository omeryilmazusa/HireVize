"use client";

interface LogEntry {
  step: number;
  action: string;
  timestamp: string;
  success?: boolean;
  details?: string;
}

export function AutomationLog({ applicationId }: { applicationId: string }) {
  // TODO: fetch log from application detail
  const entries: LogEntry[] = [];

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
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium">
              {entry.step}
            </span>
            <div>
              <p className="font-medium text-gray-900">{entry.action}</p>
              {entry.details && (
                <p className="text-gray-500">{entry.details}</p>
              )}
              <p className="text-xs text-gray-400">{entry.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
