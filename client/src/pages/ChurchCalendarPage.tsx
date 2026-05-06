import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LuCalendar, LuPlus, LuClock, LuMapPin, LuUsers } from "react-icons/lu";
import { useState } from "react";

const events = [
  { id: 1, title: "Sunday Service", date: "2026-05-11", time: "10:00 AM", type: "service", location: "Main Sanctuary", attendees: 250 },
  { id: 2, title: "Bible Study", date: "2026-05-13", time: "7:00 PM", type: "study", location: "Fellowship Hall", attendees: 45 },
  { id: 3, title: "Youth Meeting", date: "2026-05-14", time: "6:00 PM", type: "youth", location: "Youth Center", attendees: 60 },
  { id: 4, title: "Prayer Meeting", date: "2026-05-15", time: "7:00 PM", type: "prayer", location: "Prayer Room", attendees: 30 },
];

const typeColors: Record<string, string> = {
  service: "bg-blue-100 text-blue-800",
  study: "bg-green-100 text-green-800",
  youth: "bg-purple-100 text-purple-800",
  prayer: "bg-yellow-100 text-yellow-800",
};

export default function ChurchCalendarPage() {
  const [view, setView] = useState<"month" | "week" | "list">("list");

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Calendar className="text-primary" />
          Church Calendar
        </h1>
        <div className="flex gap-2">
          <Button variant={view === "month" ? "default" : "outline"} size="sm" onClick={() => setView("month")}>Month</Button>
          <Button variant={view === "week" ? "default" : "outline"} size="sm" onClick={() => setView("week")}>Week</Button>
          <Button variant={view === "list" ? "default" : "outline"} size="sm" onClick={() => setView("list")}>List</Button>
          <Button><Plus className="mr-2 h-4 w-4" /> Add Event</Button>
        </div>
      </div>

      <div className="space-y-3">
        {events.map((event) => (
          <Card key={event.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{new Date(event.date).getDate()}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.date).toLocaleString('default', { month: 'short' })}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">{event.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {event.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {event.attendees} attending
                      </span>
                    </div>
                  </div>
                </div>
                <Badge className={typeColors[event.type]}>{event.type}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
