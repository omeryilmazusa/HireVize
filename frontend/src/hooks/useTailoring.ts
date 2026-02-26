import useSWR from "swr";
import { api } from "@/lib/api";
import type { TailoredResume } from "@/types/resume";

export function useTailoredResumes(jobId: string) {
  const { data, error, isLoading, mutate } = useSWR<TailoredResume[]>(
    `/api/v1/jobs/${jobId}/tailored`,
    api.get
  );
  return { tailoredResumes: data, error, isLoading, mutate };
}

export function useTailoredResume(id: string) {
  const { data, error, isLoading, mutate } = useSWR<TailoredResume>(
    `/api/v1/tailored-resumes/${id}`,
    api.get
  );
  return { tailoredResume: data, error, isLoading, mutate };
}
