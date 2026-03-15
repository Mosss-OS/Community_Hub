import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Event, InsertEvent } from "@/types/api";
import { buildApiUrl } from "@/lib/api-config";
import { authFetch } from "@/lib/auth-fetch";
import { apiRoutes } from "@/lib/api-routes";
import { useAuth } from "@/hooks/use-auth";

export function useEvents() {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: [apiRoutes.events.list, isAuthenticated],
    queryFn: async (): Promise<(Event & { rsvpCount?: number; hasRsvped?: boolean })[]> => {
      const endpoint = isAuthenticated 
        ? "/api/events/list-with-rsvps" 
        : apiRoutes.events.list;
      const res = await authFetch(buildApiUrl(endpoint));
      if (!res.ok) throw new Error("Failed to fetch events");
      return res.json();
    },
  });
}

export function useEvent(id: number) {
  return useQuery({
    queryKey: [apiRoutes.events.get(id)],
    queryFn: async (): Promise<Event> => {
      const res = await authFetch(buildApiUrl(apiRoutes.events.get(id)));
      if (!res.ok) throw new Error("Failed to fetch event");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertEvent): Promise<Event> => {
      const res = await authFetch(buildApiUrl(apiRoutes.events.create), {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create event");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiRoutes.events.list] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertEvent> }): Promise<Event> => {
      const res = await authFetch(buildApiUrl(`/api/events/${id}`), {
        method: "PUT",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update event");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiRoutes.events.list] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const res = await authFetch(buildApiUrl(`/api/events/${id}`), {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete event");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiRoutes.events.list] });
    },
  });
}

export function useRsvpEvent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await authFetch(buildApiUrl(apiRoutes.events.rsvp(id)), {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to RSVP");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-rsvps"] });
      queryClient.invalidateQueries({ queryKey: [apiRoutes.events.list] });
    },
  });
}

export function useRemoveRsvp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await authFetch(buildApiUrl(apiRoutes.events.rsvp(id)), {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove RSVP");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-rsvps"] });
    },
  });
}

export function useEventWithRsvps(id: number) {
  return useQuery({
    queryKey: [apiRoutes.events.withRsvps(id)],
    queryFn: async () => {
      const res = await authFetch(buildApiUrl(apiRoutes.events.withRsvps(id)));
      if (!res.ok) throw new Error("Failed to fetch event RSVPs");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useUserRsvps() {
  const { isAuthenticated, user } = useAuth();
  
  return useQuery({
    queryKey: ["user-rsvps", user?.id],
    queryFn: async () => {
      if (!isAuthenticated || !user) return [];
      const res = await authFetch(buildApiUrl(apiRoutes.events.rsvps));
      if (!res.ok) {
        console.error("Failed to fetch RSVPs:", res.status);
        return [];
      }
      const data = await res.json();
      console.log("RSVPs fetched:", data);
      return data;
    },
    enabled: !!isAuthenticated && !!user,
    staleTime: 0,
  });
}

export function useAddToCalendar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await authFetch(buildApiUrl(apiRoutes.events.addToCalendar(id)), {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to add to calendar");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-rsvps"] });
    },
  });
}

export interface CalendarLinks {
  google: string;
  outlook: string;
  apple: string;
  yahoo: string;
  ics: string;
}

export function useCalendarLinks(eventId: number) {
  return useQuery({
    queryKey: ["calendar-links", eventId],
    queryFn: async (): Promise<CalendarLinks> => {
      const res = await fetch(buildApiUrl(`/api/events/${eventId}/calendar-links`));
      if (!res.ok) throw new Error("Failed to fetch calendar links");
      return res.json();
    },
    enabled: !!eventId,
  });
}

export interface EventCategory {
  id: number;
  name: string;
  color: string;
  icon: string | null;
}

export function useEventCategories() {
  return useQuery({
    queryKey: ["event-categories"],
    queryFn: async (): Promise<EventCategory[]> => {
      const res = await fetch(buildApiUrl("/api/event-categories"));
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });
}

export function useEventsByCategory(category: string) {
  return useQuery({
    queryKey: ["events-by-category", category],
    queryFn: async (): Promise<Event[]> => {
      const res = await fetch(buildApiUrl(`/api/events/category/${encodeURIComponent(category)}`));
      if (!res.ok) throw new Error("Failed to fetch events");
      return res.json();
    },
    enabled: !!category,
  });
}

export function useEventsByTag(tag: string) {
  return useQuery({
    queryKey: ["events-by-tag", tag],
    queryFn: async (): Promise<Event[]> => {
      const res = await fetch(buildApiUrl(`/api/events/tag/${encodeURIComponent(tag)}`));
      if (!res.ok) throw new Error("Failed to fetch events");
      return res.json();
    },
    enabled: !!tag,
  });
}

export interface EventFeedback {
  id: number;
  eventId: number;
  userId: string | null;
  rating: number | null;
  comment: string | null;
  wouldRecommend: boolean | null;
  createdAt: string;
}

export function useEventFeedback(eventId: number) {
  return useQuery({
    queryKey: ["event-feedback", eventId],
    queryFn: async (): Promise<EventFeedback[]> => {
      const res = await fetch(buildApiUrl(`/api/events/${eventId}/feedback`));
      if (!res.ok) throw new Error("Failed to fetch feedback");
      return res.json();
    },
    enabled: !!eventId,
  });
}

export function useSubmitEventFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, rating, comment, wouldRecommend }: { eventId: number; rating?: number; comment?: string; wouldRecommend?: boolean }) => {
      const res = await fetch(buildApiUrl(`/api/events/${eventId}/feedback`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment, wouldRecommend }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to submit feedback");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["event-feedback", variables.eventId] });
    },
  });
}
