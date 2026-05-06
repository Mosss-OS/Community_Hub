import { useEngagementMetrics } from "@/hooks/use-member-activity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LuLoader2, LuTv, LuHeart, LuCalendar, LuBookOpen, LuMessageSquare, LuClock } from 'react-icons/lu';
import { Progress } from "@/components/ui/progress";

export function MemberEngagementScore() {
  const { data: metrics, isLoading } = useEngagementMetrics();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return null;
  }

  const calculateScore = () => {
    const weights = {
      sermonsWatched: 20,
      prayersSubmitted: 15,
      eventsAttended: 25,
      devotionalsRead: 20,
      groupMessages: 10,
      loginCount: 10,
    };

    const maxValues = {
      sermonsWatched: 50,
      prayersSubmitted: 30,
      eventsAttended: 20,
      devotionalsRead: 50,
      groupMessages: 100,
      loginCount: 30,
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.keys(weights).forEach((key) => {
      const weight = weights[key as keyof typeof weights];
      const value = metrics[key as keyof typeof metrics] as number || 0;
      const max = maxValues[key as keyof typeof maxValues];
      const normalized = Math.min(value / max, 1);
      totalScore += normalized * weight;
      totalWeight += weight;
    });

    return Math.round((totalScore / totalWeight) * 100);
  };

  const score = calculateScore();

  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-green-600";
    if (s >= 60) return "text-blue-600";
    if (s >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (s: number) => {
    if (s >= 80) return "Highly Engaged";
    if (s >= 60) return "Active";
    if (s >= 40) return "Moderately Active";
    return "Getting Started";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          Spiritual Engagement Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 text-center">
          <div className={`text-5xl font-bold ${getScoreColor(score)}`}>{score}</div>
          <p className="text-sm text-muted-foreground mt-1">{getScoreLabel(score)}</p>
          <Progress value={score} className="mt-3" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Tv className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{metrics.sermonsWatched || 0}</p>
              <p className="text-xs text-muted-foreground">Sermons</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{metrics.prayersSubmitted || 0}</p>
              <p className="text-xs text-muted-foreground">Prayers</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{metrics.eventsAttended || 0}</p>
              <p className="text-xs text-muted-foreground">Events</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{metrics.devotionalsRead || 0}</p>
              <p className="text-xs text-muted-foreground">Devotionals</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{metrics.groupMessages || 0}</p>
              <p className="text-xs text-muted-foreground">Messages</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{Math.round((metrics.totalSessionTime || 0) / 60)}m</p>
              <p className="text-xs text-muted-foreground">Session</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
