import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { buildApiUrl } from "@/lib/api-config";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { LuPlus, LuHeart, LuLock, LuGlobe, LuCheck, LuMessageSquare } from "react-icons/lu";

interface PrayerRequest {
  id: number;
  content: string;
  isAnonymous: boolean;
  isAnswered: boolean;
  prayCount: number;
  createdAt: string;
}

export default function PrayerRequestsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const { data: requests, isLoading } = useQuery({
    queryKey: ["my-prayer-requests"],
    queryFn: async () => {
      const res = await fetch(buildApiUrl("/api/prayer-requests/my"), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { content: string; isAnonymous: boolean }) => {
      const res = await fetch(buildApiUrl("/api/prayer-requests"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Prayer request submitted!" });
      setShowDialog(false);
      setContent("");
    },
  });

  if (!user) return <div className="container mx-auto py-12 text-center">Please log in</div>;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Heart className="text-pink-500" />
          My Prayer Requests
        </h1>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Request
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="space-y-4">
          {requests?.map((req: PrayerRequest) => (
            <Card key={req.id} className={req.isAnswered ? "border-green-200 bg-green-50" : ""}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {req.content.substring(0, 50)}...
                    </CardTitle>
                    <CardDescription>
                      {req.isAnonymous ? "Anonymous" : "Public"} • {new Date(req.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  {req.isAnswered && (
                    <Badge className="bg-green-100 text-green-800">
                      <Check className="mr-1 h-3 w-3" /> Answered
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{req.content}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {req.prayCount} prayers
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <CardTitle>New Prayer Request</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">Your Request</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your prayer request..."
                  rows={4}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                <Label htmlFor="anonymous">Submit anonymously</Label>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => createMutation.mutate({ content, isAnonymous })} disabled={!content}>
                  {createMutation.isPending ? "Submitting..." : "Submit Request"}
                </Button>
                <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
