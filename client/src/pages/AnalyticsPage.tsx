import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Video, 
  MapPin, 
  Loader2, 
  Calendar,
  DollarSign,
  Heart,
  Church,
  Download,
  FileSpreadsheet,
  FileText
} from "lucide-react";
import { buildApiUrl } from "@/lib/api-config";

interface DashboardStats {
  totalMembers: number;
  totalDonations: number;
  totalEvents: number;
  totalSermons: number;
  totalPrayers: number;
  recentDonations: number;
  recentAttendance: number;
}

interface DonationAnalytics {
  total: number;
  count: number;
  average: number;
  byMonth: { month: string; total: number }[];
  byStatus: { status: string; count: number; total: number }[];
}

interface MemberAnalytics {
  total: number;
  newMembers: number;
  byMonth: { month: string; count: number }[];
}

interface EventAnalytics {
  total: number;
  upcoming: number;
  past: number;
  totalRsvps: number;
  byMonth: { month: string; count: number }[];
}

interface PrayerAnalytics {
  total: number;
  totalPrayers: number;
  byMonth: { month: string; count: number }[];
}

export default function AnalyticsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [dateRange, setDateRange] = useState<"month" | "quarter" | "year">("quarter");
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [donationStats, setDonationStats] = useState<DonationAnalytics | null>(null);
  const [memberStats, setMemberStats] = useState<MemberAnalytics | null>(null);
  const [eventStats, setEventStats] = useState<EventAnalytics | null>(null);
  const [prayerStats, setPrayerStats] = useState<PrayerAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  let startDate: Date;
  
  switch (dateRange) {
    case "month":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "quarter":
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case "year":
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
  }

  useEffect(() => {
    async function fetchAnalytics() {
      if (!user?.isAdmin) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams({
          startDate: startDate.toISOString(),
          endDate: now.toISOString()
        });

        const [dashboardRes, donationRes, memberRes, eventRes, prayerRes] = await Promise.all([
          fetch(buildApiUrl("/api/analytics/dashboard"), { credentials: "include" }),
          fetch(buildApiUrl(`/api/analytics/donations?${params}`), { credentials: "include" }),
          fetch(buildApiUrl(`/api/analytics/members?${params}`), { credentials: "include" }),
          fetch(buildApiUrl(`/api/analytics/events?${params}`), { credentials: "include" }),
          fetch(buildApiUrl(`/api/analytics/prayers?${params}`), { credentials: "include" }),
        ]);

        if (!dashboardRes.ok) {
          const errorText = await dashboardRes.text();
          throw new Error(`Dashboard error (${dashboardRes.status}): ${errorText}`);
        }
        if (!donationRes.ok) {
          const errorText = await donationRes.text();
          throw new Error(`Donations error (${donationRes.status}): ${errorText}`);
        }
        if (!memberRes.ok) {
          const errorText = await memberRes.text();
          throw new Error(`Members error (${memberRes.status}): ${errorText}`);
        }
        if (!eventRes.ok) {
          const errorText = await eventRes.text();
          throw new Error(`Events error (${eventRes.status}): ${errorText}`);
        }
        if (!prayerRes.ok) {
          const errorText = await prayerRes.text();
          throw new Error(`Prayers error (${prayerRes.status}): ${errorText}`);
        }

        const [dashboardData, donationData, memberData, eventData, prayerData] = await Promise.all([
          dashboardRes.json(),
          donationRes.json(),
          memberRes.json(),
          eventRes.json(),
          prayerRes.json(),
        ]);

        setDashboardStats(dashboardData);
        setDonationStats(donationData);
        setMemberStats(memberData);
        setEventStats(eventData);
        setPrayerStats(prayerData);
      } catch (err: any) {
        console.error("Error fetching analytics:", err);
        setError(err.message || "Failed to load analytics. Make sure you're logged in as admin.");
      } finally {
        setLoading(false);
      }
    }

    if (user?.isAdmin) {
      fetchAnalytics();
    }
  }, [user, dateRange]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify(row[header] ?? '')).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const generateReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      dateRange,
      dashboard: dashboardStats,
      donations: donationStats,
      members: memberStats,
      events: eventStats,
      prayers: prayerStats
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `analytics_report_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics & Reporting</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive church metrics and insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant={dateRange === "month" ? "default" : "outline"} size="sm" onClick={() => setDateRange("month")}>Month</Button>
          <Button variant={dateRange === "quarter" ? "default" : "outline"} size="sm" onClick={() => setDateRange("quarter")}>Quarter</Button>
          <Button variant={dateRange === "year" ? "default" : "outline"} size="sm" onClick={() => setDateRange("year")}>Year</Button>
          <Button variant="outline" size="sm" onClick={() => {
            const data = donationStats?.byMonth?.map(d => d) || [];
            exportToCSV(data as any[], 'donations_report');
          }}>
            <FileSpreadsheet className="h-4 w-4 mr-1" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={generateReport}>
            <FileText className="h-4 w-4 mr-1" /> Report
          </Button>
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
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="donations">Donations</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="prayers">Prayers</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboardStats?.totalMembers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +{memberStats?.newMembers || 0} new this period
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatCurrency(dashboardStats?.totalDonations || 0)}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(dashboardStats?.recentDonations || 0)} this month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboardStats?.totalEvents || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {eventStats?.upcoming || 0} upcoming
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sermons</CardTitle>
                  <Video className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboardStats?.totalSermons || 0}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Attendance</CardTitle>
                  <CardDescription>Last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{dashboardStats?.recentAttendance || 0}</div>
                  <p className="text-sm text-muted-foreground mt-2">Check-ins recorded</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Prayer Requests</CardTitle>
                  <CardDescription>Total requests received</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{dashboardStats?.totalPrayers || 0}</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {prayerStats?.totalPrayers || 0} prayers lifted
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="donations" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatCurrency(donationStats?.total || 0)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Donations Count</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{donationStats?.count || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Donation</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatCurrency(donationStats?.average || 0)}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Donations by Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {donationStats?.byMonth && donationStats.byMonth.length > 0 ? (
                    donationStats.byMonth.map((item) => (
                      <div key={item.month} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{formatMonth(item.month)}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatCurrency(item.total)}
                          </span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ 
                              width: `${donationStats.total ? (item.total / donationStats.total) * 100 : 0}%` 
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No donation data for this period.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Donations by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {donationStats?.byStatus && donationStats.byStatus.length > 0 ? (
                    donationStats.byStatus.map((item) => (
                      <div key={item.status} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium capitalize">{item.status}</p>
                          <p className="text-sm text-muted-foreground">{item.count} donations</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(item.total)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No donation data.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Total Members</CardTitle>
                  <CardDescription>All registered members</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{memberStats?.total || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>New Members</CardTitle>
                  <CardDescription>Members joined in this period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{memberStats?.newMembers || 0}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Member Growth by Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {memberStats?.byMonth && memberStats.byMonth.length > 0 ? (
                    memberStats.byMonth.map((item) => (
                      <div key={item.month} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{formatMonth(item.month)}</span>
                          <span className="text-sm text-muted-foreground">
                            {item.count} new members
                          </span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ 
                              width: `${memberStats.newMembers ? (item.count / memberStats.newMembers) * 100 : 0}%` 
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No member data for this period.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{eventStats?.total || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{eventStats?.upcoming || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Past Events</CardTitle>
                  <Church className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{eventStats?.past || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total RSVPs</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{eventStats?.totalRsvps || 0}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Events by Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {eventStats?.byMonth && eventStats.byMonth.length > 0 ? (
                    eventStats.byMonth.map((item) => (
                      <div key={item.month} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{formatMonth(item.month)}</span>
                          <span className="text-sm text-muted-foreground">
                            {item.count} events
                          </span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ 
                              width: `${eventStats.total ? (item.count / eventStats.total) * 100 : 0}%` 
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No event data for this period.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prayers" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Total Prayer Requests</CardTitle>
                  <CardDescription>All prayer requests received</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{prayerStats?.total || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Total Prayers</CardTitle>
                  <CardDescription>Times prayers were lifted</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{prayerStats?.totalPrayers || 0}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Prayer Requests by Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prayerStats?.byMonth && prayerStats.byMonth.length > 0 ? (
                    prayerStats.byMonth.map((item) => (
                      <div key={item.month} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{formatMonth(item.month)}</span>
                          <span className="text-sm text-muted-foreground">
                            {item.count} requests
                          </span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-rose-500 rounded-full"
                            style={{ 
                              width: `${prayerStats.total ? (item.count / prayerStats.total) * 100 : 0}%` 
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No prayer request data for this period.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
