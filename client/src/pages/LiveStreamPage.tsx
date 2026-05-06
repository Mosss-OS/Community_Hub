import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LuPlay, LuEye, LuUsers, LuArrowLeft, LuStopCircle, LuYoutube, LuCheckCircle, LuWifi } from 'react-icons/lu';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { buildApiUrl } from "@/lib/api-config";

interface LiveStream {
  id: number; title: string; description: string | null; streamUrl: string | null;
  embedUrl: string | null; youtubeVideoId: string | null; youtubeChannelId: string | null;
  youtubeChannelName: string | null; isLive: boolean; startedAt: string | null;
  endedAt: string | null; viewerCount: number; createdAt: string;
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = localStorage.getItem('auth_token');
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export default function LiveStreamPage() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.isAdmin;
  const [hasMarkedAttendance, setHasMarkedAttendance] = useState(false);

  const markAttendanceMutation = useMutation({
    mutationFn: async (streamId: number) => {
      const res = await fetch(buildApiUrl(`/api/live-streams/${streamId}/attendance`), { method: "POST", credentials: "include", headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to mark attendance");
      return res.json();
    },
    onSuccess: () => { setHasMarkedAttendance(true); queryClient.invalidateQueries({ queryKey: ["/api/live-streams/current"] }); },
  });

  const { data: currentStream, isLoading: loadingCurrent, error: currentError } = useQuery<LiveStream | null>({
    queryKey: ["/api/live-streams/current"],
    queryFn: async () => { 
      try {
        const res = await fetch(buildApiUrl("/api/live-streams/current")); 
        if (!res.ok) return null;
        return res.json();
      } catch {
        return null;
      }
    },
    refetchInterval: 15000,
  });

  const { data: streams, isLoading: loadingStreams } = useQuery<LiveStream[]>({
    queryKey: ["/api/live-streams"],
    queryFn: async () => { 
      try {
        const res = await fetch(buildApiUrl("/api/live-streams")); 
        if (!res.ok) return [];
        return res.json();
      } catch {
        return [];
      }
    },
  });

  const endStreamMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(buildApiUrl(`/api/live-streams/${id}/end`), { method: "POST", credentials: "include", headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to end stream");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/live-streams"] }); },
  });

  if (loadingCurrent || loadingStreams) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <Skeleton className="h-[60vh] w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-0 py-0">
      {/* Header */}
      <div className="sticky top-0 z-50 glass-card-strong border-b border-border/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")} className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold font-[--font-display]">Live Stream</h1>
          {currentStream && (
            <span className="px-3 py-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              LIVE
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {currentStream && (
            <>
              <span className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                <Eye className="w-4 h-4" /> {currentStream.viewerCount}
              </span>
              {user && !hasMarkedAttendance && (
                <Button
                  size="sm" variant="outline"
                  onClick={() => currentStream && markAttendanceMutation.mutate(currentStream.id)}
                  disabled={markAttendanceMutation.isPending}
                  className="gap-1.5 rounded-2xl font-bold border-border/50"
                >
                  <CheckCircle className="w-4 h-4" />
                  {markAttendanceMutation.isPending ? "Marking..." : "Mark Attendance"}
                </Button>
              )}
              {hasMarkedAttendance && (
                <span className="text-primary flex items-center gap-1 text-sm font-bold">
                  <CheckCircle className="w-4 h-4" /> Attending
                </span>
              )}
            </>
          )}
          {isAdmin && (
            <Button size="sm" onClick={() => setLocation("/admin/live-stream/new")} className="rounded-2xl font-bold gradient-accent text-primary-foreground shadow-lg">
              <Youtube className="mr-1.5 h-4 w-4" /> Go Live
            </Button>
          )}
        </div>
      </div>

      {/* Current Live Stream */}
      {currentStream ? (
        <div className="mb-0">
          <Card className="overflow-hidden rounded-none border-0">
            {currentStream.youtubeVideoId ? (
              <div className="relative w-full bg-[hsl(var(--teal-dark))]" style={{ height: "calc(100vh - 57px)" }}>
                <iframe
                  src={`https://www.youtube.com/embed/${currentStream.youtubeVideoId}?autoplay=1&mute=1&live=1&rel=0&modestbranding=1`}
                  className="absolute top-0 left-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                  title={currentStream.title}
                />
              </div>
            ) : currentStream.embedUrl ? (
              <div className="relative w-full" style={{ height: "calc(100vh - 57px)" }}>
                <iframe 
                  src={currentStream.embedUrl} 
                  className="absolute top-0 left-0 w-full" 
                  style={{ height: "100%" }} 
                  allow="autoplay; encrypted-media; fullscreen" 
                  allowFullScreen 
                  title={currentStream.title}
                />
              </div>
            ) : currentStream.streamUrl ? (
              <div className="w-full flex items-center justify-center gradient-hero" style={{ height: "calc(100vh - 57px)" }}>
                <video 
                  src={currentStream.streamUrl} 
                  controls 
                  autoPlay 
                  playsInline
                  className="w-full h-full max-h-[calc(100vh-57px)]"
                >
                  Your browser does not support video playback.
                </video>
              </div>
            ) : (
              <div className="w-full flex items-center justify-center gradient-hero" style={{ height: "calc(100vh - 57px)" }}>
                <div className="text-center text-white">
                  <Users className="w-16 h-16 mx-auto mb-4 text-white/20" />
                  <p className="text-lg font-medium text-white/50">Live stream is starting soon...</p>
                </div>
              </div>
            )}
          </Card>

          <div className="glass-card-strong p-4 border-t border-border/20">
            <div className="flex items-start justify-between gap-4 max-w-4xl mx-auto">
              <div>
                <h2 className="text-xl font-bold mb-1 font-[--font-display]">{currentStream.title}</h2>
                {currentStream.description && <p className="text-muted-foreground text-sm mb-2">{currentStream.description}</p>}
                {currentStream.startedAt && <p className="text-muted-foreground/50 text-xs mt-1">Started {format(new Date(currentStream.startedAt), "MMM d, yyyy 'at' h:mm a")}</p>}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="font-medium">{currentStream.viewerCount || 0}</span>
                  <span className="text-xs">watching</span>
                </div>
                {isAdmin && (
                  <Button variant="destructive" size="sm" className="rounded-2xl font-bold" onClick={() => endStreamMutation.mutate(currentStream.id)} disabled={endStreamMutation.isPending}>
                    <StopCircle className="mr-1 h-4 w-4" /> {endStreamMutation.isPending ? "Ending..." : "End"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-16 glass-card rounded-3xl">
            <Youtube className="w-16 h-16 mx-auto mb-4 text-muted-foreground/15" />
            <h2 className="text-xl font-bold mb-2 font-[--font-display]">No Live Stream Currently</h2>
            <p className="text-muted-foreground">Check back later for live services and events.</p>
            {isAdmin && (
              <Button className="mt-4 rounded-2xl font-bold gradient-accent text-primary-foreground shadow-lg" onClick={() => setLocation("/admin/live-stream/new")}>Start YouTube Stream</Button>
            )}
          </div>
        </div>
      )}

      {/* Past Streams */}
      {!currentStream && (
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-6 font-[--font-display]">Past Services & Replays</h2>
          {streams && streams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {streams.filter(s => !s.isLive).map((stream) => (
                <div key={stream.id} className="glass-card-strong rounded-3xl overflow-hidden hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-1" onClick={() => setLocation(`/sermons`)}>
                  <div className="aspect-video bg-muted relative">
                    {stream.youtubeVideoId ? (
                      <img
                        src={`https://img.youtube.com/vi/${stream.youtubeVideoId}/maxresdefault.jpg`}
                        alt={stream.title} className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&auto=format&fit=crop&q=60"; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10"><Play className="w-12 h-12 text-primary/20" /></div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-[hsl(220,30%,8%)/50] transition-opacity">
                      <div className="w-14 h-14 rounded-full gradient-accent flex items-center justify-center shadow-xl"><Play className="h-5 w-5 text-primary-foreground ml-0.5" /></div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold mb-2 line-clamp-1 font-[--font-display]">{stream.title}</h3>
                    {stream.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{stream.description}</p>}
                    {stream.startedAt && <p className="text-xs text-muted-foreground/50">{format(new Date(stream.startedAt), "MMMM d, yyyy")}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No past streams available.</p>
          )}
        </div>
      )}
    </div>
  );
}
