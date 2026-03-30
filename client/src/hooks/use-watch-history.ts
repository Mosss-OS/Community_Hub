import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { buildApiUrl } from "@/lib/api-config";

export interface WatchHistoryItem {
  id: number;
  sermonId: number;
  userId: string;
  watchProgress: number | null;
  completed: boolean;
  viewedAt: Date;
  sermon: {
    id: number;
    title: string;
    preacher: string;
    seriesName: string | null;
    thumbnailUrl: string | null;
    duration: number | null;
  } | null;
}

export function useWatchHistory() {
  return useQuery<WatchHistoryItem[]>({
    queryKey: ["sermons", "watch-history"],
    queryFn: async () => {
      const res = await fetch(buildApiUrl("/api/sermons/watch-history"), {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch watch history");
      return res.json();
    },
  });
}

export function useClearWatchHistory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(buildApiUrl("/api/sermons/watch-history"), {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to clear watch history");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sermons", "watch-history"] });
    },
  });
}

export function useUpdateWatchProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sermonId, watchProgress, completed }: { sermonId: number; watchProgress: number; completed?: boolean }) => {
      const res = await fetch(buildApiUrl("/api/sermons/watch-progress"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sermonId, watchProgress, completed }),
      });
      if (!res.ok) throw new Error("Failed to update watch progress");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sermons", "watch-history"] });
    },
  });
}
