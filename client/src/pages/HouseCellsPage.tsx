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
import { LuUsers, LuMapPin, LuCalendar, LuPlus, LuMessageSquare, LuUserPlus, LuChevronRight } from 'react-icons/lu';

interface HouseCell {
  id: number;
  name: string;
  description: string | null;
  location: string | null;
  leaderId: string | null;
  leaderName: string | null;
  meetingDay: string | null;
  meetingTime: string | null;
  memberCount: number;
  createdAt: string;
}

interface HouseCellMember {
  id: number;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
}

async function fetchHouseCells(): Promise<HouseCell[]> {
  const response = await fetch(buildApiUrl("/api/house-cells"));
  if (!response.ok) throw new Error("Failed to fetch house cells");
  return response.json();
}

async function fetchMyHouseCell(): Promise<HouseCell | null> {
  const response = await fetch(buildApiUrl("/api/house-cells/my"));
  if (!response.ok) return null;
  return response.json();
}

async function fetchHouseCellMembers(cellId: number): Promise<HouseCellMember[]> {
  const response = await fetch(buildApiUrl(`/api/house-cells/${cellId}/members`));
  if (!response.ok) throw new Error("Failed to fetch members");
  return response.json();
}

async function createHouseCell(data: Partial<HouseCell>) {
  const response = await fetch(buildApiUrl("/api/house-cells"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create house cell");
  return response.json();
}

async function joinHouseCell(cellId: number) {
  const response = await fetch(buildApiUrl(`/api/house-cells/${cellId}/members`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({}),
  });
  if (!response.ok) throw new Error("Failed to join house cell");
  return response.json();
}

async function leaveHouseCell(cellId: number) {
  const response = await fetch(buildApiUrl(`/api/house-cells/${cellId}/members`), {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to leave house cell");
  return response.json();
}

export default function HouseCellsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCell, setSelectedCell] = useState<HouseCell | null>(null);
  const [newCell, setNewCell] = useState({
    name: "",
    description: "",
    address: "",
    leaderName: "",
    leaderPhone: "",
    meetingDay: "",
    meetingTime: "",
  });

  const { data: houseCells, isLoading } = useQuery({
    queryKey: ["house-cells"],
    queryFn: fetchHouseCells,
  });

  const { data: myHouseCell } = useQuery({
    queryKey: ["my-house-cell"],
    queryFn: fetchMyHouseCell,
    enabled: !!user,
  });

  const { data: members } = useQuery({
    queryKey: ["house-cell-members", selectedCell?.id],
    queryFn: () => fetchHouseCellMembers(selectedCell!.id),
    enabled: !!selectedCell,
  });

  const createMutation = useMutation({
    mutationFn: createHouseCell,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["house-cells"] });
      setShowCreateDialog(false);
      setNewCell({ name: "", description: "", address: "", leaderName: "", leaderPhone: "", meetingDay: "", meetingTime: "" });
      toast({ title: "Success", description: "House cell created successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create house cell", variant: "destructive" });
    },
  });

  const joinMutation = useMutation({
    mutationFn: joinHouseCell,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-house-cell"] });
      queryClient.invalidateQueries({ queryKey: ["house-cells"] });
      toast({ title: "Success", description: "You've joined the house cell!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to join house cell", variant: "destructive" });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: leaveHouseCell,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-house-cell"] });
      queryClient.invalidateQueries({ queryKey: ["house-cells"] });
      toast({ title: "Success", description: "You've left the house cell" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to leave house cell", variant: "destructive" });
    },
  });

  const isAdmin = user?.isAdmin;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-card border rounded-card p-4 space-y-3">
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">House Cells</h1>
          <p className="text-gray-600 mt-1">Connect with your cell fellowship group</p>
        </div>
        
        {isAdmin && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Create House Cell
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create House Cell</DialogTitle>
                <DialogDescription>
                  Create a new house cell fellowship group
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Cell Name</Label>
                  <Input
                    id="name"
                    value={newCell.name}
                    onChange={e => setNewCell({ ...newCell, name: e.target.value })}
                    placeholder="e.g., Joshua Cell"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newCell.description}
                    onChange={e => setNewCell({ ...newCell, description: e.target.value })}
                    placeholder="Describe the cell group..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newCell.address}
                    onChange={e => setNewCell({ ...newCell, address: e.target.value })}
                    placeholder="e.g., 123 Church Street"
                  />
                </div>
                <div>
                  <Label htmlFor="leaderName">Leader Name</Label>
                  <Input
                    id="leaderName"
                    value={newCell.leaderName}
                    onChange={e => setNewCell({ ...newCell, leaderName: e.target.value })}
                    placeholder="e.g., John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="leaderPhone">Leader Contact</Label>
                  <Input
                    id="leaderPhone"
                    value={newCell.leaderPhone}
                    onChange={e => setNewCell({ ...newCell, leaderPhone: e.target.value })}
                    placeholder="e.g., +2348000000000"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="meetingDay">Meeting Day</Label>
                    <Input
                      id="meetingDay"
                      value={newCell.meetingDay}
                      onChange={e => setNewCell({ ...newCell, meetingDay: e.target.value })}
                      placeholder="e.g., Friday"
                    />
                  </div>
                  <div>
                    <Label htmlFor="meetingTime">Meeting Time</Label>
                    <Input
                      id="meetingTime"
                      value={newCell.meetingTime}
                      onChange={e => setNewCell({ ...newCell, meetingTime: e.target.value })}
                      placeholder="e.g., 7:00 PM"
                    />
                  </div>
                </div>
                <Button
                  onClick={() => createMutation.mutate(newCell)}
                  disabled={createMutation.isPending || !newCell.name}
                  className="w-full"
                >
                  {createMutation.isPending ? "Creating..." : "Create House Cell"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* My House Cell */}
      {myHouseCell && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-primary" />
            My House Cell
          </h2>
          <Card className="border-primary">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{myHouseCell.name}</CardTitle>
                  {myHouseCell.description && <CardDescription>{myHouseCell.description}</CardDescription>}
                </div>
                <Badge variant="default">Member</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 text-sm">
                {myHouseCell.location && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {myHouseCell.location}
                  </div>
                )}
                {myHouseCell.meetingDay && (
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {myHouseCell.meetingDay} at {myHouseCell.meetingTime}
                  </div>
                )}
                <div className="flex items-center text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  {myHouseCell.memberCount} members
                </div>
              </div>
              <Button
                variant="destructive"
                className="w-full mt-4"
                onClick={() => leaveMutation.mutate(myHouseCell.id)}
                disabled={leaveMutation.isPending}
              >
                {leaveMutation.isPending ? "Leaving..." : "Leave Cell"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* All House Cells */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          All House Cells
        </h2>
        
        {(!houseCells || houseCells.length === 0) ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500">No house cells available at the moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {houseCells.map(cell => {
              const isMyCell = myHouseCell?.id === cell.id;
              
              return (
                <Card key={cell.id} className={isMyCell ? "border-primary" : ""}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{cell.name}</CardTitle>
                      {isMyCell && <Badge variant="default">My Cell</Badge>}
                    </div>
                    {cell.description && <CardDescription>{cell.description}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm mb-4">
                      {cell.location && (
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          {cell.location}
                        </div>
                      )}
                      {cell.meetingDay && (
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          {cell.meetingDay} at {cell.meetingTime}
                        </div>
                      )}
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        {cell.memberCount} members
                      </div>
                    </div>
                    
                    {user ? (
                      isMyCell ? (
                        <Button disabled className="w-full bg-green-600">
                          <Users className="w-4 h-4 mr-2" />
                          You're a Member
                        </Button>
                      ) : myHouseCell ? (
                        <Button disabled className="w-full">
                          Already in a Cell
                        </Button>
                      ) : (
                        <Button
                          onClick={() => joinMutation.mutate(cell.id)}
                          disabled={joinMutation.isPending}
                          className="w-full"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          {joinMutation.isPending ? "Joining..." : "Join Cell"}
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
    </div>
  );
}
