"use client";

import { useEvents } from "@/hooks/use-events";
import { Link } from "wouter";
import { Calendar, Clock, MapPin, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface UpcomingEventsWidgetProps {
  limit?: number;
  showViewAll?: boolean;
}

export function UpcomingEventsWidget({ limit = 3, showViewAll = true }: UpcomingEventsWidgetProps) {
  const { data: events, isLoading } = useEvents();

  const upcomingEvents = events
    ?.filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, limit) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (upcomingEvents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">No upcoming events</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingEvents.map((event) => (
          <Link key={event.id} href={`/events/${event.id}`}>
            <div className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary">
                  {format(new Date(event.date), "MMM")}
                </span>
                <span className="text-lg font-bold text-primary leading-none">
                  {format(new Date(event.date), "d")}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{event.title}</h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Clock className="h-3 w-3" />
                  {format(new Date(event.date), "h:mm a")}
                </div>
                {event.location && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{event.location}</span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
        
        {showViewAll && (
          <Button variant="outline" className="w-full mt-2" asChild>
            <Link href="/events">
              View All Events
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
