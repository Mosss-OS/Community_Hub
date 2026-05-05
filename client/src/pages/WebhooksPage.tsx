import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { buildApiUrl } from "@/lib/api-config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Webhook, Plus, Trash2, CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface Webhook {
  id: number;
  name: string;
  url: string;
  events: string[];
  secret: string | null;
  isActive: boolean;
  lastCalledAt: string | null;
  lastStatus: number | null;
  createdAt: string;
  updatedAt: string;
}

interface WebhookDelivery {
  id: number;
  webhookId: number;
  event: string;
  payload: any;
  statusCode: number | null;
  response: string | null;
  duration: number | null;
  createdAt: string;
}

async function fetchWebhooks(): Promise<Webhook[]> {
  const response = await fetch(buildApiUrl("/api/webhooks"));
  if (!response.ok) throw new Error("Failed to fetch webhooks");
  return response.json();
}

async function createWebhook(data: Partial<Webhook>): Promise<Webhook> {
  const response = await fetch(buildApiUrl("/api/webhooks"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create webhook");
  return response.json();
}

async function updateWebhook(id: number, updates: Partial<Webhook>): Promise<Webhook> {
  const response = await fetch(buildApiUrl(`/api/webhooks/${id}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error("Failed to update webhook");
  return response.json();
}

async function deleteWebhook(id: number): Promise<void> {
  const response = await fetch(buildApiUrl(`/api/webhooks/${id}`), {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to delete webhook");
}

async function pingWebhook(id: number): Promise<any> {
  const response = await fetch(buildApiUrl(`/api/webhooks/${id}/ping`), {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to ping webhook");
  return response.json();
}

const availableEvents = [
  "user.created",
  "user.updated",
  "event.created",
  "event.updated",
  "donation.created",
  "prayer.requested",
  "task.assigned",
  "notification.created",
];

export default function WebhooksPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [newWebhook, setNewWebhook] = useState({
    name: "",
    url: "",
    events: [] as string[],
  });

  const { data: webhooks, isLoading } = useQuery({
    queryKey: ["webhooks"],
    queryFn: fetchWebhooks,
    enabled: user?.isAdmin,
  });

  const createMutation = useMutation({
    mutationFn: createWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      setShowCreateDialog(false);
      setNewWebhook({ name: "", url: "", events: [] });
      setSelectedEvents([]);
      toast({ title: "Success", description: "Webhook created successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create webhook", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Webhook> }) =>
      updateWebhook(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      toast({ title: "Success", description: "Webhook updated!" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      toast({ title: "Success", description: "Webhook deleted" });
    },
  });

  const pingMutation = useMutation({
    mutationFn: pingWebhook,
    onSuccess: () => {
      toast({ title: "Success", description: "Webhook pinged successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Webhook ping failed", variant: "destructive" });
    },
  });

  const toggleEvent = (event: string) => {
    const updated = selectedEvents.includes(event)
      ? selectedEvents.filter(e => e !== event)
      : [...selectedEvents, event];
    setSelectedEvents(updated);
    setNewWebhook({ ...newWebhook, events: updated });
  };

  if (!user?.isAdmin) {
    return (
      <div className="container mx-auto py-12 text-center">
        <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Webhooks</h1>
          <p className="text-muted-foreground">Manage webhook endpoints for external integrations</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Webhook</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Webhook</DialogTitle>
              <DialogDescription>Add a new webhook endpoint to receive events</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newWebhook.name}
                  onChange={e => setNewWebhook({ ...newWebhook, name: e.target.value })}
                  placeholder="e.g., Slack Notifications"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">Endpoint URL</Label>
                <Input
                  id="url"
                  value={newWebhook.url}
                  onChange={e => setNewWebhook({ ...newWebhook, url: e.target.value })}
                  placeholder="https://your-app.com/webhook"
                />
              </div>
              <div className="space-y-2">
                <Label>Events to Subscribe</Label>
                <div className="grid grid-cols-2 gap-2">
                  {availableEvents.map(event => (
                    <div
                      key={event}
                      className={`p-2 border rounded cursor-pointer text-sm transition-colors ${
                        selectedEvents.includes(event) ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                      }`}
                      onClick={() => toggleEvent(event)}
                    >
                      {event}
                    </div>
                  ))}
                </div>
              </div>
              <Button
                onClick={() => createMutation.mutate(newWebhook)}
                disabled={createMutation.isPending || !newWebhook.name || !newWebhook.url || selectedEvents.length === 0}
                className="w-full"
              >
                {createMutation.isPending ? "Creating..." : "Create Webhook"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading webhooks...</div>
      ) : webhooks?.length ? (
        <div className="space-y-4">
          {webhooks.map(webhook => (
            <Card key={webhook.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Webhook className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-lg">{webhook.name}</CardTitle>
                      <CardDescription>{webhook.url}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {webhook.isActive ? (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => pingMutation.mutate(webhook.id)}
                      disabled={pingMutation.isPending}
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(webhook.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {webhook.events?.map(event => (
                      <Badge key={event} variant="outline">{event}</Badge>
                    ))}
                  </div>
                  {webhook.lastCalledAt && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        {webhook.lastStatus && webhook.lastStatus < 400 ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        Last called {formatDistanceToNow(new Date(webhook.lastCalledAt), { addSuffix: true })}
                      </span>
                      {webhook.lastStatus && (
                        <Badge variant={webhook.lastStatus < 400 ? "default" : "destructive"}>
                          {webhook.lastStatus}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Webhook className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No webhooks configured yet</p>
            <Button onClick={() => setShowCreateDialog(true)}>Create Your First Webhook</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
