import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Sermon, InsertSermon } from "@/types/api";
import { buildApiUrl } from "@/lib/api-config";
import { apiRoutes } from "@/lib/api-routes";

export interface SermonFilters {
  speaker?: string;
  series?: string;
  status?: "upcoming" | "past";
  search?: string;
  topic?: string;
}

export function useSermons(filters?: SermonFilters) {
  const queryKey = filters?.speaker || filters?.series || filters?.status || filters?.search || filters?.topic
    ? [apiRoutes.sermons.list, filters]
    : [apiRoutes.sermons.list];

  return useQuery({
    queryKey,
    queryFn: async (): Promise<Sermon[]> => {
      const params = new URLSearchParams();
      if (filters?.speaker) params.append("speaker", filters.speaker);
      if (filters?.series) params.append("series", filters.series);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.topic) params.append("topic", filters.topic);
      
      const url = params.toString() 
        ? `${buildApiUrl(apiRoutes.sermons.list)}?${params}`
        : buildApiUrl(apiRoutes.sermons.list);
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch sermons");
      return res.json();
    },
  });
}

export function useSermon(id: number) {
  return useQuery({
    queryKey: [apiRoutes.sermons.get(id)],
    queryFn: async (): Promise<Sermon> => {
      const res = await fetch(buildApiUrl(apiRoutes.sermons.get(id)));
      if (!res.ok) throw new Error("Failed to fetch sermon");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateSermon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertSermon): Promise<Sermon> => {
      const res = await fetch(buildApiUrl(apiRoutes.sermons.create), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create sermon");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiRoutes.sermons.list] });
    },
  });
}

export function useUpdateSermon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertSermon> }): Promise<Sermon> => {
      const res = await fetch(buildApiUrl(`/api/sermons/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update sermon");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiRoutes.sermons.list] });
    },
  });
}

export function useDeleteSermon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const res = await fetch(buildApiUrl(`/api/sermons/${id}`), {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete sermon");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiRoutes.sermons.list] });
    },
  });
}

export interface ShareLinks {
  x: string;
  whatsapp: string;
  email: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  copyLink: string;
}

export interface DownloadInfo {
  url: string;
  filename: string;
  title: string;
}

export function useShareSermon() {
  return useMutation({
    mutationFn: async (id: number): Promise<ShareLinks> => {
      const res = await fetch(buildApiUrl(apiRoutes.sermons.share(id)));
      if (!res.ok) throw new Error("Failed to get share links");
      return res.json();
    },
  });
}

export function useDownloadSermon() {
  return useMutation({
    mutationFn: async ({ id, type }: { id: number; type?: "video" | "audio" }): Promise<DownloadInfo> => {
      const url = type 
        ? `${buildApiUrl(apiRoutes.sermons.download(id))}?type=${type}`
        : buildApiUrl(apiRoutes.sermons.download(id));
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to get download info");
      return res.json();
    },
  });
}
