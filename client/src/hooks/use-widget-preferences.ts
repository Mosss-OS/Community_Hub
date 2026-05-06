import { useState, useEffect } from "react";

interface WidgetPreferences {
  upcomingEvents: boolean;
  recentSermons: boolean;
  prayerRequests: boolean;
  recentActivity: boolean;
}

const DEFAULT_PREFERENCES: WidgetPreferences = {
  upcomingEvents: true,
  recentSermons: true,
  prayerRequests: true,
  recentActivity: false,
};

export function useWidgetPreferences() {
  const [preferences, setPreferences] = useState<WidgetPreferences>(() => {
    const stored = localStorage.getItem("dashboard-widgets");
    return stored ? JSON.parse(stored) : DEFAULT_PREFERENCES;
  });

  useEffect(() => {
    localStorage.setItem("dashboard-widgets", JSON.stringify(preferences));
  }, [preferences]);

  const toggleWidget = (widget: keyof WidgetPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [widget]: !prev[widget],
    }));
  };

  return { preferences, toggleWidget };
}
