import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { buildApiUrl } from "@/lib/api-config";
import { LuBell, LuBellOff, LuLoader2 } from 'react-icons/lu';

interface NotificationPreferences {
  eventNotifications: boolean;
  sermonNotifications: boolean;
  prayerNotifications: boolean;
  liveStreamNotifications: boolean;
  attendanceNotifications: boolean;
  messageNotifications: boolean;
  groupNotifications: boolean;
}

export function PushNotificationSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [vapidKey, setVapidKey] = useState<string>("");

  useEffect(() => {
    if (user) {
      fetchPreferences();
      fetchVapidKey();
      checkSubscription();
    }
  }, [user]);

  const fetchVapidKey = async () => {
    try {
      const res = await fetch(buildApiUrl("/api/push/vapid-key"));
      const data = await res.json();
      setVapidKey(data.publicKey);
    } catch (error) {
      console.error("Error fetching VAPID key:", error);
    }
  };

  const fetchPreferences = async () => {
    try {
      const res = await fetch(buildApiUrl("/api/push/preferences"), {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkSubscription = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    setIsSubscribed(!!subscription);
  };

  const subscribeToPush = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      toast({
        title: "Push not supported",
        description: "Your browser does not support push notifications",
        variant: "destructive",
      });
      return;
    }

    setIsSubscribing(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as any,
      });

      await fetch(buildApiUrl("/api/push/subscribe"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(subscription),
      });

      setIsSubscribed(true);
      toast({
        title: "Subscribed",
        description: "You will now receive push notifications",
      });
    } catch (error) {
      console.error("Error subscribing to push:", error);
      toast({
        title: "Subscription failed",
        description: "Could not enable push notifications",
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  const unsubscribeFromPush = async () => {
    setIsSubscribing(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        
        await fetch(buildApiUrl("/api/push/unsubscribe"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
      }

      setIsSubscribed(false);
      toast({
        title: "Unsubscribed",
        description: "You will no longer receive push notifications",
      });
    } catch (error) {
      console.error("Error unsubscribing from push:", error);
      toast({
        title: "Error",
        description: "Could not disable push notifications",
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!preferences) return;

    const updated = { ...preferences, [key]: value };
    setPreferences(updated);

    try {
      await fetch(buildApiUrl("/api/push/preferences"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updated),
      });
    } catch (error) {
      console.error("Error updating preference:", error);
    }
  };

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Push notifications are not supported in your browser
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isSubscribed ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
          Push Notifications
        </CardTitle>
        <CardDescription>
          {isSubscribed
            ? "You're subscribed to push notifications"
            : "Enable push notifications to stay updated"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Push Notifications</p>
            <p className="text-sm text-muted-foreground">
              Receive notifications even when the app is closed
            </p>
          </div>
          {isSubscribed ? (
            <Button
              variant="outline"
              onClick={unsubscribeFromPush}
              disabled={isSubscribing}
            >
              {isSubscribing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Disable
            </Button>
          ) : (
            <Button onClick={subscribeToPush} disabled={isSubscribing}>
              {isSubscribing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enable
            </Button>
          )}
        </div>

        {isSubscribed && preferences && (
          <div className="space-y-3 pt-4 border-t">
            <p className="font-medium text-sm">Notification Types</p>
            {[
              { key: "eventNotifications", label: "Event notifications" },
              { key: "sermonNotifications", label: "New sermon alerts" },
              { key: "prayerNotifications", label: "Prayer request updates" },
              { key: "liveStreamNotifications", label: "Live stream alerts" },
              { key: "attendanceNotifications", label: "Attendance reminders" },
              { key: "messageNotifications", label: "New messages" },
              { key: "groupNotifications", label: "Group updates" },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-center justify-between cursor-pointer"
              >
                <span className="text-sm">{item.label}</span>
                <input
                  type="checkbox"
                  checked={preferences[item.key as keyof NotificationPreferences]}
                  onChange={(e) =>
                    updatePreference(
                      item.key as keyof NotificationPreferences,
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </label>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
