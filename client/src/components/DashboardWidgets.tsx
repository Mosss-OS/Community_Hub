import { useState, useEffect } from "react";
import { Link } from "wouter";
import { HiDotsVertical, HiTrash, HiEye, HiCalendar, HiHeart, HiCreditCard } from "react-icons/hi";
import { useAuth } from "@/hooks/use-auth";
import { AnniversaryCountdown } from "@/components/AnniversaryCountdown";
import { EventCheckinStats } from "@/components/EventCheckinStats";

interface DashboardWidget {
  id: string;
  title: string;
  type: "upcoming_events" | "recent_sermons" | "prayer_requests" | "giving_summary" | "my_groups" | "anniversary_countdown" | "event_checkin_stats";
  visible: boolean;
  order: number;
}

const defaultWidgets: DashboardWidget[] = [
  { id: "1", title: "Upcoming Events", type: "upcoming_events", visible: true, order: 0 },
  { id: "2", title: "Recent Sermons", type: "recent_sermons", visible: true, order: 1 },
  { id: "3", title: "Prayer Requests", type: "prayer_requests", visible: true, order: 2 },
  { id: "4", title: "Giving Summary", type: "giving_summary", visible: true, order: 3 },
  { id: "5", title: "My Groups", type: "my_groups", visible: true, order: 4 },
  { id: "6", title: "Anniversary Countdown", type: "anniversary_countdown", visible: true, order: 5 },
  { id: "7", title: "Event Check-in Stats", type: "event_checkin_stats", visible: true, order: 6 },
];

export function DashboardWidgets() {
  const { user } = useAuth();
  const [widgets, setWidgets] = useState<DashboardWidget[]>(defaultWidgets);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem("dashboard_widgets");
    if (saved) {
      setWidgets(JSON.parse(saved));
    }
  }, [user]);

  const saveWidgets = (newWidgets: DashboardWidget[]) => {
    setWidgets(newWidgets);
    localStorage.setItem("dashboard_widgets", JSON.stringify(newWidgets));
  };

  const toggleWidget = (id: string) => {
    const newWidgets = widgets.map(w => 
      w.id === id ? { ...w, visible: !w.visible } : w
    );
    saveWidgets(newWidgets);
  };

  const removeWidget = (id: string) => {
    const newWidgets = widgets.filter(w => w.id !== id);
    saveWidgets(newWidgets);
  };

  const moveWidget = (fromIndex: number, toIndex: number) => {
    const newWidgets = [...widgets];
    const [moved] = newWidgets.splice(fromIndex, 1);
    newWidgets.splice(toIndex, 0, moved);
    newWidgets.forEach((w, i) => w.order = i);
    saveWidgets(newWidgets);
  };

  const visibleWidgets = widgets.filter(w => w.visible).sort((a, b) => a.order - b.order);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">My Dashboard</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <HiDotsVertical className="w-4 h-4" />
          {isEditing ? "Done" : "Customize"}
        </button>
      </div>

      {isEditing && (
        <div className="mb-4 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Toggle widgets to show:</p>
          <div className="space-y-2">
            {widgets.map((widget, index) => (
              <div key={widget.id} className="flex items-center gap-2">
                <button
                  onClick={() => moveWidget(index, Math.max(0, index - 1))}
                  disabled={index === 0}
                  className="p-1 text-muted-foreground disabled:opacity-50"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveWidget(index, Math.min(widgets.length - 1, index + 1))}
                  disabled={index === widgets.length - 1}
                  className="p-1 text-muted-foreground disabled:opacity-50"
                >
                  ↓
                </button>
                <label className="flex items-center gap-2 flex-1">
                  <input
                    type="checkbox"
                    checked={widget.visible}
                    onChange={() => toggleWidget(widget.id)}
                    className="rounded"
                  />
                  <span className="text-sm">{widget.title}</span>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {visibleWidgets.map(widget => (
          <div key={widget.id} className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{widget.title}</h3>
            </div>
            {widget.type === "upcoming_events" && (
              <p className="text-sm text-muted-foreground">No upcoming events</p>
            )}
            {widget.type === "recent_sermons" && (
              <p className="text-sm text-muted-foreground">No recent sermons</p>
            )}
            {widget.type === "prayer_requests" && (
              <p className="text-sm text-muted-foreground">No pending prayer requests</p>
            )}
            {widget.type === "giving_summary" && (
              <p className="text-sm text-muted-foreground">₦0 total given</p>
            )}
            {widget.type === "my_groups" && (
              <p className="text-sm text-muted-foreground">No active groups</p>
            )}
            {widget.type === "anniversary_countdown" && (
              <AnniversaryCountdown />
            )}
            {widget.type === "event_checkin_stats" && (
              <EventCheckinStats />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}