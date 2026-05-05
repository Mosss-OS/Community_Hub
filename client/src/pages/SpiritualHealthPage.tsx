import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { buildApiUrl } from "@/lib/api-config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, TrendingUp, BookOpen, Users, Activity, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface SpiritualHealthScore {
  id: number;
  userId: string;
  score: number;
  metrics: any;
  calculatedAt: string;
}

interface SpiritualHealthTrend {
  date: string;
  score: number;
}

async function fetchMyHealth(): Promise<SpiritualHealthScore | null> {
  const response = await fetch(buildApiUrl("/api/analytics/spiritual-health"));
  if (!response.ok) throw new Error("Failed to fetch spiritual health");
  return response.json();
}

async function fetchTrends(): Promise<SpiritualHealthTrend[]> {
  const response = await fetch(buildApiUrl("/api/analytics/spiritual-health-trends"));
  if (!response.ok) throw new Error("Failed to fetch trends");
  return response.json();
}

async function calculateHealth(): Promise<SpiritualHealthScore> {
  const response = await fetch(buildApiUrl("/api/analytics/spiritual-health/calculate"), {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to calculate");
  return response.json();
}

const metricIcons: Record<string, any> = {
  "sermon_views": BookOpen,
  "prayer_frequency": Heart,
  "event_attendance": Users,
  "group_participation": Users,
  "bible_reading": BookOpen,
  "service_participation": Activity,
};

export default function SpiritualHealthPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [timeRange, setTimeRange] = useState("90");

  const { data: health, isLoading } = useQuery({
    queryKey: ["spiritual-health"],
    queryFn: fetchMyHealth,
  });

  const { data: trends } = useQuery({
    queryKey: ["spiritual-trends"],
    queryFn: fetchTrends,
  });

  const calculateMutation = useMutation({
    mutationFn: calculateHealth,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spiritual-health"] });
      queryClient.invalidateQueries({ queryKey: ["spiritual-trends"] });
    },
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "bg-green-100 text-green-800" };
    if (score >= 60) return { label: "Good", color: "bg-blue-100 text-blue-800" };
    if (score >= 40) return { label: "Fair", color: "bg-yellow-100 text-yellow-800" };
    return { label: "Needs Improvement", color: "bg-red-100 text-red-800" };
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Spiritual Health</h1>
          <p className="text-muted-foreground">Track your spiritual growth and engagement</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="180">Last 6 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => calculateMutation.mutate()}
            disabled={calculateMutation.isPending}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${calculateMutation.isPending ? 'animate-spin' : ''}`} />
            Recalculate
          </Button>
        </div>
      </div>

      {/* Current Score */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Your Spiritual Health Score</CardTitle>
            <CardDescription>Based on your activity and engagement</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : health ? (
              <div className="text-center space-y-4">
                <div className={`text-6xl font-bold ${getScoreColor(health.score)}`}>
                  {health.score}
                </div>
                <Progress value={health.score} className="w-full" />
                {health.score && (
                  <Badge className={getScoreLabel(health.score).color}>
                    {getScoreLabel(health.score).label}
                  </Badge>
                )}
                <p className="text-xs text-muted-foreground">
                  Last calculated: {format(new Date(health.calculatedAt), "MMM d, yyyy")}
                </p>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No health score calculated yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Metrics Breakdown */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Metrics Breakdown</CardTitle>
            <CardDescription>Your engagement across different areas</CardDescription>
          </CardHeader>
          <CardContent>
            {health?.metrics ? (
              <div className="space-y-4">
                {Object.entries(health.metrics).map(([key, value]: [string, any]) => {
                  const Icon = metricIcons[key] || Activity;
                  const metricValue = typeof value === 'number' ? value : (value?.score || 0);
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium capitalize">
                            {key.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <span className="text-sm font-bold">{metricValue}%</span>
                      </div>
                      <Progress value={metricValue} className="w-full h-2" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Calculate your score to see metrics
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Spiritual Health Trends</CardTitle>
          <CardDescription>Your progress over time</CardDescription>
        </CardHeader>
        <CardContent>
          {trends?.length ? (
            <div className="space-y-2">
              {trends.map((trend, index) => (
                <div key={trend.date} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-muted-foreground">
                    {format(new Date(trend.date), "MMM d")}
                  </div>
                  <div className="flex-1">
                    <Progress value={trend.score} className="h-3" />
                  </div>
                  <div className={`w-12 text-sm font-bold text-right ${getScoreColor(trend.score)}`}>
                    {trend.score}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No trend data available yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
