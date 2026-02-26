import useSWR from "swr";
import { api } from "@/lib/api";
import type { Application } from "@/types/application";

export function useApplications() {
  const { data, error, isLoading, mutate } = useSWR<Application[]>(
    "/api/v1/applications",
    api.get
  );
  return { applications: data, error, isLoading, mutate };
}

export function useApplication(id: string) {
  const { data, error, isLoading, mutate } = useSWR<Application>(
    `/api/v1/applications/${id}`,
    api.get
  );
  return { application: data, error, isLoading, mutate };
}
