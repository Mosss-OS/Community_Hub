import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { buildApiUrl } from "@/lib/api-config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Activity, TrendingUp, Users, Clock } from "lucide-react";
import { format } from "date-fns";

interface MemberActivity {
  id: number;
  userId: string;
  activityType: string;
  metadata: any;
  createdAt: string;
}

interface EngagementMetrics {
  userId: string;
  sermonsViewed: number;
  prayersMade: number;
  eventsAttended: number;
  groupsJoined: number;
  lastActive: string;
}

async function fetchMyActivity(): Promise<MemberActivity[]> {
  const response = await fetch(buildApiUrl("/api/analytics/my-engagement"));
  if (!response.ok) throw new Error("Failed to fetch activity");
  return response.json();
}

async function fetchEngagementSummary(): Promise<any> {
  const response = await fetch(buildApiUrl("/api/analytics/engagement-summary"));
  if (!response.ok) throw new Error("Failed to fetch summary");
  return response.json();
}

const activityIcons: Record<string, any> = {
  "SERMON_VIEW": TrendingUp,
  "PRAYER_CREATE": Activity,
  "EVENT_ATTEND": Users,
  "GROUP_JOIN": Users,
  "TASK_COMPLETE": Activity,
  "DONATION_GIVE": TrendingUp,
};

const activityLabels: Record<string, string> = {
  "SERMON_VIEW": "Watched a sermon",
  "PRAYER_CREATE": "Created prayer request",
  "EVENT_ATTEND": "Attended an event",
  "GROUP_JOIN": "Joined a group",
  "TASK_COMPLETE": "Completed a task",
  "DONATION_GIVE": "Made a donation",
};

export default function MemberActivityPage() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("30");

  const { data: activities, isLoading } = useQuery({
    queryKey: ["my-activity"],
    queryFn: fetchMyActivity,
  });

  const { data: summary } = useQuery({
    queryKey: ["engagement-summary"],
    queryFn: fetchEngagementSummary,
    enabled: !!user?.isAdmin,
  });

  const filteredActivities = activities?.filter(a => {
    const days = parseInt(timeRange);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return new Date(a.createdAt) >= cutoff;
  });

  const activityCounts = filteredActivities?.reduce((acc, a) => {
    acc[a.activityType] = (acc[a.activityType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Activity</h1>
          <p className="text-muted-foreground">Track your engagement and activity</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalActiveUsers || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Session Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.avgSessionDuration || '0m'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sermons Viewed</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalSermonsViewed || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Events Attended</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalEventsAttended || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Activity Types Summary */}
      {activityCounts && (
        <Card>
          <CardHeader>
            <CardTitle>Activity Breakdown</CardTitle>
            <CardDescription>Your activity distribution over the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(activityCounts).map(([type, count]) => {
                const Icon = activityIcons[type] || Activity;
                return (
                  <div key={type} className="flex items-center gap-3 p-3 border rounded">
                    <Icon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{activityLabels[type] || type}</p>
                      <p className="text-2xl font-bold">{count}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>Your recent activities</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading activity...</div>
          ) : filteredActivities?.length ? (
            <div className="space-y-4">
              {filteredActivities.map(activity => {
                const Icon = activityIcons[activity.activityType] || Activity;
                return (
                  <div key={activity.id} className="flex items-start gap-4 p-3 border rounded hover:bg-muted/50 transition-colors">
                    <div className="p-2 bg-primary/10 rounded">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activityLabels[activity.activityType] || activity.activityType}</p>
                      {activity.metadata && (
                        <p className="text-sm text-muted-foreground">
                          {JSON.stringify(activity.metadata).slice(0, 100)}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(activity.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No activity recorded in this period
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
