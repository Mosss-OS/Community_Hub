import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, Cake, Star } from "lucide-react";

interface Milestone {
  id: string;
  type: "baptism" | "membership" | "volunteer" | "bible_reading";
  title: string;
  date: string;
  description: string;
}

export function MemberMilestones() {
  const milestones: Milestone[] = [
    { id: "1", type: "baptism", title: "Baptism", date: "2025-12-15", description: "Got baptized at Community Hub" },
    { id: "2", type: "membership", title: "Membership", date: "2025-06-01", description: "Became a正式 member" },
    { id: "3", type: "volunteer", title: "100 Hours Volunteered", date: "2026-03-10", description: "Reached 100 volunteer hours" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-yellow-600" /> Member Milestones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {milestones.map(m => (
          <div key={m.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              {m.type === "baptism" && <Gift className="h-5 w-5 text-blue-600" />}
              {m.type === "membership" && <Star className="h-5 w-5 text-yellow-600" />}
              {m.type === "volunteer" && <Star className="h-5 w-5 text-green-600" />}
              {m.type === "bible_reading" && <Gift className="h-5 w-5 text-purple-600" />}
            </div>
            <div className="flex-1">
              <p className="font-medium">{m.title}</p>
              <p className="text-sm text-muted-foreground">{m.description}</p>
              <p className="text-xs text-muted-foreground">{m.date}</p>
            </div>
            <Badge variant="secondary">Achieved</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
