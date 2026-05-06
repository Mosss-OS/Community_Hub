import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LuScissors, LuPlay, LuPause, LuShare2, LuDownload, LuClock } from "react-icons/lu";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { buildApiUrl } from "@/lib/api-config";

interface Sermon {
  id: number;
  title: string;
  videoUrl?: string;
  audioUrl?: string;
  duration?: number;
}

export default function SermonClipCreatorPage() {
  const [selectedSermon, setSelectedSermon] = useState<string>("");
  const [clipStart, setClipStart] = useState(0);
  const [clipEnd, setClipEnd] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [clipTitle, setClipTitle] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  const { data: sermons } = useQuery({
    queryKey: ["sermons-for-clips"],
    queryFn: async () => {
      const res = await fetch(buildApiUrl("/api/sermons"), { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const selectedSermonData = sermons?.find((s: Sermon) => s.id.toString() === selectedSermon);
  const duration = selectedSermonData?.duration || 3600; // default 1 hour

  useEffect(() => {
    if (selectedSermonData) {
      setClipEnd(Math.min(60, duration));
      setClipStart(0);
      setClipTitle(`Clip from ${selectedSermonData.title}`);
    }
  }, [selectedSermon, selectedSermonData, duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimelineChange = (value: number, type: 'start' | 'end') => {
    if (type === 'start') {
      setClipStart(Math.min(value, clipEnd - 1));
    } else {
      setClipEnd(Math.max(value, clipStart + 1));
    }
  };

  const handlePreview = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = clipStart;
      videoRef.current.play();
      setIsPlaying(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      }, (clipEnd - clipStart) * 1000);
    }
  };

  const handleCreateClip = () => {
    // This would call an API to create the clip
    alert(`Creating clip: ${clipTitle}\nFrom ${formatTime(clipStart)} to ${formatTime(clipEnd)}\nDuration: ${formatTime(clipEnd - clipStart)}`);
  };

  const clipDuration = clipEnd - clipStart;
  const startPercent = (clipStart / duration) * 100;
  const endPercent = (clipEnd / duration) * 100;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Scissors className="text-primary" />
        Sermon Clip Creator
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Select Sermon</CardTitle>
          <CardDescription>Choose a sermon to create clips from</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedSermon} onValueChange={setSelectedSermon}>
            <SelectTrigger><SelectValue placeholder="Select a sermon" /></SelectTrigger>
            <SelectContent>
              {sermons?.map((s: Sermon) => (
                <SelectItem key={s.id} value={s.id.toString()}>{s.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedSermon && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Video Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedSermonData?.videoUrl ? (
                <video 
                  ref={videoRef}
                  src={selectedSermonData.videoUrl} 
                  className="w-full rounded-lg"
                  controls
                  onTimeUpdate={(e) => setCurrentTime((e.target as HTMLVideoElement).currentTime)}
                />
              ) : (
                <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                  <p className="text-muted-foreground">No video available for this sermon</p>
                </div>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                Current position: {formatTime(currentTime)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Clip Timeline</CardTitle>
              <CardDescription>Adjust the start and end points to create your clip</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="clip-title">Clip Title</Label>
                <Input 
                  id="clip-title"
                  value={clipTitle}
                  onChange={(e) => setClipTitle(e.target.value)}
                  placeholder="Enter clip title"
                />
              </div>

              <div className="space-y-4">
                <div className="relative h-16 bg-gray-100 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center px-4">
                    <div className="text-xs text-muted-foreground w-12">{formatTime(0)}</div>
                    <div className="flex-1 relative h-8">
                      <div className="absolute inset-0 bg-gray-200 rounded" />
                      <div 
                        className="absolute top-0 bottom-0 bg-primary/30 border-2 border-primary rounded"
                        style={{ left: `${startPercent}%`, right: `${100 - endPercent}%` }}
                      />
                      <input
                        type="range"
                        min={0}
                        max={duration}
                        value={clipStart}
                        onChange={(e) => handleTimelineChange(Number(e.target.value), 'start')}
                        className="absolute inset-0 w-full opacity-0 cursor-pointer"
                      />
                      <input
                        type="range"
                        min={0}
                        max={duration}
                        value={clipEnd}
                        onChange={(e) => handleTimelineChange(Number(e.target.value), 'end')}
                        className="absolute inset-0 w-full opacity-0 cursor-pointer"
                      />
                    </div>
                    <div className="text-xs text-muted-foreground w-12 text-right">{formatTime(duration)}</div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <Label>Start Time</Label>
                    <Input 
                      type="number"
                      value={clipStart}
                      onChange={(e) => handleTimelineChange(Number(e.target.value), 'start')}
                      min={0}
                      max={clipEnd - 1}
                    />
                    <p className="text-xs text-muted-foreground">{formatTime(clipStart)}</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>End Time</Label>
                    <Input 
                      type="number"
                      value={clipEnd}
                      onChange={(e) => handleTimelineChange(Number(e.target.value), 'end')}
                      min={clipStart + 1}
                      max={duration}
                    />
                    <p className="text-xs text-muted-foreground">{formatTime(clipEnd)}</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>Clip Duration</Label>
                    <div className="h-10 flex items-center">
                      <span className="text-lg font-bold flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTime(clipDuration)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handlePreview} variant="outline">
                  {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                  Preview Clip
                </Button>
                <Button onClick={handleCreateClip}>
                  <Scissors className="mr-2 h-4 w-4" />
                  Create Clip
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Share to Social Media</CardTitle>
              <CardDescription>Share your clip directly to social platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share to TikTok
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share to Facebook
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share to YouTube
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Clips</CardTitle>
              <CardDescription>Previously created clips</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-medium">Morning Devotion Clip</p>
                    <p className="text-sm text-muted-foreground">0:30 - 1:45 • 1:15 duration</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Share2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="p-3 border rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-medium">Faith Teaching Highlights</p>
                    <p className="text-sm text-muted-foreground">10:00 - 15:30 • 5:30 duration</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Share2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
