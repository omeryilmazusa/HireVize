"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { ApplicationDetail } from "@/components/applications/ApplicationDetail";
import { AutomationLog } from "@/components/applications/AutomationLog";

export default function ApplicationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <PageContainer>
      <ApplicationDetail applicationId={params.id} />
      <div className="mt-8">
        <AutomationLog applicationId={params.id} />
      </div>
    </PageContainer>
  );
}
