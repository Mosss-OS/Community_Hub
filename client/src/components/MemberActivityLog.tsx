import { format, formatDistanceToNow } from "date-fns";
import { LuPlay, LuHeart, LuCalendar, LuDollarSign, LuUsers, LuMessageSquare, LuUser, LuLogIn, LuLogOut, LuClock, LuVideo, LuBookOpen, LuCheckCircle } from 'react-icons/lu';
import { useMyActivity, useEngagementMetrics, type ActivityLog } from "@/hooks/use-member-activity";
import { Skeleton } from "@/components/ui/skeleton";

const activityIcons: Record<string, React.ReactNode> = {
  sermon_watch: <Play className="w-4 h-4" />,
  sermon_complete: <CheckCircle className="w-4 h-4" />,
  prayer_submit: <Heart className="w-4 h-4" />,
  prayer_pray: <Heart className="w-4 h-4" />,
  event_rsvp: <Calendar className="w-4 h-4" />,
  event_attend: <Calendar className="w-4 h-4" />,
  donation: <DollarSign className="w-4 h-4" />,
  group_join: <Users className="w-4 h-4" />,
  group_message: <MessageSquare className="w-4 h-4" />,
  profile_update: <User className="w-4 h-4" />,
  login: <LogIn className="w-4 h-4" />,
  logout: <LogOut className="w-4 h-4" />,
};

const activityColors: Record<string, string> = {
  sermon_watch: "bg-blue-100 text-blue-600",
  sermon_complete: "bg-green-100 text-green-600",
  prayer_submit: "bg-purple-100 text-purple-600",
  prayer_pray: "bg-pink-100 text-pink-600",
  event_rsvp: "bg-orange-100 text-orange-600",
  event_attend: "bg-green-100 text-green-600",
  donation: "bg-yellow-100 text-yellow-600",
  group_join: "bg-indigo-100 text-indigo-600",
  group_message: "bg-teal-100 text-teal-600",
  profile_update: "bg-gray-100 text-gray-600",
  login: "bg-emerald-100 text-emerald-600",
  logout: "bg-red-100 text-red-600",
};

function ActivityItem({ activity }: { activity: ActivityLog }) {
  const icon = activityIcons[activity.type] || <Clock className="w-4 h-4" />;
  const colorClass = activityColors[activity.type] || "bg-gray-100 text-gray-600";
  
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className={`p-2 rounded-full ${colorClass} flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 truncate">{activity.description}</p>
        <p className="text-xs text-gray-500 mt-1">
          {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="flex items-start gap-3 p-3">
      <Skeleton className="w-8 h-8 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
}

interface MemberActivityLogProps {
  limit?: number;
  showHeader?: boolean;
}

export function MemberActivityLog({ limit = 20, showHeader = true }: MemberActivityLogProps) {
  const { data: activities, isLoading } = useMyActivity(limit);
  
  if (isLoading) {
    return (
      <div className="space-y-2">
        {showHeader && <Skeleton className="h-6 w-48 mb-4" />}
        {[...Array(5)].map((_, i) => (
          <ActivitySkeleton key={i} />
        ))}
      </div>
    );
  }
  
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No activity yet</p>
        <p className="text-sm mt-1">Start exploring to see your activity here</p>
      </div>
    );
  }
  
  return (
    <div>
      {showHeader && (
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      )}
      <div className="space-y-1">
        {activities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  );
}

export function EngagementStats() {
  const { data: metrics, isLoading } = useEngagementMetrics();
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    );
  }
  
  if (!metrics) return null;
  
  const stats = [
    { label: "Sermons Watched", value: metrics.sermonsWatched, icon: <Video className="w-5 h-5" />, color: "bg-blue-50 text-blue-600" },
    { label: "Prayers Submitted", value: metrics.prayersSubmitted, icon: <Heart className="w-5 h-5" />, color: "bg-purple-50 text-purple-600" },
    { label: "Events Attended", value: metrics.eventsAttended, icon: <Calendar className="w-5 h-5" />, color: "bg-orange-50 text-orange-600" },
    { label: "Group Messages", value: metrics.groupMessages, icon: <MessageSquare className="w-5 h-5" />, color: "bg-teal-50 text-teal-600" },
  ];
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className={`p-4 rounded-lg ${stat.color}`}>
          <div className="flex items-center gap-2 mb-1">
            {stat.icon}
            <span className="text-2xl font-bold">{stat.value}</span>
          </div>
          <p className="text-xs font-medium opacity-80">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
