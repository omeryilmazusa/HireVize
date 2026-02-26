import useSWR from "swr";
import { api } from "@/lib/api";
import type { Job } from "@/types/job";

export function useJobs() {
  const { data, error, isLoading, mutate } = useSWR<Job[]>(
    "/api/v1/jobs",
    api.get
  );
  return { jobs: data, error, isLoading, mutate };
}

export function useJob(id: string) {
  const { data, error, isLoading, mutate } = useSWR<Job>(
    `/api/v1/jobs/${id}`,
    api.get
  );
  return { job: data, error, isLoading, mutate };
}
