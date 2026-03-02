"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { ResumeViewer } from "@/components/resumes/ResumeViewer";

export default function ResumeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <PageContainer>
      <ResumeViewer resumeId={params.id} />
    </PageContainer>
  );
}
