"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { JobUrlForm } from "@/components/jobs/JobUrlForm";
import { JobList } from "@/components/jobs/JobList";

export default function JobsPage() {
  return (
    <PageContainer>
      <JobUrlForm />
      <div className="mt-8">
        <JobList />
      </div>
    </PageContainer>
  );
}
