"use client";

import { useResumes } from "@/hooks/useResumes";
import { ResumeCard } from "./ResumeCard";

export function ResumeList() {
  const { resumes, isLoading } = useResumes();

  if (isLoading) {
    return <div className="text-center text-gray-500">Loading resumes...</div>;
  }

  if (!resumes || resumes.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
        No resumes uploaded yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {resumes.map((resume) => (
        <ResumeCard key={resume.id} resume={resume} />
      ))}
    </div>
  );
}
