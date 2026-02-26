"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { ResumeViewer } from "@/components/resumes/ResumeViewer";
import { ResumeSectionEditor } from "@/components/resumes/ResumeSectionEditor";

export default function ResumeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <PageContainer>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ResumeViewer resumeId={params.id} />
        <ResumeSectionEditor resumeId={params.id} />
      </div>
    </PageContainer>
  );
}
