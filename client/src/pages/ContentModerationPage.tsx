import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LuShield, LuCheck, LuX, LuMessageSquare } from "react-icons/lu";
import { useState } from "react";

const flaggedContent = [
  { id: 1, type: "comment", content: "Inappropriate comment on sermon...", status: "pending", user: "User123", date: "2026-05-05" },
  { id: 2, type: "prayer", content: "Prayer request with flagged words...", status: "pending", user: "Anonymous", date: "2026-05-04" },
  { id: 3, type: "comment", content: "Spam comment on event page...", status: "approved", user: "SpamBot", date: "2026-05-03" },
];

export default function ContentModerationPage() {
  const [filter, setFilter] = useState("pending");

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Shield className="text-primary" />
        Content Moderation
      </h1>

      <div className="flex gap-2">
        <Button variant={filter === "pending" ? "default" : "outline"} onClick={() => setFilter("pending")}>Pending</Button>
        <Button variant={filter === "approved" ? "default" : "outline"} onClick={() => setFilter("approved")}>Approved</Button>
        <Button variant={filter === "rejected" ? "default" : "outline"} onClick={() => setFilter("rejected")}>Rejected</Button>
      </div>

      <div className="space-y-3">
        {flaggedContent.filter(c => filter === "all" || c.status === filter).map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    {item.type}
                  </CardTitle>
                  <CardDescription>
                    {item.user} • {item.date}
                  </CardDescription>
                </div>
                <Badge variant={item.status === "approved" ? "default" : item.status === "rejected" ? "destructive" : "secondary"}>
                  {item.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-3">{item.content}</p>
              {item.status === "pending" && (
                <div className="flex gap-2">
                  <Button size="sm"><Check className="mr-1 h-3 w-3" /> Approve</Button>
                  <Button size="sm" variant="destructive"><X className="mr-1 h-3 w-3" /> Reject</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
