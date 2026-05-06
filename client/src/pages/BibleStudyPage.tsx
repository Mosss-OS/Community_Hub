import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LuBookOpen, LuUsers, LuMapPin, LuCalendar } from "react-icons/lu";
import { useState } from "react";

const studies = [
  { id: 1, title: "Gospel of John", leader: "Pastor John", members: 12, day: "Tuesday", time: "7:00 PM", location: "Room 101" },
  { id: 2, title: "Women's Bible Study", leader: "Sarah Johnson", members: 8, day: "Wednesday", time: "10:00 AM", location: "Fellowship Hall" },
  { id: 3, title: "Young Adults Group", leader: "Mike Chen", members: 15, day: "Thursday", time: "7:30 PM", location: "Youth Room" },
];

export default function BibleStudyPage() {
  const [joined, setJoined] = useState<number[]>([]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <BookOpen className="text-primary" />
        Bible Study Groups
      </h1>
      <p className="text-muted-foreground">Join a Bible study group to grow in faith together</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {studies.map((study) => (
          <Card key={study.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{study.title}</CardTitle>
                <Badge>{study.members} members</Badge>
              </div>
              <CardDescription>Leader: {study.leader}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {study.day}s at {study.time}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {study.location}
                </p>
                <p className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {study.members} members
                </p>
              </div>
              <Button
                className="w-full"
                variant={joined.includes(study.id) ? "outline" : "default"}
                onClick={() => {
                  if (joined.includes(study.id)) {
                    setJoined(joined.filter(id => id !== study.id));
                  } else {
                    setJoined([...joined, study.id]);
                  }
                }}
              >
                {joined.includes(study.id) ? "Leave Group" : "Join Group"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
