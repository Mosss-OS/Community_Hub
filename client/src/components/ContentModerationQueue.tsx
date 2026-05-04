import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, MessageSquare } from "lucide-react";

interface ModerationItem {
  id: string;
  type: "prayer" | "comment" | "post";
  content: string;
  author: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
}

export function ContentModerationQueue() {
  const [items] = useState<ModerationItem[]>([
    { id: "1", type: "prayer", content: "Please pray for my surgery...", author: "John D.", createdAt: "2026-05-04", status: "pending" },
    { id: "2", type: "comment", content: "Great sermon last week!", author: "Jane S.", createdAt: "2026-05-03", status: "pending" },
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" /> Content Moderation Queue</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{item.type}</Badge>
                <span className="text-sm text-muted-foreground">{item.author}</span>
              </div>
              <p className="text-sm mt-1">{item.content}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-green-600"><Check className="h-4 w-4" /></Button>
              <Button size="sm" variant="outline" className="text-red-600"><X className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
