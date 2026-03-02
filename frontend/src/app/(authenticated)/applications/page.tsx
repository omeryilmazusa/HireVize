"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { ApplicationTable } from "@/components/applications/ApplicationTable";

export default function ApplicationsPage() {
  return (
    <PageContainer>
      <ApplicationTable />
    </PageContainer>
  );
}
