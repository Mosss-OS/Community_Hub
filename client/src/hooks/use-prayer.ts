import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PrayerRequest, InsertPrayerRequest } from "@/types/api";
import { buildApiUrl } from "@/lib/api-config";
import { apiRoutes } from "@/lib/api-routes";

export function usePrayerRequests() {
  return useQuery({
    queryKey: [apiRoutes.prayer.list],
    queryFn: async (): Promise<PrayerRequest[]> => {
      const res = await fetch(buildApiUrl(apiRoutes.prayer.list));
      if (!res.ok) throw new Error("Failed to fetch prayer requests");
      return res.json();
    },
  });
}

export function useCreatePrayerRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertPrayerRequest): Promise<PrayerRequest> => {
      const res = await fetch(buildApiUrl(apiRoutes.prayer.create), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create prayer request");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiRoutes.prayer.list] });
    },
  });
}

export function usePrayForRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number): Promise<PrayerRequest> => {
      const res = await fetch(buildApiUrl(apiRoutes.prayer.pray(id)), {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to pray for request");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiRoutes.prayer.list] });
    },
  });
}

export function useMyPrayerRequests() {
  return useQuery({
    queryKey: ["/api/prayer-requests/me"],
    queryFn: async (): Promise<PrayerRequest[]> => {
      const res = await fetch(buildApiUrl("/api/prayer-requests/me"), {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch your prayer requests");
      return res.json();
    },
  });
}

export function useMarkPrayerAnswered() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number): Promise<PrayerRequest> => {
      const res = await fetch(buildApiUrl(`/api/prayer-requests/${id}/answer`), {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to mark prayer as answered");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiRoutes.prayer.list] });
    },
  });
}
