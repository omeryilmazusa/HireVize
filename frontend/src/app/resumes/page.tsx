"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { ResumeUploadForm } from "@/components/resumes/ResumeUploadForm";
import { ResumeList } from "@/components/resumes/ResumeList";

export default function ResumesPage() {
  return (
    <PageContainer>
      <ResumeUploadForm />
      <div className="mt-8">
        <ResumeList />
      </div>
    </PageContainer>
  );
}
