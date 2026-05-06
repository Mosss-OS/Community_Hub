import { Link } from "wouter";
import { format, formatDistanceToNow } from "date-fns";
import { LuPlay, LuClock, LuCheckCircle, LuTrash2, LuHistory } from 'react-icons/lu';
import { useSermonWatchHistory, useClearWatchHistory, type SermonWatchHistory as SermonWatchHistoryType } from "@/hooks/use-sermon-history";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} min`;
}

function WatchHistoryItem({ item }: { item: SermonWatchHistoryType }) {
  const progressPercent = Math.round(item.watchProgress);
  
  return (
    <Link href={`/sermons/${item.sermonId}`} className="block">
      <div className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
        <div className="relative w-32 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
          {item.sermon?.thumbnailUrl ? (
            <img 
              src={item.sermon.thumbnailUrl} 
              alt={item.sermon.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
              <Play className="w-8 h-8 text-white opacity-80" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-10 h-10 text-white" />
          </div>
          {item.completed && (
            <div className="absolute top-1 right-1 bg-green-500 rounded-full p-0.5">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
            {item.sermon?.title || `Sermon #${item.sermonId}`}
          </h4>
          <p className="text-sm text-gray-500 mt-1">
            {item.sermon?.preacher || "Unknown preacher"}
            {item.sermon?.seriesName && ` • ${item.sermon.seriesName}`}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {item.sermon ? formatDuration(item.sermon.duration) : "--"}
            </span>
            <span>
              {formatDistanceToNow(new Date(item.lastWatchedAt), { addSuffix: true })}
            </span>
          </div>
          
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${item.completed ? 'bg-green-500' : 'bg-blue-500'}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 w-10">{progressPercent}%</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function WatchHistorySkeleton() {
  return (
    <div className="flex gap-4 p-3">
      <Skeleton className="w-32 h-20 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
}

interface SermonWatchHistoryProps {
  limit?: number;
  showClearButton?: boolean;
}

export function SermonWatchHistory({ limit = 10, showClearButton = false }: SermonWatchHistoryProps) {
  const { data: history, isLoading } = useSermonWatchHistory();
  const clearHistory = useClearWatchHistory();
  
  const displayedHistory = history?.slice(0, limit) || [];
  const totalWatched = history?.length || 0;
  const completedCount = history?.filter(h => h.completed).length || 0;
  
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <WatchHistorySkeleton key={i} />
        ))}
      </div>
    );
  }
  
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="font-medium">No watch history yet</p>
        <p className="text-sm mt-1">Start watching sermons to see your history here</p>
        <Link href="/sermons">
          <Button variant="outline" className="mt-4">
            Browse Sermons
          </Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-500">
          {totalWatched} sermon{totalWatched !== 1 ? 's' : ''} watched • {completedCount} completed
        </div>
        {showClearButton && totalWatched > 0 && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              if (confirm("Are you sure you want to clear your watch history?")) {
                clearHistory.mutate();
              }
            }}
            disabled={clearHistory.isPending}
            className="text-gray-500 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
      
      <div className="space-y-2">
        {displayedHistory.map((item) => (
          <WatchHistoryItem key={item.id} item={item} />
        ))}
      </div>
      
      {history.length > limit && (
        <Link href="/profile/watch-history">
          <Button variant="ghost" className="w-full mt-4">
            View All ({history.length})
          </Button>
        </Link>
      )}
    </div>
  );
}
