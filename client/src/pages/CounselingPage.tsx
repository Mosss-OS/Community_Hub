import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { buildApiUrl } from "@/lib/api-config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, User, MessageSquare, Plus } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

type RequestStatus = 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';

interface CounselingRequest {
  id: number;
  requesterId: string;
  assignedTo: string | null;
  type: string;
  description: string;
  status: RequestStatus;
  priority: string;
  scheduledAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CounselingNote {
  id: number;
  requestId: number;
  authorId: string;
  content: string;
  isPrivate: boolean;
  createdAt: string;
}

interface CounselingFollowup {
  id: number;
  requestId: number;
  scheduledFor: string;
  note: string | null;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
}

interface PastoralVisit {
  id: number;
  requestId: number | null;
  visitorId: string;
  visitorName: string | null;
  visitDate: string;
  purpose: string | null;
  notes: string | null;
  createdAt: string;
}

async function fetchRequests(): Promise<CounselingRequest[]> {
  const response = await fetch(buildApiUrl("/api/counseling/requests"));
  if (!response.ok) throw new Error("Failed to fetch requests");
  return response.json();
}

async function fetchNotes(requestId: number): Promise<CounselingNote[]> {
  const response = await fetch(buildApiUrl(`/api/counseling/requests/${requestId}/notes`));
  if (!response.ok) throw new Error("Failed to fetch notes");
  return response.json();
}

async function fetchFollowups(): Promise<CounselingFollowup[]> {
  const response = await fetch(buildApiUrl("/api/counseling/followups"));
  if (!response.ok) throw new Error("Failed to fetch followups");
  return response.json();
}

async function fetchVisits(): Promise<PastoralVisit[]> {
  const response = await fetch(buildApiUrl("/api/counseling/visits"));
  if (!response.ok) throw new Error("Failed to fetch visits");
  return response.json();
}

async function createRequest(data: Partial<CounselingRequest>): Promise<CounselingRequest> {
  const response = await fetch(buildApiUrl("/api/counseling/requests"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create request");
  return response.json();
}

async function updateRequest(id: number, updates: Partial<CounselingRequest>): Promise<CounselingRequest> {
  const response = await fetch(buildApiUrl(`/api/counseling/requests/${id}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error("Failed to update request");
  return response.json();
}

const statusColors: Record<RequestStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  ASSIGNED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELED: "bg-red-100 text-red-800",
};

const statusIcons: Record<RequestStatus, any> = {
  PENDING: Clock,
  ASSIGNED: User,
  IN_PROGRESS: AlertCircle,
  COMPLETED: CheckCircle,
  CANCELED: XCircle,
};

export default function CounselingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("requests");
  const [newRequest, setNewRequest] = useState({
    type: "GENERAL",
    description: "",
    priority: "MEDIUM",
  });
  const [newNote, setNewNote] = useState({ content: "", isPrivate: false });

  const { data: requests, isLoading } = useQuery({
    queryKey: ["counseling-requests"],
    queryFn: fetchRequests,
  });

  const { data: followups } = useQuery({
    queryKey: ["counseling-followups"],
    queryFn: fetchFollowups,
    enabled: user?.isPastor,
  });

  const { data: visits } = useQuery({
    queryKey: ["pastoral-visits"],
    queryFn: fetchVisits,
    enabled: user?.isPastor,
  });

  const createMutation = useMutation({
    mutationFn: createRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counseling-requests"] });
      setShowRequestDialog(false);
      setNewRequest({ type: "GENERAL", description: "", priority: "MEDIUM" });
      toast({ title: "Success", description: "Counseling request created!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create request", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<CounselingRequest> }) =>
      updateRequest(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counseling-requests"] });
      toast({ title: "Success", description: "Request updated!" });
    },
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Counseling & Pastoral Care</h1>
          <p className="text-muted-foreground">Manage counseling requests and pastoral visits</p>
        </div>
        <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> New Request</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Counseling Request</DialogTitle>
              <DialogDescription>Submit a new counseling request</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={newRequest.type} onValueChange={v => setNewRequest({ ...newRequest, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GENERAL">General</SelectItem>
                    <SelectItem value="MARRIAGE">Marriage</SelectItem>
                    <SelectItem value="GRIEF">Grief</SelectItem>
                    <SelectItem value="ADDICTION">Addiction</SelectItem>
                    <SelectItem value="SPIRITUAL">Spiritual</SelectItem>
                    <SelectItem value="FINANCIAL">Financial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={newRequest.priority} onValueChange={v => setNewRequest({ ...newRequest, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newRequest.description}
                  onChange={e => setNewRequest({ ...newRequest, description: e.target.value })}
                  placeholder="Describe your counseling needs..."
                />
              </div>
              <Button
                onClick={() => createMutation.mutate(newRequest)}
                disabled={createMutation.isPending || !newRequest.description}
                className="w-full"
              >
                {createMutation.isPending ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          {user?.isPastor && <TabsTrigger value="followups">Follow-ups</TabsTrigger>}
          {user?.isPastor && <TabsTrigger value="visits">Pastoral Visits</TabsTrigger>}
        </TabsList>

        <TabsContent value="requests" className="space-y-4 mt-4">
          {isLoading ? (
            <div className="text-center py-12">Loading requests...</div>
          ) : requests?.length ? (
            requests.map(request => {
              const StatusIcon = statusIcons[request.status];
              return (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <StatusIcon className="h-4 w-4" />
                          <Badge className={statusColors[request.status]}>{request.status}</Badge>
                          <Badge variant="outline">{request.type}</Badge>
                          <Badge variant="secondary">{request.priority}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{request.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      {user?.isPastor && request.status !== "COMPLETED" && (
                        <div className="flex gap-1">
                          {request.status === "PENDING" && (
                            <Button size="sm" variant="ghost" onClick={() => updateMutation.mutate({ id: request.id, updates: { status: "ASSIGNED", assignedTo: user.id } })}>
                              Assign to me
                            </Button>
                          )}
                          {request.status === "ASSIGNED" && (
                            <Button size="sm" variant="ghost" onClick={() => updateMutation.mutate({ id: request.id, updates: { status: "IN_PROGRESS" } })}>
                              Start
                            </Button>
                          )}
                          {request.status === "IN_PROGRESS" && (
                            <Button size="sm" variant="ghost" onClick={() => updateMutation.mutate({ id: request.id, updates: { status: "COMPLETED", completedAt: new Date().toISOString() } })}>
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No counseling requests yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {user?.isPastor && (
          <TabsContent value="followups" className="space-y-4 mt-4">
            {followups?.length ? (
              followups.map(followup => (
                <Card key={followup.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{followup.note || "Follow-up"}</p>
                        <p className="text-sm text-muted-foreground">
                          Scheduled for {format(new Date(followup.scheduledFor), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      {!followup.completed && (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">No follow-ups scheduled</p>
            )}
          </TabsContent>
        )}

        {user?.isPastor && (
          <TabsContent value="visits" className="space-y-4 mt-4">
            {visits?.length ? (
              visits.map(visit => (
                <Card key={visit.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{visit.purpose || "Pastoral Visit"}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(visit.visitDate), "MMM d, yyyy")} - {visit.visitorName}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">No visits recorded</p>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
