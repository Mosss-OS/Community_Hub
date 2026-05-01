import webpush from "web-push";
import { storage } from "../storage";
import { pushSubscriptions, pushNotificationLogs } from "../../shared/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";

const publicVapidKey = process.env.VAPID_PUBLIC_KEY || "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U";
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || "UUxI4O8-FbRouAf7-7OTt9GH4o-9Rn7a6tDw1XK7ZbM";
const subject = process.env.VAPID_SUBJECT || "mailto:admin@wccrm.com";

webpush.setVapidDetails(subject, publicVapidKey, privateVapidKey);

export interface PushNotificationPayload {
  title: string;
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

export async function sendPushNotification(
  userId: string,
  payload: PushNotificationPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const subscriptions = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId));

    if (subscriptions.length === 0) {
      return { success: false, error: "No subscriptions found" };
    }

    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        const pushConfig: webpush.PushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        };

        await webpush.sendNotification(
          pushConfig as webpush.PushSubscription,
          JSON.stringify(payload)
        );
      })
    );

    await db.insert(pushNotificationLogs).values({
      userId,
      title: payload.title,
      body: payload.body,
      icon: payload.icon,
      badge: payload.badge,
      tag: payload.tag,
      data: payload.data ? JSON.stringify(payload.data) : null,
      status: "sent",
      sentAt: new Date(),
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("Error sending push notification:", error);
    
    await db.insert(pushNotificationLogs).values({
      userId,
      title: payload.title,
      body: payload.body,
      status: "failed",
    });

    if (error instanceof Error && 'statusCode' in error && (error as webpush.WebPushError).statusCode === 410) {
      return { success: false, error: "Subscription expired" };
    }

    return { success: false, error: "Failed to send notification" };
  }
}

export async function broadcastPushNotification(
  userIds: string[],
  payload: PushNotificationPayload
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  await Promise.allSettled(
    userIds.map(async (userId) => {
      const result = await sendPushNotification(userId, payload);
      if (result.success) {
        success++;
      } else {
        failed++;
      }
    })
  );

  return { success, failed };
}

export async function notifyEvent(userId: string, eventTitle: string, eventDate: Date) {
  return sendPushNotification(userId, {
    title: "New Event",
    body: `Join us for "${eventTitle}" on ${eventDate.toLocaleDateString()}`,
    icon: "/icons/notification-icon.png",
    tag: "event-notification",
    data: { type: "event" },
  });
}

export async function notifyLiveStream(userId: string, streamTitle: string) {
  return sendPushNotification(userId, {
    title: "Live Stream Started",
    body: `Watch "${streamTitle}" now!`,
    icon: "/icons/live-icon.png",
    tag: "live-stream-notification",
    data: { type: "live-stream", url: "/live" },
  });
}

export async function notifyPrayerRequest(userId: string, requestTitle: string) {
  return sendPushNotification(userId, {
    title: "Prayer Request Update",
    body: `Someone prayed for: "${requestTitle}"`,
    icon: "/icons/prayer-icon.png",
    tag: "prayer-notification",
    data: { type: "prayer" },
  });
}

export async function notifyNewMessage(userId: string, senderName: string) {
  return sendPushNotification(userId, {
    title: "New Message",
    body: `${senderName} sent you a message`,
    icon: "/icons/message-icon.png",
    tag: "message-notification",
    data: { type: "message", url: "/messages" },
  });
}

export async function notifyAttendanceReminder(userId: string, serviceTime: string) {
  return sendPushNotification(userId, {
    title: "Attendance Reminder",
    body: `Don't forget! Service is ${serviceTime}`,
    icon: "/icons/calendar-icon.png",
    tag: "attendance-notification",
    data: { type: "attendance", url: "/attendance" },
  });
}

export { publicVapidKey };
