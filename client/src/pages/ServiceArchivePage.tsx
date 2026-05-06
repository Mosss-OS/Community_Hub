import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LuPlay, LuDownload } from "react-icons/lu";

export default function ServiceArchivePage() {
  const recordings = [
    { title: "Sunday Service - May 4", date: "2026-05-04", duration: "1:45:30" },
    { title: "Midweek Service - Apr 30", date: "2026-04-30", duration: "1:20:15" },
    { title: "Youth Night - Apr 25", date: "2026-04-25", duration: "1:30:00" },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Service Archive</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recordings.map((rec, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="text-lg">{rec.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">{rec.date}</p>
              <p className="text-sm mb-4">{rec.duration}</p>
              <div className="flex gap-2">
                <Button size="sm"><Play className="mr-2 h-4 w-4" /> Watch</Button>
                <Button size="sm" variant="outline"><Download className="mr-2 h-4 w-4" /> Download</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
