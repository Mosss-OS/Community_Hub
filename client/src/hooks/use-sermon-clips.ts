import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { buildApiUrl } from "@/lib/api-config";

export interface SermonClip {
  id: number;
  sermonId: number;
  userId: number;
  title: string;
  startTime: number;
  endTime: number;
  thumbnailUrl?: string;
  videoUrl?: string;
  createdAt: string;
}

export interface CreateClipInput {
  sermonId: number;
  title: string;
  startTime: number;
  endTime: number;
}

async function fetchSermonClips(sermonId: number): Promise<SermonClip[]> {
  const url = buildApiUrl(`/api/sermons/${sermonId}/clips`);
  const response = await fetch(url, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch clips");
  return response.json();
}

async function fetchMyClips(): Promise<SermonClip[]> {
  const url = buildApiUrl("/api/sermons/clips/me");
  const response = await fetch(url, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch my clips");
  return response.json();
}

async function createClip(data: CreateClipInput): Promise<SermonClip> {
  const url = buildApiUrl("/api/sermons/clips");
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create clip");
  return response.json();
}

async function deleteClip(clipId: number): Promise<void> {
  const url = buildApiUrl(`/api/sermons/clips/${clipId}`);
  const response = await fetch(url, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to delete clip");
}

export function useSermonClips(sermonId: number) {
  return useQuery({
    queryKey: ["sermon-clips", sermonId],
    queryFn: () => fetchSermonClips(sermonId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useMyClips() {
  return useQuery({
    queryKey: ["my-clips"],
    queryFn: fetchMyClips,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateClip() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createClip,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sermon-clips", data.sermonId] });
      queryClient.invalidateQueries({ queryKey: ["my-clips"] });
    },
  });
}

export function useDeleteClip() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteClip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sermon-clips"] });
      queryClient.invalidateQueries({ queryKey: ["my-clips"] });
    },
  });
}
