"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { JobDetail } from "@/components/jobs/JobDetail";

export default function JobDetailPage({ params }: { params: { id: string } }) {
  return (
    <PageContainer>
      <JobDetail jobId={params.id} />
    </PageContainer>
  );
}
