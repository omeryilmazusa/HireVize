"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { JobDetail } from "@/components/jobs/JobDetail";
import { TailoringPanel } from "@/components/tailoring/TailoringPanel";

export default function JobDetailPage({ params }: { params: { id: string } }) {
  return (
    <PageContainer>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <JobDetail jobId={params.id} />
        <TailoringPanel jobId={params.id} />
      </div>
    </PageContainer>
  );
}
