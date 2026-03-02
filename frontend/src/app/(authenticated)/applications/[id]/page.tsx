"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { ApplicationDetail } from "@/components/applications/ApplicationDetail";
import { AutomationLog } from "@/components/applications/AutomationLog";
import { useApplication } from "@/hooks/useApplications";

export default function ApplicationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { application } = useApplication(params.id);

  const logEntries = application?.automation_log
    ? (application.automation_log as { entries?: unknown[] }).entries ?? null
    : null;

  return (
    <PageContainer>
      <ApplicationDetail applicationId={params.id} />
      <div className="mt-8">
        <AutomationLog log={logEntries as import("@/types/application").LogEntry[] | null} />
      </div>
    </PageContainer>
  );
}
