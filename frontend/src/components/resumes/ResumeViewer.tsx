"use client";

export function ResumeViewer({ resumeId }: { resumeId: string }) {
  // TODO: fetch resume and display PDF preview
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold">Resume Preview</h3>
      <p className="text-sm text-gray-500">Loading resume {resumeId}...</p>
    </div>
  );
}
