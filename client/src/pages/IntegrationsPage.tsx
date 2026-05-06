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
import { LuPlug, LuPlus, LuTrash2, LuCheckCircle, LuXCircle, LuRefreshCw, LuSettings, LuLink } from 'react-icons/lu';
import { format, formatDistanceToNow } from "date-fns";

interface ExternalIntegration {
  id: number;
  name: string;
  type: string;
  provider: string;
  config: any;
  isActive: boolean;
  lastSyncAt: string | null;
  syncStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

interface IntegrationSyncJob {
  id: number;
  integrationId: number;
  status: string;
  startedAt: string;
  completedAt: string | null;
  recordsProcessed: number | null;
}

async function fetchIntegrations(): Promise<ExternalIntegration[]> {
  const response = await fetch(buildApiUrl("/api/integrations"));
  if (!response.ok) throw new Error("Failed to fetch integrations");
  return response.json();
}

async function createIntegration(data: Partial<ExternalIntegration>): Promise<ExternalIntegration> {
  const response = await fetch(buildApiUrl("/api/integrations"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create integration");
  return response.json();
}

async function updateIntegration(id: number, updates: Partial<ExternalIntegration>): Promise<ExternalIntegration> {
  const response = await fetch(buildApiUrl(`/api/integrations/${id}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error("Failed to update integration");
  return response.json();
}

async function deleteIntegration(id: number): Promise<void> {
  const response = await fetch(buildApiUrl(`/api/integrations/${id}`), {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to delete integration");
}

async function triggerSync(id: number): Promise<any> {
  const response = await fetch(buildApiUrl(`/api/integrations/${id}/sync`), {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to trigger sync");
  return response.json();
}

const integrationTypes = [
  { value: "PAYMENT_GATEWAY", label: "Payment Gateway", providers: ["Stripe", "PayPal", "Square"] },
  { value: "EMAIL_SERVICE", label: "Email Service", providers: ["SendGrid", "Mailgun", "AWS SES"] },
  { value: "SMS_SERVICE", label: "SMS Service", providers: ["Twilio", "MessageBird"] },
  { value: "STORAGE_SERVICE", label: "Storage Service", providers: ["AWS S3", "Google Cloud", "Azure"] },
  { value: "SSO_PROVIDER", label: "SSO Provider", providers: ["Auth0", "Okta", "Google"] },
  { value: "CRM", label: "CRM", providers: ["Salesforce", "HubSpot"] },
  { value: "VIDEO_PLATFORM", label: "Video Platform", providers: ["Vimeo", "Wistia", "YouTube"] },
];

export default function IntegrationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [newIntegration, setNewIntegration] = useState({
    name: "",
    type: "",
    provider: "",
    config: "{}",
  });

  const { data: integrations, isLoading } = useQuery({
    queryKey: ["integrations"],
    queryFn: fetchIntegrations,
    enabled: user?.isAdmin,
  });

  const createMutation = useMutation({
    mutationFn: createIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      setShowCreateDialog(false);
      setNewIntegration({ name: "", type: "", provider: "", config: "{}" });
      toast({ title: "Success", description: "Integration created successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create integration", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<ExternalIntegration> }) =>
      updateIntegration(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      toast({ title: "Success", description: "Integration updated!" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      toast({ title: "Success", description: "Integration deleted" });
    },
  });

  const syncMutation = useMutation({
    mutationFn: triggerSync,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      toast({ title: "Success", description: "Sync started!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to start sync", variant: "destructive" });
    },
  });

  const getTypeLabel = (type: string) => {
    return integrationTypes.find(t => t.value === type)?.label || type;
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
          <h1 className="text-3xl font-bold">External Integrations</h1>
          <p className="text-muted-foreground">Connect third-party services and APIs</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Integration</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Integration</DialogTitle>
              <DialogDescription>Connect a third-party service or API</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newIntegration.name}
                  onChange={e => setNewIntegration({ ...newIntegration, name: e.target.value })}
                  placeholder="e.g., Stripe Payments"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Integration Type</Label>
                <Select
                  value={newIntegration.type}
                  onValueChange={v => {
                    setNewIntegration({ ...newIntegration, type: v, provider: "" });
                    setSelectedType(v);
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {integrationTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Select
                  value={newIntegration.provider}
                  onValueChange={v => setNewIntegration({ ...newIntegration, provider: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                  <SelectContent>
                    {selectedType && integrationTypes.find(t => t.value === selectedType)?.providers.map(provider => (
                      <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="config">Configuration (JSON)</Label>
                <Textarea
                  id="config"
                  value={newIntegration.config}
                  onChange={e => setNewIntegration({ ...newIntegration, config: e.target.value })}
                  placeholder='{"apiKey": "your-key-here"}'
                  rows={4}
                />
              </div>
              <Button
                onClick={() => createMutation.mutate({
                  ...newIntegration,
                  config: JSON.parse(newIntegration.config),
                })}
                disabled={createMutation.isPending || !newIntegration.name || !newIntegration.type}
                className="w-full"
              >
                {createMutation.isPending ? "Creating..." : "Add Integration"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading integrations...</div>
      ) : integrations?.length ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {integrations.map(integration => (
            <Card key={integration.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Plug className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <CardDescription>{getTypeLabel(integration.type)} • {integration.provider}</CardDescription>
                    </div>
                  </div>
                  {integration.isActive ? (
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {integration.lastSyncAt && (
                    <p className="text-sm text-muted-foreground">
                      Last sync {formatDistanceToNow(new Date(integration.lastSyncAt), { addSuffix: true })}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => syncMutation.mutate(integration.id)}
                      disabled={syncMutation.isPending}
                    >
                      <RefreshCw className="mr-2 h-3 w-3" /> Sync Now
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateMutation.mutate({
                        id: integration.id,
                        updates: { isActive: !integration.isActive }
                      })}
                    >
                      {integration.isActive ? "Disable" : "Enable"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(integration.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Plug className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No integrations configured yet</p>
            <Button onClick={() => setShowCreateDialog(true)}>Add Your First Integration</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
