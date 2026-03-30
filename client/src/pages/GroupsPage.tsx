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
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, Lock, Globe, UserPlus, LogOut, Clock, Check, X, UserCheck } from "lucide-react";

interface Group {
  id: number;
  name: string;
  description: string | null;
  isPrivate: boolean;
  memberCount: number;
  creatorId: string;
  creatorName: string | null;
  isMember: boolean;
  requestStatus?: "PENDING" | "APPROVED" | "REJECTED" | null;
  createdAt: string;
}

interface GroupMember {
  id: number;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
}

interface JoinRequest {
  id: number;
  groupId: number;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  message: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

async function fetchGroups(): Promise<Group[]> {
  const response = await fetch(buildApiUrl("/api/groups"));
  if (!response.ok) throw new Error("Failed to fetch groups");
  return response.json();
}

async function fetchMyGroups(): Promise<Group[]> {
  const response = await fetch(buildApiUrl("/api/groups/my"));
  if (!response.ok) throw new Error("Failed to fetch my groups");
  return response.json();
}

async function fetchGroupMembers(groupId: number): Promise<GroupMember[]> {
  const response = await fetch(buildApiUrl(`/api/groups/${groupId}/members`));
  if (!response.ok) throw new Error("Failed to fetch members");
  return response.json();
}

async function fetchJoinRequests(groupId: number): Promise<JoinRequest[]> {
  const response = await fetch(buildApiUrl(`/api/groups/${groupId}/join-requests`), {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch join requests");
  return response.json();
}

async function createGroup(data: { name: string; description?: string; isPrivate: boolean }) {
  const response = await fetch(buildApiUrl("/api/groups"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create group");
  return response.json();
}

async function joinGroup(groupId: number) {
  const response = await fetch(buildApiUrl(`/api/groups/${groupId}/join`), {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to join group");
  return response.json();
}

async function requestJoinGroup(groupId: number, message?: string) {
  const response = await fetch(buildApiUrl(`/api/groups/${groupId}/join-request`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ message }),
  });
  if (!response.ok) throw new Error("Failed to request join group");
  return response.json();
}

async function reviewJoinRequest(requestId: number, status: "APPROVED" | "REJECTED") {
  const response = await fetch(buildApiUrl(`/api/groups/join-requests/${requestId}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error("Failed to review join request");
  return response.json();
}

async function leaveGroup(groupId: number) {
  const response = await fetch(buildApiUrl(`/api/groups/${groupId}/leave`), {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to leave group");
  return response.json();
}

export default function GroupsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestingGroupId, setRequestingGroupId] = useState<number | null>(null);
  const [showRequestsDialog, setShowRequestsDialog] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: "", description: "", isPrivate: false });

  const { data: groups, isLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: fetchGroups,
  });

  const { data: myGroups } = useQuery({
    queryKey: ["my-groups"],
    queryFn: fetchMyGroups,
    enabled: !!user,
  });

  const { data: members } = useQuery({
    queryKey: ["group-members", selectedGroup?.id],
    queryFn: () => fetchGroupMembers(selectedGroup!.id),
    enabled: !!selectedGroup,
  });

  const { data: joinRequests, refetch: refetchRequests } = useQuery({
    queryKey: ["group-join-requests", selectedGroup?.id],
    queryFn: () => fetchJoinRequests(selectedGroup!.id),
    enabled: !!selectedGroup && !!user,
  });

  const createMutation = useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["my-groups"] });
      setShowCreateDialog(false);
      setNewGroup({ name: "", description: "", isPrivate: false });
      toast({ title: "Success", description: "Group created successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create group", variant: "destructive" });
    },
  });

  const joinMutation = useMutation({
    mutationFn: joinGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["my-groups"] });
      toast({ title: "Success", description: "You've joined the group!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to join group", variant: "destructive" });
    },
  });

  const requestJoinMutation = useMutation({
    mutationFn: ({ groupId, message }: { groupId: number; message?: string }) => 
      requestJoinGroup(groupId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setShowRequestDialog(false);
      setRequestMessage("");
      setRequestingGroupId(null);
      toast({ title: "Success", description: "Request sent! Waiting for approval." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send request", variant: "destructive" });
    },
  });

  const reviewRequestMutation = useMutation({
    mutationFn: ({ requestId, status }: { requestId: number; status: "APPROVED" | "REJECTED" }) => 
      reviewJoinRequest(requestId, status),
    onSuccess: () => {
      refetchRequests();
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["my-groups"] });
      toast({ title: "Success", description: "Request reviewed!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to review request", variant: "destructive" });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: leaveGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["my-groups"] });
      toast({ title: "Success", description: "You've left the group" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to leave group", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-10">
        <Skeleton className="h-10 w-1/4 mb-5" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-52 bg-card border rounded-card p-4 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10 md:py-14">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Groups</h1>
          <p className="text-gray-600 mt-2 text-lg">Connect with community groups</p>
        </div>
        
        {user?.isAdmin && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Group</DialogTitle>
                <DialogDescription>
                  Create a new community group
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Group Name</Label>
                  <Input
                    id="name"
                    value={newGroup.name}
                    onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
                    placeholder="e.g., Youth Fellowship"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newGroup.description}
                    onChange={e => setNewGroup({ ...newGroup, description: e.target.value })}
                    placeholder="Describe your group..."
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={newGroup.isPrivate}
                    onChange={e => setNewGroup({ ...newGroup, isPrivate: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="isPrivate" className="font-normal">Private group (invite only)</Label>
                </div>
                <Button
                  onClick={() => createMutation.mutate(newGroup)}
                  disabled={createMutation.isPending || !newGroup.name}
                  className="w-full"
                >
                  {createMutation.isPending ? "Creating..." : "Create Group"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* My Groups */}
      {myGroups && myGroups.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-primary" />
            My Groups
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myGroups.map(group => (
              <Card key={group.id} className="border-primary">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {group.description || "No description"}
                      </CardDescription>
                    </div>
                    {group.isPrivate ? (
                      <Lock className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Globe className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{group.memberCount} members</span>
                    {group.isPrivate && members?.find(m => m.userId === user?.id && (m.role === "ADMIN" || m.role === "OWNER")) && (
                      <Badge variant="secondary" className="cursor-pointer hover:bg-gray-200" onClick={() => {
                        setSelectedGroup(group);
                        setShowRequestsDialog(true);
                      }}>
                        <Users className="w-3 h-3 mr-1" />
                        Requests
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => leaveMutation.mutate(group.id)}
                    disabled={leaveMutation.isPending}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Leave Group
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Groups */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Explore Groups
        </h2>
        
        {(!groups || groups.length === 0) ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No groups available yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groups.map(group => {
              const isMember = myGroups?.some(g => g.id === group.id);
              
              return (
                <Card key={group.id} className={isMember ? "border-primary" : ""}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {group.description || "No description"}
                        </CardDescription>
                      </div>
                      {group.isPrivate ? (
                        <Lock className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Globe className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{group.memberCount} members</span>
                      {group.creatorName && <span>by {group.creatorName}</span>}
                    </div>
                    
                    {user ? (
                      isMember ? (
                        <Button disabled className="w-full bg-green-600">
                          <Users className="w-4 h-4 mr-2" />
                          Member
                        </Button>
                      ) : group.requestStatus === "PENDING" ? (
                        <Button disabled variant="outline" className="w-full">
                          <Clock className="w-4 h-4 mr-2" />
                          Request Pending
                        </Button>
                      ) : group.isPrivate ? (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            setRequestingGroupId(group.id);
                            setShowRequestDialog(true);
                          }}
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          Request to Join
                        </Button>
                      ) : (
                        <Button
                          onClick={() => joinMutation.mutate(group.id)}
                          disabled={joinMutation.isPending}
                          className="w-full"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Join Group
                        </Button>
                      )
                    ) : (
                      <Button asChild className="w-full">
                        <a href="/login">Login to Join</a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Request to Join Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request to Join Group</DialogTitle>
            <DialogDescription>
              Send a request to join this private group. The group admin will review your request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="requestMessage">Message (optional)</Label>
              <Textarea
                id="requestMessage"
                value={requestMessage}
                onChange={e => setRequestMessage(e.target.value)}
                placeholder="Tell the group why you'd like to join..."
                rows={3}
              />
            </div>
            <Button
              onClick={() => requestingGroupId && requestJoinMutation.mutate({ groupId: requestingGroupId, message: requestMessage })}
              disabled={requestJoinMutation.isPending}
              className="w-full"
            >
              {requestJoinMutation.isPending ? "Sending..." : "Send Request"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Join Requests Dialog */}
      <Dialog open={showRequestsDialog} onOpenChange={setShowRequestsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Requests</DialogTitle>
            <DialogDescription>
              Review and manage requests to join {selectedGroup?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {!joinRequests || joinRequests.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No pending requests</p>
            ) : (
              joinRequests.map(request => (
                <div key={request.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{request.firstName} {request.lastName}</p>
                      <p className="text-sm text-gray-500">{request.email}</p>
                    </div>
                    <Badge 
                      className={
                        request.status === "APPROVED" ? "bg-green-500" :
                        request.status === "REJECTED" ? "bg-red-500" :
                        "bg-yellow-500"
                      }
                    >
                      {request.status}
                    </Badge>
                  </div>
                  {request.message && (
                    <p className="text-sm text-gray-600 mb-3 italic">"{request.message}"</p>
                  )}
                  {request.status === "PENDING" && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => reviewRequestMutation.mutate({ requestId: request.id, status: "APPROVED" })}
                        disabled={reviewRequestMutation.isPending}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        className="flex-1"
                        onClick={() => reviewRequestMutation.mutate({ requestId: request.id, status: "REJECTED" })}
                        disabled={reviewRequestMutation.isPending}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
