import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Megaphone, X, Check } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
}

export function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    { id: "1", title: "Easter Service", content: "Join us for Easter service at 10AM!", isActive: true, createdAt: "2026-04-20" },
    { id: "2", title: "Youth Conference", content: "Register now for the youth conference!", isActive: true, createdAt: "2026-05-01" },
  ]);

  const active = announcements.filter(a => a.isActive);

  if (active.length === 0) return null;

  return (
    <div className="space-y-2">
      {active.map(a => (
        <Card key={a.id} className="border-l-4 border-l-blue-500 bg-blue-50">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Megaphone className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">{a.title}</p>
                <p className="text-sm text-muted-foreground">{a.content}</p>
              </div>
            </div>
            <Badge variant="secondary">New</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
