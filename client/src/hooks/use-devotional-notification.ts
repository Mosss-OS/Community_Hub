"use client";

import { useState, useEffect } from "react";

interface NotificationPreferences {
  enabled: boolean;
  time: string; // HH:mm format
}

export function useDevotionalNotification() {
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    enabled: false,
    time: "07:00",
  });

  useEffect(() => {
    const stored = localStorage.getItem("devotional_notification_prefs");
    if (stored) {
      setPrefs(JSON.parse(stored));
    }
  }, []);

  const updatePrefs = (newPrefs: Partial<NotificationPreferences>) => {
    const updated = { ...prefs, ...newPrefs };
    localStorage.setItem("devotional_notification_prefs", JSON.stringify(updated));
    setPrefs(updated);
    
    if (Notification.permission === "granted" && updated.enabled) {
      // Request notification permission if not granted
      Notification.requestPermission();
    }
  };

  return { prefs, updatePrefs };
}
