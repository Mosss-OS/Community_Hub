import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Youtube, Video, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { buildApiUrl } from "@/lib/api-config";

export default function AdminLiveStreamPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeVideoId, setYoutubeVideoId] = useState("");
  const [youtubeChannelId, setYoutubeChannelId] = useState("");
  const [youtubeChannelName, setYoutubeChannelName] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [streamType, setStreamType] = useState<"youtube" | "embed" | "url">("youtube");

  const createStreamMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(buildApiUrl("/api/live-streams"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create stream");
      return res.json();
    },
    onSuccess: () => {
      setLocation("/live");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data: any = {
      title,
      description,
    };

    if (streamType === "youtube") {
      data.youtubeVideoId = youtubeVideoId;
      data.youtubeChannelId = youtubeChannelId;
      data.youtubeChannelName = youtubeChannelName;
    } else if (streamType === "embed") {
      data.embedUrl = embedUrl;
    } else {
      data.streamUrl = streamUrl;
    }

    createStreamMutation.mutate(data);
  };

  const extractYouTubeVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
    return match ? match[1] : url;
  };

  if (!user?.isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Access denied. Admin only.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/live")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Start Live Stream</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-600" />
            Configure Live Stream
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Stream Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Sunday Service - Live"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Join us for worship and a message..."
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <Label>Stream Source</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={streamType === "youtube" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStreamType("youtube")}
                >
                  <Youtube className="mr-1 h-4 w-4" />
                  YouTube
                </Button>
                <Button
                  type="button"
                  variant={streamType === "embed" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStreamType("embed")}
                >
                  <Video className="mr-1 h-4 w-4" />
                  Embed
                </Button>
                <Button
                  type="button"
                  variant={streamType === "url" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStreamType("url")}
                >
                  <LinkIcon className="mr-1 h-4 w-4" />
                  URL
                </Button>
              </div>
            </div>

            {streamType === "youtube" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="youtubeUrl">YouTube Video URL or ID</Label>
                  <Input
                    id="youtubeUrl"
                    value={youtubeVideoId}
                    onChange={(e) => setYoutubeVideoId(extractYouTubeVideoId(e.target.value))}
                    placeholder="https://youtube.com/watch?v=xxxxx or just the video ID"
                  />
                  <p className="text-xs text-gray-500">
                    Enter the YouTube video URL or just the video ID. The video will be embedded with live playback.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="channelId">YouTube Channel ID (optional)</Label>
                    <Input
                      id="channelId"
                      value={youtubeChannelId}
                      onChange={(e) => setYoutubeChannelId(e.target.value)}
                      placeholder="UCxxxx..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="channelName">Channel Name (optional)</Label>
                    <Input
                      id="channelName"
                      value={youtubeChannelName}
                      onChange={(e) => setYoutubeChannelName(e.target.value)}
                      placeholder="CHub"
                    />
                  </div>
                </div>
              </>
            )}

            {streamType === "embed" && (
              <div className="space-y-2">
                <Label htmlFor="embedUrl">Embed URL</Label>
                <Input
                  id="embedUrl"
                  value={embedUrl}
                  onChange={(e) => setEmbedUrl(e.target.value)}
                  placeholder="https://player.vimeo.com/video/xxxxxx"
                />
              </div>
            )}

            {streamType === "url" && (
              <div className="space-y-2">
                <Label htmlFor="streamUrl">Stream URL</Label>
                <Input
                  id="streamUrl"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={createStreamMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {createStreamMutation.isPending ? "Starting..." : "Go Live"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/live")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
