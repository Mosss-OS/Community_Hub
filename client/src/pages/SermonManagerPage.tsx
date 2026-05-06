import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { buildApiUrl } from "@/lib/api-config";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { LuPlus, LuPlay, LuEdit, LuTrash2, LuCheck, LuX } from "react-icons/lu";

interface Sermon {
  id: number;
  title: string;
  speaker: string;
  date: string;
  isUpcoming: boolean;
  series?: string;
}

export default function SermonManagerPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Sermon | null>(null);
  const [formData, setFormData] = useState({ title: "", speaker: "", date: "", series: "" });

  const isAdmin = user?.isAdmin || user?.isSuperAdmin;

  const { data: sermons, isLoading } = useQuery({
    queryKey: ["admin-sermons"],
    queryFn: async () => {
      const res = await fetch(buildApiUrl("/api/sermons"), { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<Sermon>) => {
      const url = editing ? `/api/sermons/${editing.id}` : "/api/sermons";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(buildApiUrl(url), {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: `Sermon ${editing ? "updated" : "created"}!` });
      queryClient.invalidateQueries({ queryKey: ["admin-sermons"] });
      setShowDialog(false);
      setEditing(null);
    },
  });

  if (!isAdmin) return <div className="container mx-auto py-12 text-center">Admin access required</div>;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Play className="text-primary" />
          Manage Sermons
        </h1>
        <Button onClick={() => {
          setEditing(null);
          setFormData({ title: "", speaker: "", date: "", series: "" });
          setShowDialog(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> Add Sermon
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="space-y-3">
          {sermons?.map((sermon: Sermon) => (
            <Card key={sermon.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {sermon.isUpcoming && <Badge variant="outline">Upcoming</Badge>}
                      {sermon.title}
                    </CardTitle>
                    <CardDescription>
                      {sermon.speaker} • {new Date(sermon.date).toLocaleDateString()}
                      {sermon.series && ` • ${sermon.series}`}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => {
                      setEditing(sermon);
                      setFormData({
                        title: sermon.title,
                        speaker: sermon.speaker,
                        date: sermon.date,
                        series: sermon.series || "",
                      });
                      setShowDialog(true);
                    }}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {showDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <CardTitle>{editing ? "Edit" : "Add"} Sermon</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="speaker">Speaker</Label>
                <Input
                  id="speaker"
                  value={formData.speaker}
                  onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="series">Series (Optional)</Label>
                <Input
                  id="series"
                  value={formData.series}
                  onChange={(e) => setFormData({ ...formData, series: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => saveMutation.mutate(formData)}
                  disabled={saveMutation.isPending || !formData.title}
                >
                  {saveMutation.isPending ? "Saving..." : "Save"}
                </Button>
                <Button variant="outline" onClick={() => {
                  setShowDialog(false);
                  setEditing(null);
                }}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
