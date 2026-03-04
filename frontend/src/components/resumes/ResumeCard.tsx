import Link from "next/link";
import type { Resume } from "@/types/resume";

export function ResumeCard({ resume }: { resume: Resume }) {
  return (
    <Link href={`/resumes/${resume.id}`}>
      <div className="rounded-card border border-border-card bg-white p-4 hover:border-primary-300 transition-colors">
        <h3 className="font-semibold text-navy-900">{resume.title}</h3>
        <p className="mt-1 text-sm text-navy-500">{resume.file_name}</p>
        <div className="mt-3 flex items-center gap-2">
          <span className="rounded-full bg-surface-subtle px-2 py-1 text-xs text-navy-600">
            {resume.file_type.toUpperCase()}
          </span>
          {resume.is_primary && (
            <span className="rounded-full bg-primary-100 px-2 py-1 text-xs text-primary-700">
              Primary
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
