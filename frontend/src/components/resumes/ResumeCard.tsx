import Link from "next/link";
import type { Resume } from "@/types/resume";

export function ResumeCard({ resume }: { resume: Resume }) {
  return (
    <Link href={`/resumes/${resume.id}`}>
      <div className="rounded-lg border border-gray-200 bg-white p-4 hover:border-primary-300 transition-colors">
        <h3 className="font-semibold text-gray-900">{resume.title}</h3>
        <p className="mt-1 text-sm text-gray-500">{resume.file_name}</p>
        <div className="mt-3 flex items-center gap-2">
          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
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
