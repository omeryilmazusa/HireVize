"use client";

export function ResumeSectionEditor({ resumeId }: { resumeId: string }) {
  // TODO: editable sections (summary, experience, education, skills)
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold">Parsed Sections</h3>
      <p className="text-sm text-gray-500">Section editor for resume {resumeId}...</p>
    </div>
  );
}
