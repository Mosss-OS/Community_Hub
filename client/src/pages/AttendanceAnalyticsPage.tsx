import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LuBarChart3, LuTrendingUp, LuUsers, LuVideo, LuMapPin, LuLoader2, LuCalendar, LuAlertCircle, LuDownload, LuRefreshCw, LuTarget, LuCheckCircle2 } from 'react-icons/lu';
import { buildApiUrl } from "@/lib/api-config";

const serviceTypeLabels: Record<string, string> = {
  SUNDAY_SERVICE: "Sunday Service",
  MIDWEEK_SERVICE: "Midweek Service",
  SPECIAL_EVENT: "Special Event",
  ONLINE_LIVE: "Online Live",
  ONLINE_REPLAY: "Online Replay",
};

interface StatsData {
  total: number;
  online: number;
  offline: number;
  byService: { serviceType: string; count: number }[];
}

interface CheckinStats {
  total: number;
  online: number;
  offline: number;
  totalMembers: number;
  expectedAttendance: number;
  checkInRate: number;
  lastUpdated: string;
  byService: { serviceType: string; serviceName: string; count: number }[];
}

export default function AttendanceAnalyticsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [dateRange, setDateRange] = useState<"week" | "month" | "quarter">("month");
  const [stats, setStats] = useState<StatsData | null>(null);
  const [checkinStats, setCheckinStats] = useState<CheckinStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkinLoading, setCheckinLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  let startDate: Date;
  
  switch (dateRange) {
    case "week":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "month":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "quarter":
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
  }

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams({
          startDate: startDate.toISOString(),
          endDate: now.toISOString()
        });
        
        const url = buildApiUrl(`/api/attendance/analytics?${params}`);
        console.log("Fetching:", url);
        
        const res = await fetch(url, { credentials: "include" });
        
        if (!res.ok) {
          const err = await res.json().catch(() => ({ message: "Failed to fetch" }));
          throw new Error(err.message);
        }
        
        const data = await res.json();
        console.log("Stats data:", data);
        setStats(data);
      } catch (err: any) {
        console.error("Error fetching stats:", err);
        setError(err.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }

    if (user?.isAdmin) {
      fetchStats();
    }
  }, [user, dateRange]);

  useEffect(() => {
    async function fetchCheckinStats() {
      setCheckinLoading(true);
      
      try {
        const url = buildApiUrl("/api/attendance/checkin-stats");
        const res = await fetch(url, { credentials: "include" });
        
        if (res.ok) {
          const data = await res.json();
          setCheckinStats(data);
        }
      } catch (err) {
        console.error("Error fetching check-in stats:", err);
      } finally {
        setCheckinLoading(false);
      }
    }

    if (user?.isAdmin) {
      fetchCheckinStats();
      const interval = setInterval(fetchCheckinStats, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              You don&apos;t have permission to view this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track engagement and growth
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant={dateRange === "week" ? "default" : "outline"} size="sm" onClick={() => setDateRange("week")}>Week</Button>
          <Button variant={dateRange === "month" ? "default" : "outline"} size="sm" onClick={() => setDateRange("month")}>Month</Button>
          <Button variant={dateRange === "quarter" ? "default" : "outline"} size="sm" onClick={() => setDateRange("quarter")}>Quarter</Button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      )}

      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
              <Button onClick={() => setDateRange(dateRange === "month" ? "week" : "month")}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !error && stats && (
        <>
          {checkinStats && (
            <Card className="mb-8 border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Today's Check-in Live</CardTitle>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <RefreshCw className="h-3 w-3" />
                    <span>Updates every 30s</span>
                    {checkinStats.lastUpdated && (
                      <span>Last updated: {new Date(checkinStats.lastUpdated).toLocaleTimeString()}</span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4 mb-4">
                  <div className="text-center p-4 bg-background rounded-xl">
                    <div className="text-4xl font-bold text-primary">{checkinStats.total}</div>
                    <p className="text-sm text-muted-foreground mt-1">Checked In</p>
                  </div>
                  <div className="text-center p-4 bg-background rounded-xl">
                    <div className="text-4xl font-bold text-green-600">{checkinStats.offline}</div>
                    <p className="text-sm text-muted-foreground mt-1">In Person</p>
                  </div>
                  <div className="text-center p-4 bg-background rounded-xl">
                    <div className="text-4xl font-bold text-blue-600">{checkinStats.online}</div>
                    <p className="text-sm text-muted-foreground mt-1">Online</p>
                  </div>
                  <div className="text-center p-4 bg-background rounded-xl">
                    <div className="text-4xl font-bold text-amber-600">{checkinStats.checkInRate}%</div>
                    <p className="text-sm text-muted-foreground mt-1">Check-in Rate</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-background rounded-xl">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Expected: {checkinStats.expectedAttendance}</span>
                    <span className="text-sm text-muted-foreground ml-4">Total Members: {checkinStats.totalMembers}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => {
                    const today = new Date();
                    const start = new Date(today);
                    start.setDate(start.getDate() - 7);
                    window.open(buildApiUrl(`/api/attendance/export?startDate=${start.toISOString()}&endDate=${today.toISOString()}&format=csv`), "_blank");
                  }}>
                    <Download className="h-4 w-4 mr-1" /> Export CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Attendance</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Person</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.offline}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.total ? Math.round((stats.offline / stats.total) * 100) : 0}% of total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Online</CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.online}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.total ? Math.round((stats.online / stats.total) * 100) : 0}% of total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg per Service</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats.byService?.length ? Math.round(stats.total / stats.byService.length) : 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Attendance by Service Type</CardTitle>
              <CardDescription>
                {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.byService && stats.byService.length > 0 ? (
                  stats.byService.map((service) => (
                    <div key={service.serviceType} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {serviceTypeLabels[service.serviceType] || service.serviceType}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {service.count} ({stats.total ? Math.round((service.count / stats.total) * 100) : 0}%)
                        </span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${stats.total ? (service.count / stats.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No attendance data for this period.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
