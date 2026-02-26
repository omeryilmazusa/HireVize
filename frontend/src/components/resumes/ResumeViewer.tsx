"use client";

import { useRouter } from "next/navigation";
import { useResume } from "@/hooks/useResumes";
import { api } from "@/lib/api";

export function ResumeViewer({ resumeId }: { resumeId: string }) {
  const { resume, isLoading, mutate } = useResume(resumeId);
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">Loading resume...</p>
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

  const handleDelete = async () => {
    if (!confirm("Delete this resume?")) return;
    try {
      await api.delete(`/api/v1/resumes/${resumeId}`);
      router.push("/resumes");
    } catch (err) {
      console.error("Failed to delete resume:", err);
    }
  };

  const handleSetPrimary = async () => {
    try {
      await api.put(`/api/v1/resumes/${resumeId}/primary`, {});
      mutate();
    } catch (err) {
      console.error("Failed to set primary:", err);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{resume.title}</h3>
          <p className="text-sm text-gray-500">{resume.file_name}</p>
        </div>
        <div className="flex items-center gap-2">
          {resume.is_primary ? (
            <span className="rounded-full bg-primary-100 px-2 py-1 text-xs text-primary-700">
              Primary
            </span>
          ) : (
            <button
              onClick={handleSetPrimary}
              className="rounded-lg border border-primary-200 px-3 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50"
            >
              Set Primary
            </button>
          )}
          <button
            onClick={handleDelete}
            className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
          {resume.file_type.toUpperCase()}
        </span>
        <span>Uploaded {new Date(resume.created_at).toLocaleDateString()}</span>
      </div>

      {resume.raw_text && (
        <div className="mt-4">
          <h4 className="mb-2 text-sm font-semibold text-gray-700">
            Extracted Text
          </h4>
          <div className="max-h-96 overflow-y-auto rounded bg-gray-50 p-4 text-sm text-gray-700 whitespace-pre-wrap">
            {resume.raw_text}
          </div>
        </div>
      )}
    </div>
  );
}
