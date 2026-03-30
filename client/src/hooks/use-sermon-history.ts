import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { buildApiUrl } from "@/lib/api-config";

export interface SermonWatchHistory {
  id: number;
  sermonId: number;
  userId: number;
  watchProgress: number;
  completed: boolean;
  lastWatchedAt: string;
  createdAt: string;
  sermon?: {
    id: number;
    title: string;
    preacher: string;
    seriesName?: string;
    thumbnailUrl?: string;
    duration: number;
  };
}

async function fetchWatchHistory(): Promise<SermonWatchHistory[]> {
  const url = buildApiUrl("/api/sermons/watch-history");
  const response = await fetch(url, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch watch history");
  return response.json();
}

async function updateWatchProgress(data: {
  sermonId: number;
  watchProgress: number;
  completed?: boolean;
}): Promise<SermonWatchHistory> {
  const url = buildApiUrl("/api/sermons/watch-progress");
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update watch progress");
  return response.json();
}

async function clearWatchHistory(): Promise<void> {
  const url = buildApiUrl("/api/sermons/watch-history");
  const response = await fetch(url, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to clear watch history");
}

export function useSermonWatchHistory() {
  return useQuery({
    queryKey: ["sermon-watch-history"],
    queryFn: fetchWatchHistory,
    staleTime: 1000 * 60 * 2,
  });
}

export function useUpdateWatchProgress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateWatchProgress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sermon-watch-history"] });
    },
  });
}

export function useClearWatchHistory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: clearWatchHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sermon-watch-history"] });
    },
  });
}
