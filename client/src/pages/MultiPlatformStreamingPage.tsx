import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { LuBroadcast, LuYoutube, LuFacebook, LuLink, LuPlay, LuSquare } from "react-icons/lu";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { buildApiUrl } from "@/lib/api-config";

interface StreamPlatform {
  name: string;
  icon: React.ReactNode;
  enabled: boolean;
  streamKey: string;
  rtmpUrl: string;
  configured: boolean;
}

export default function MultiPlatformStreamingPage() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedSermon, setSelectedSermon] = useState("");
  const [platforms, setPlatforms] = useState<StreamPlatform[]>([
    {
      name: "YouTube",
      icon: <LuYoutube className="h-5 w-5 text-red-600" />,
      enabled: false,
      streamKey: "",
      rtmpUrl: "rtmp://a.rtmp.youtube.com/live2",
      configured: false,
    },
    {
      name: "Facebook",
      icon: <LuFacebook className="h-5 w-5 text-blue-600" />,
      enabled: false,
      streamKey: "",
      rtmpUrl: "rtmps://live-api-s.facebook.com:443/rtmp",
      configured: false,
    },
    {
      name: "TikTok",
      icon: <span className="text-lg font-bold">TT</span>,
      enabled: false,
      streamKey: "",
      rtmpUrl: "rtmp://push.tiktokcdn.com/stream",
      configured: false,
    },
  ]);

  const { data: sermons } = useQuery({
    queryKey: ["sermons-list"],
    queryFn: async () => {
      const res = await fetch(buildApiUrl("/api/sermons"), { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const togglePlatform = (index: number) => {
    setPlatforms(platforms.map((p, i) => 
      i === index ? { ...p, enabled: !p.enabled } : p
    ));
  };

  const updatePlatformKey = (index: number, key: string) => {
    setPlatforms(platforms.map((p, i) => 
      i === index ? { ...p, streamKey: key, configured: !!key } : p
    ));
  };

  const startMultiStream = () => {
    setIsStreaming(true);
    // In production, this would trigger server-side RTMP relay
  };

  const stopMultiStream = () => {
    setIsStreaming(false);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Broadcast className="text-primary" />
        Multi-Platform Streaming
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Stream Setup</CardTitle>
          <CardDescription>Configure and stream to multiple platforms simultaneously</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Sermon/Live Stream</Label>
            <Select value={selectedSermon} onValueChange={setSelectedSermon}>
              <SelectTrigger><SelectValue placeholder="Choose a sermon to stream" /></SelectTrigger>
              <SelectContent>
                {sermons?.map((s: any) => (
                  <SelectItem key={s.id} value={s.id.toString()}>{s.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Platforms</Label>
            {platforms.map((platform, index) => (
              <Card key={platform.name}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {platform.icon}
                      <span className="font-medium">{platform.name}</span>
                    </div>
                    <Switch 
                      checked={platform.enabled} 
                      onCheckedChange={() => togglePlatform(index)}
                    />
                  </div>
                  {platform.enabled && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Stream Key</Label>
                        <div className="flex gap-2">
                          <Input 
                            type="password"
                            value={platform.streamKey}
                            onChange={(e) => updatePlatformKey(index, e.target.value)}
                            placeholder={`Enter ${platform.name} stream key`}
                          />
                          <Button variant="outline" size="icon">
                            <Link className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        RTMP URL: {platform.rtmpUrl}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            {!isStreaming ? (
              <Button onClick={startMultiStream} disabled={!selectedSermon || !platforms.some(p => p.enabled && p.configured)}>
                <Play className="mr-2 h-4 w-4" />
                Start Streaming
              </Button>
            ) : (
              <Button onClick={stopMultiStream} variant="destructive">
                <Square className="mr-2 h-4 w-4" />
                Stop Streaming
              </Button>
            )}
          </div>

          {isStreaming && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-600">
                  <div className="h-2 w-2 bg-red-600 rounded-full animate-pulse" />
                  <span className="font-medium">LIVE - Streaming to {platforms.filter(p => p.enabled && p.configured).length} platforms</span>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Streaming Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p><strong>YouTube:</strong> Get stream key from YouTube Studio → Go Live → Stream Key</p>
            <p><strong>Facebook:</strong> Create live video in Creator Studio → Copy stream key</p>
            <p><strong>TikTok:</strong> Access via TikTok Live Studio or request Live API access</p>
            <p className="text-yellow-600">Note: Multi-platform streaming requires a server-side RTMP relay service for production use.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
