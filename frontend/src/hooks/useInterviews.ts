import useSWR from "swr";
import { api } from "@/lib/api";
import type { Interview } from "@/types/interview";

export function useInterviews(month?: string) {
  const params = month ? `?month=${month}` : "";
  const { data, error, isLoading, mutate } = useSWR<Interview[]>(
    `/api/v1/interviews${params}`,
    api.get
  );
  return { interviews: data, error, isLoading, mutate };
}

export function useInterview(id: string) {
  const { data, error, isLoading, mutate } = useSWR<Interview>(
    `/api/v1/interviews/${id}`,
    api.get
  );
  return { interview: data, error, isLoading, mutate };
}
