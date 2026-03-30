import { useMutation, useQueryClient } from "@tanstack/react-query";
import { buildApiUrl } from "@/lib/api-config";

export interface CheckinNotification {
  id: number;
  eventId: number;
  eventTitle: string;
  eventDate: string;
  checkedInAt: string;
  messageSent: boolean;
}

async function sendCheckinNotification(eventId: number): Promise<CheckinNotification> {
  const url = buildApiUrl(`/api/events/${eventId}/checkin-notification`);
  const response = await fetch(url, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to send checkin notification");
  return response.json();
}

export function useSendCheckinNotification() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: sendCheckinNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
