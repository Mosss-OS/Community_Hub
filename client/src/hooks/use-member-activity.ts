import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { buildApiUrl } from "@/lib/api-config";

export type ActivityType = 
  | "sermon_watch"
  | "sermon_complete"
  | "prayer_submit"
  | "prayer_pray"
  | "event_rsvp"
  | "event_attend"
  | "donation"
  | "group_join"
  | "group_message"
  | "profile_update"
  | "login"
  | "logout";

export interface ActivityLog {
  id: number;
  userId: number;
  type: ActivityType;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface EngagementMetrics {
  id: number;
  userId: number;
  date: string;
  sermonsWatched: number;
  prayersSubmitted: number;
  eventsAttended: number;
  devotionalsRead: number;
  groupMessages: number;
  totalSessionTime: number;
  loginCount: number;
}

async function fetchMyActivity(limit = 50): Promise<ActivityLog[]> {
  const url = buildApiUrl("/api/members/activity");
  const response = await fetch(`${url}?limit=${limit}`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch activity");
  return response.json();
}

async function fetchEngagementMetrics(): Promise<EngagementMetrics | null> {
  const url = buildApiUrl("/api/analytics/my-engagement");
  const response = await fetch(url, {
    credentials: "include",
  });
  if (!response.ok) return null;
  return response.json();
}

async function logActivity(activity: {
  type: ActivityType;
  description: string;
  metadata?: Record<string, unknown>;
}): Promise<ActivityLog> {
  const url = buildApiUrl("/api/members/activity");
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(activity),
  });
  if (!response.ok) throw new Error("Failed to log activity");
  return response.json();
}

async function recordEngagement(metrics: {
  sermonsWatched?: number;
  prayersSubmitted?: number;
  eventsAttended?: number;
  devotionalsRead?: number;
  groupMessages?: number;
  sessionTime?: number;
}): Promise<EngagementMetrics> {
  const url = buildApiUrl("/api/analytics/engagement");
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(metrics),
  });
  if (!response.ok) throw new Error("Failed to record engagement");
  return response.json();
}

export function useMyActivity(limit = 50) {
  return useQuery({
    queryKey: ["member-activity", limit],
    queryFn: () => fetchMyActivity(limit),
    staleTime: 1000 * 60 * 5,
  });
}

export function useEngagementMetrics() {
  return useQuery({
    queryKey: ["engagement-metrics"],
    queryFn: fetchEngagementMetrics,
    staleTime: 1000 * 60 * 5,
  });
}

export function useLogActivity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: logActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member-activity"] });
    },
  });
}

export function useRecordEngagement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: recordEngagement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["engagement-metrics"] });
    },
  });
}

export function useTrackActivity() {
  const logActivity = useLogActivity();
  const recordEngagement = useRecordEngagement();
  
  const trackPageView = (page: string) => {
    logActivity.mutate({
      type: "login",
      description: `Viewed ${page}`,
      metadata: { page, timestamp: new Date().toISOString() },
    });
  };
  
  const trackSermonWatch = (sermonId: number, title: string, completed = false) => {
    logActivity.mutate({
      type: completed ? "sermon_complete" : "sermon_watch",
      description: completed ? `Completed watching "${title}"` : `Started watching "${title}"`,
      metadata: { sermonId, title, completed },
    });
    recordEngagement.mutate({ sermonsWatched: 1 });
  };
  
  const trackPrayerSubmit = (prayerId: number) => {
    logActivity.mutate({
      type: "prayer_submit",
      description: "Submitted a prayer request",
      metadata: { prayerId },
    });
    recordEngagement.mutate({ prayersSubmitted: 1 });
  };
  
  const trackPrayerPray = (prayerId: number) => {
    logActivity.mutate({
      type: "prayer_pray",
      description: "Prayed for a prayer request",
      metadata: { prayerId },
    });
  };
  
  const trackEventRsvp = (eventId: number, title: string) => {
    logActivity.mutate({
      type: "event_rsvp",
      description: `RSVP'd to "${title}"`,
      metadata: { eventId, title },
    });
  };
  
  const trackEventAttend = (eventId: number, title: string) => {
    logActivity.mutate({
      type: "event_attend",
      description: `Attended "${title}"`,
      metadata: { eventId, title },
    });
    recordEngagement.mutate({ eventsAttended: 1 });
  };
  
  const trackDonation = (amount: number) => {
    logActivity.mutate({
      type: "donation",
      description: `Made a donation of $${amount.toFixed(2)}`,
      metadata: { amount },
    });
  };
  
  const trackGroupJoin = (groupId: number, groupName: string) => {
    logActivity.mutate({
      type: "group_join",
      description: `Joined group "${groupName}"`,
      metadata: { groupId, groupName },
    });
  };
  
  const trackGroupMessage = () => {
    recordEngagement.mutate({ groupMessages: 1 });
  };
  
  const trackProfileUpdate = (field: string) => {
    logActivity.mutate({
      type: "profile_update",
      description: `Updated profile: ${field}`,
      metadata: { field },
    });
  };
  
  const trackSessionTime = (minutes: number) => {
    recordEngagement.mutate({ sessionTime: minutes });
  };
  
  return {
    trackPageView,
    trackSermonWatch,
    trackPrayerSubmit,
    trackPrayerPray,
    trackEventRsvp,
    trackEventAttend,
    trackDonation,
    trackGroupJoin,
    trackGroupMessage,
    trackProfileUpdate,
    trackSessionTime,
  };
}
