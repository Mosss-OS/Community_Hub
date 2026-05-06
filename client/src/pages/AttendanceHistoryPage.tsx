import { useState } from "react";
import { useAttendance } from "@/hooks/use-attendance";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LuCalendar, LuClock, LuVideo, LuMapPin, LuLoader2, LuCheckCircle2 } from 'react-icons/lu';
import { useLocation } from "wouter";

const serviceTypeLabels: Record<string, string> = {
  SUNDAY_SERVICE: "Sunday Service",
  MIDWEEK_SERVICE: "Midweek Service",
  SPECIAL_EVENT: "Special Event",
  ONLINE_LIVE: "Online Live",
  ONLINE_REPLAY: "Online Replay",
};

const serviceTypeColors: Record<string, string> = {
  SUNDAY_SERVICE: "bg-blue-500",
  MIDWEEK_SERVICE: "bg-purple-500",
  SPECIAL_EVENT: "bg-orange-500",
  ONLINE_LIVE: "bg-green-500",
  ONLINE_REPLAY: "bg-teal-500",
};

export default function AttendanceHistoryPage() {
  const { data: attendance, isLoading, error } = useAttendance();
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [filter, setFilter] = useState<string | null>(null);

  const filteredAttendance = filter
    ? attendance?.filter((a) => a.serviceType === filter)
    : attendance;

  const groupedByMonth = filteredAttendance?.reduce(
    (groups, record) => {
      const date = new Date(record.serviceDate);
      const monthYear = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(record);
      return groups;
    },
    {} as Record<string, typeof attendance>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to load attendance history</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalServices = attendance?.length || 0;
  const onlineCount = attendance?.filter((a) => a.isOnline).length || 0;
  const inPersonCount = totalServices - onlineCount;

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Attendance</h1>
          <p className="text-muted-foreground mt-1">
            Track your journey with us
          </p>
        </div>
        <Button onClick={() => setLocation("/")}>
          Back to Home
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalServices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Person</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{inPersonCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{onlineCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter by Service Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === null ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(null)}
            >
              All
            </Button>
            {Object.entries(serviceTypeLabels).map(([type, label]) => (
              <Button
                key={type}
                variant={filter === type ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(type)}
              >
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {filteredAttendance && filteredAttendance.length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedByMonth || {}).map(([monthYear, records]) => (
            <div key={monthYear}>
              <h2 className="text-lg font-semibold mb-4">{monthYear}</h2>
              <div className="space-y-3">
                {((records as any[]) || []).map((record) => (
                  <Card key={record.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              className={`${serviceTypeColors[record.serviceType]} text-white`}
                            >
                              {serviceTypeLabels[record.serviceType]}
                            </Badge>
                            {record.isOnline && (
                              <Badge variant="outline">
                                <Video className="h-3 w-3 mr-1" />
                                Online
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-medium">{record.serviceName}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(record.serviceDate).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "long",
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                            {record.checkInTime && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Checked in at{" "}
                                {new Date(record.checkInTime).toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "numeric",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            )}
                            {record.watchDuration && record.isOnline && (
                              <span className="flex items-center gap-1">
                                <Video className="h-4 w-4" />
                                {Math.floor(record.watchDuration / 60)} min watch
                              </span>
                            )}
                          </div>
                          {record.notes && (
                            <p className="mt-2 text-sm text-muted-foreground italic">
                              Note: {record.notes}
                            </p>
                          )}
                        </div>
                        <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No attendance records</h3>
            <p className="text-muted-foreground mb-4">
              You haven&apos;t checked into any services yet.
            </p>
            <Button onClick={() => setLocation("/")}>
              Check in to a Service
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
