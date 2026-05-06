import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LuMegaphone, LuPlus, LuPin, LuBell, LuCalendar } from "react-icons/lu";
import { useState } from "react";

const announcements = [
  { id: 1, title: "Annual General Meeting", content: "Join us for the AGM on May 25th...", date: "2026-05-06", priority: "high", pinned: true },
  { id: 2, title: "Youth Retreat Registration", content: "Registration closes this Friday...", date: "2026-05-05", priority: "medium", pinned: false },
  { id: 3, title: "New Members Class", content: "Starting this Sunday after service...", date: "2026-05-04", priority: "medium", pinned: false },
  { id: 4, title: "Food Drive", content: "Donate non-perishable items...", date: "2026-05-03", priority: "low", pinned: false },
];

export default function AnnouncementsPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Megaphone className="text-primary" />
          Announcements
        </h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          New Announcement
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Post Announcement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <input className="w-full p-2 border rounded" placeholder="Announcement title" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <textarea className="w-full p-2 border rounded" rows={4} placeholder="Announcement details..." />
            </div>
            <div className="flex gap-2">
              <Button>Post Announcement</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {announcements.map((a) => (
          <Card key={a.id} className={a.pinned ? "border-primary" : ""}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {a.pinned && <Pin className="h-4 w-4 text-primary" />}
                    {a.title}
                  </CardTitle>
                  <CardDescription>
                    <Calendar className="inline h-3 w-3 mr-1" />
                    {a.date}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant={
                    a.priority === "high" ? "destructive" : 
                    a.priority === "medium" ? "default" : "secondary"
                  }>
                    {a.priority}
                  </Badge>
                  {a.pinned && <Badge variant="outline">Pinned</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{a.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
