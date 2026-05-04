import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Headphones, Music } from "lucide-react";

interface PodcastEpisode {
  id: string;
  title: string;
  url: string;
  duration: string;
}

export function AudioPodcastFeed() {
  const episodes: PodcastEpisode[] = [
    { id: "1", title: "Sunday Sermon - Faith", url: "/sermons/1/audio", duration: "45:30" },
    { id: "2", title: "Bible Study - Prayer", url: "/sermons/2/audio", duration: "38:15" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Headphones className="h-5 w-5 text-primary" /> Audio Podcast Feed</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {episodes.map(ep => (
          <div key={ep.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="font-medium">{ep.title}</p>
              <p className="text-sm text-muted-foreground">{ep.duration}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => window.open(ep.url)}>
              <Music className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
