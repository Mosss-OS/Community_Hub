import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LuHeart, LuMessageCircle, LuShare2, LuFilter, LuPlus, LuClock } from "react-icons/lu";
import { useState } from "react";

const prayerRequests = [
  { id: 1, title: "Healing for my mother", content: "Please pray for my mom's surgery...", author: "Anonymous", date: "2026-05-06", prayers: 24, category: "Health" },
  { id: 2, title: "Safe delivery", content: "My wife is due in 2 weeks...", author: "John D.", date: "2026-05-05", prayers: 18, category: "Family" },
  { id: 3, title: "Financial breakthrough", content: "Need prayer for job opportunity...", author: "Sarah M.", date: "2026-05-04", prayers: 12, category: "Provision" },
];

export default function PrayerWallPage() {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <LuHeart className="text-red-500" />
          Prayer Wall
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <LuFilter className="mr-1 h-3 w-3" />
            Filter
          </Button>
          <Button onClick={() => setShowForm(!showForm)}>
            <LuPlus className="mr-2 h-4 w-4" />
            Add Request
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Post Prayer Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input placeholder="Prayer request title" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Details</label>
              <Textarea placeholder="Describe what you'd like prayer for..." rows={4} />
            </div>
            <div className="flex gap-2">
              <Button>Submit Request</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {prayerRequests.map((req) => (
          <Card key={req.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{req.title}</CardTitle>
                  <CardDescription>{req.author} • {req.date}</CardDescription>
                </div>
                <Badge>{req.category}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">{req.content}</p>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm">
                  <LuHeart className="mr-1 h-3 w-3" />
                  Pray ({req.prayers})
                </Button>
                <Button variant="ghost" size="sm">
                  <LuMessageCircle className="mr-1 h-3 w-3" />
                  Comment
                </Button>
                <Button variant="ghost" size="sm">
                  <LuShare2 className="mr-1 h-3 w-3" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
