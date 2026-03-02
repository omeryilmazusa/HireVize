"use client";

import { useResume } from "@/hooks/useResumes";

export function ResumeSectionEditor({ resumeId }: { resumeId: string }) {
  const { resume, isLoading } = useResume(resumeId);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">Loading sections...</p>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-sm text-red-500">Resume not found.</p>
      </div>
    );
  }

  const sections = (resume as unknown as Record<string, unknown>).parsed_sections as Record<string, unknown> | undefined;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold">Parsed Sections</h3>

      {!sections || Object.keys(sections).length === 0 ? (
        <p className="text-sm text-gray-500">
          No parsed sections available. Sections will be populated after AI parsing is configured.
        </p>
      ) : (
        <div className="space-y-4">
          {Object.entries(sections).map(([key, value]) => (
            <div key={key}>
              <h4 className="mb-1 text-sm font-semibold capitalize text-gray-700">
                {key}
              </h4>
              <div className="rounded bg-gray-50 p-3 text-sm text-gray-600">
                {typeof value === "string" ? (
                  <p className="whitespace-pre-wrap">{value}</p>
                ) : (
                  <pre className="text-xs">{JSON.stringify(value, null, 2)}</pre>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
