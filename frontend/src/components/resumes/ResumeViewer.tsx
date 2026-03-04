"use client";

import { useRouter } from "next/navigation";
import { useResume } from "@/hooks/useResumes";
import { api } from "@/lib/api";

export function ResumeViewer({ resumeId }: { resumeId: string }) {
  const { resume, isLoading, mutate } = useResume(resumeId);
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="rounded-card border border-border-card bg-white p-6">
        <p className="text-sm text-navy-500">Loading resume...</p>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="rounded-card border border-border-card bg-white p-6">
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

  const downloadUrl = `/api/v1/resumes/${resumeId}/download`;

  return (
    <div className="space-y-4">
      <div className="rounded-card border border-border-card bg-white p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-navy-900">{resume.title}</h3>
            <p className="text-sm text-navy-500">{resume.file_name}</p>
          </div>
          <div className="flex items-center gap-2">
            {resume.is_primary ? (
              <span className="rounded-full bg-primary-100 px-2 py-1 text-xs text-primary-700">
                Primary
              </span>
            ) : (
              <button
                onClick={handleSetPrimary}
                className="rounded-lg border border-primary-200 px-3 py-1 text-xs font-medium text-primary-500 hover:bg-primary-50"
              >
                Set Primary
              </button>
            )}
            <a
              href={downloadUrl}
              download
              className="rounded-lg border border-border-card px-3 py-1 text-xs font-medium text-navy-800 hover:bg-surface-hover"
            >
              Download
            </a>
            <button
              onClick={handleDelete}
              className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-navy-500">
          <span className="rounded-full bg-surface-subtle px-2 py-1 text-xs">
            {resume.file_type.toUpperCase()}
          </span>
          <span>Uploaded {new Date(resume.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      {resume.file_type === "pdf" && (
        <div className="overflow-hidden rounded-card border border-border-card bg-white">
          <iframe
            src={downloadUrl}
            title={resume.title}
            className="h-[800px] w-full"
          />
        </div>
      )}
    </div>
  );
}
