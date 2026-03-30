"use client";

import { useState } from "react";
import { X, Bell, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Announcement {
  id: string;
  message: string;
  type: "info" | "warning" | "success";
  dismissible?: boolean;
}

interface AnnouncementBannerProps {
  announcements: Announcement[];
  onDismiss?: (id: string) => void;
}

export function AnnouncementBanner({ announcements, onDismiss }: AnnouncementBannerProps) {
  const [dismissed, setDismissed] = useState<string[]>([]);

  const visible = announcements.filter(a => !dismissed.includes(a.id));

  if (visible.length === 0) return null;

  const getStyles = (type: string) => {
    switch (type) {
      case "warning": return "bg-yellow-500/10 border-yellow-500 text-yellow-700";
      case "success": return "bg-green-500/10 border-green-500 text-green-700";
      default: return "bg-blue-500/10 border-blue-500 text-blue-700";
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "warning": return <AlertTriangle className="h-4 w-4" />;
      case "success": return <CheckCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const handleDismiss = (id: string) => {
    setDismissed([...dismissed, id]);
    onDismiss?.(id);
  };

  return (
    <div className="space-y-2">
      {visible.map(announcement => (
        <div
          key={announcement.id}
          className={`flex items-center gap-3 px-4 py-2 rounded-lg border ${getStyles(announcement.type)}`}
        >
          {getIcon(announcement.type)}
          <p className="flex-1 text-sm">{announcement.message}</p>
          {announcement.dismissible !== false && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDismiss(announcement.id)}>
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}

export function AnnouncementBannerFixed({ announcement }: { announcement: Announcement }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const getStyles = (type: string) => {
    switch (type) {
      case "warning": return "bg-yellow-500 border-yellow-500";
      case "success": return "bg-green-500 border-green-500";
      default: return "bg-blue-500 border-blue-500";
    }
  };

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${getStyles(announcement.type)} text-white px-4 py-2`}>
      <div className="container mx-auto flex items-center justify-center gap-3">
        <Bell className="h-4 w-4" />
        <p className="text-sm font-medium">{announcement.message}</p>
        {announcement.dismissible !== false && (
          <Button variant="ghost" size="icon" className="h-6 w-6 text-white" onClick={() => setDismissed(true)}>
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
