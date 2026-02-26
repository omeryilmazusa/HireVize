import useSWR from "swr";
import { api } from "@/lib/api";
import type { Resume } from "@/types/resume";

export function useResumes() {
  const { data, error, isLoading, mutate } = useSWR<Resume[]>(
    "/api/v1/resumes",
    api.get
  );
  return { resumes: data, error, isLoading, mutate };
}

export function useResume(id: string) {
  const { data, error, isLoading, mutate } = useSWR<Resume>(
    `/api/v1/resumes/${id}`,
    api.get
  );
  return { resume: data, error, isLoading, mutate };
}
