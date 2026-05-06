import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { buildApiUrl } from "@/lib/api-config";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { LuPlus, LuEdit, LuTrash2, LuCalendar, LuMapPin, LuEye, LuEyeOff } from "react-icons/lu";

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  category?: string;
  isUpcoming: boolean;
  imageUrl?: string;
}

export default function EventManagerPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    category: "",
    isUpcoming: false,
  });

  const isAdmin = user?.isAdmin || user?.isSuperAdmin;

  const { data: events, isLoading } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const res = await fetch(buildApiUrl("/api/events"), { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<Event>) => {
      const url = editing ? `/api/events/${editing.id}` : "/api/events";
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
      toast({ title: "Success", description: `Event ${editing ? "updated" : "created"}!` });
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      setShowDialog(false);
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(buildApiUrl(`/api/events/${id}`), {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Event deleted!" });
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    },
  });

  if (!isAdmin) return <div className="container mx-auto py-12 text-center">Admin access required</div>;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Calendar className="text-primary" />
          Manage Events
        </h1>
        <Button onClick={() => {
          setEditing(null);
          setFormData({ title: "", description: "", date: "", location: "", category: "", isUpcoming: false });
          setShowDialog(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> Add Event
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="space-y-3">
          {events?.map((event: Event) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {event.title}
                      {event.isUpcoming && <Badge variant="outline">Upcoming</Badge>}
                    </CardTitle>
                    <CardDescription>
                      {event.category && <span className="mr-2">{event.category}</span>}
                      {new Date(event.date).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => {
                      setEditing(event);
                      setFormData({
                        title: event.title,
                        description: event.description,
                        date: event.date,
                        location: event.location,
                        category: event.category || "",
                        isUpcoming: event.isUpcoming,
                      });
                      setShowDialog(true);
                    }}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive">
                      <Trash2
                        className="h-3 w-3"
                        onClick={() => {
                          if (confirm("Delete this event?")) deleteMutation.mutate(event.id);
                        }}
                      />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {event.location}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{editing ? "Edit" : "Add"} Event</CardTitle>
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
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
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
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Worship">Worship</SelectItem>
                    <SelectItem value="Youth">Youth</SelectItem>
                    <SelectItem value="Children">Children</SelectItem>
                    <SelectItem value="Prayer">Prayer</SelectItem>
                    <SelectItem value="Fellowship">Fellowship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="upcoming"
                  checked={formData.isUpcoming}
                  onChange={(e) => setFormData({ ...formData, isUpcoming: e.target.checked })}
                />
                <Label htmlFor="upcoming">Mark as upcoming</Label>
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
