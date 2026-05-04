import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, Users, MessageSquare } from "lucide-react";

export function VirtualSmallGroupRooms() {
  const rooms = [
    { id: "1", name: "Sunday School", participants: 12, type: "study" },
    { id: "2", name: "Prayer Meeting", participants: 8, type: "prayer" },
    { id: "3", name: "Youth Group", participants: 15, type: "youth" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Monitor className="h-5 w-5 text-primary" /> Virtual Small Group Rooms</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rooms.map(r => (
          <div key={r.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="font-medium">{r.name}</p>
              <p className="text-sm text-muted-foreground">{r.participants} participants</p>
            </div>
            <Button size="sm">Join Room</Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
