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
import { LuMapPin, LuPlus, LuUsers, LuBuilding, LuTrash2, LuEdit } from 'react-icons/lu';
import { format } from "date-fns";

interface Campus {
  id: number;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zipCode: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Branch {
  id: number;
  campusId: number;
  name: string;
  address: string | null;
  city: string | null;
  isActive: boolean;
  createdAt: string;
}

async function fetchCampuses(): Promise<Campus[]> {
  const response = await fetch(buildApiUrl("/api/campuses"));
  if (!response.ok) throw new Error("Failed to fetch campuses");
  return response.json();
}

async function fetchBranches(campusId: number): Promise<Branch[]> {
  const response = await fetch(buildApiUrl(`/api/campuses/${campusId}/branches`));
  if (!response.ok) throw new Error("Failed to fetch branches");
  return response.json();
}

async function createCampus(data: Partial<Campus>): Promise<Campus> {
  const response = await fetch(buildApiUrl("/api/campuses"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create campus");
  return response.json();
}

async function updateCampus(id: number, updates: Partial<Campus>): Promise<Campus> {
  const response = await fetch(buildApiUrl(`/api/campuses/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error("Failed to update campus");
  return response.json();
}

async function deleteCampus(id: number): Promise<void> {
  const response = await fetch(buildApiUrl(`/api/campuses/${id}`), {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to delete campus");
}

export default function CampusesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState<number | null>(null);
  const [showBranchDialog, setShowBranchDialog] = useState(false);
  const [newCampus, setNewCampus] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    state: "",
    country: "USA",
  });
  const [newBranch, setNewBranch] = useState({
    name: "",
    address: "",
    city: "",
  });

  const { data: campuses, isLoading } = useQuery({
    queryKey: ["campuses"],
    queryFn: fetchCampuses,
  });

  const { data: branches } = useQuery({
    queryKey: ["branches", selectedCampus],
    queryFn: () => selectedCampus ? fetchBranches(selectedCampus) : Promise.resolve([]),
    enabled: !!selectedCampus,
  });

  const createMutation = useMutation({
    mutationFn: createCampus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campuses"] });
      setShowCreateDialog(false);
      setNewCampus({ name: "", description: "", address: "", city: "", state: "", country: "USA" });
      toast({ title: "Success", description: "Campus created successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create campus", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCampus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campuses"] });
      toast({ title: "Success", description: "Campus deleted" });
    },
  });

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
          <h1 className="text-3xl font-bold">Campuses & Branches</h1>
          <p className="text-muted-foreground">Manage multi-campus locations and branches</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showBranchDialog} onOpenChange={setShowBranchDialog}>
            <DialogTrigger asChild>
              <Button variant="outline"><Plus className="mr-2 h-4 w-4" /> Add Branch</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Branch</DialogTitle>
                <DialogDescription>Create a new branch under a campus</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="branch-name">Branch Name</Label>
                  <Input
                    id="branch-name"
                    value={newBranch.name}
                    onChange={e => setNewBranch({ ...newBranch, name: e.target.value })}
                    placeholder="e.g., North Campus Branch"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch-address">Address</Label>
                  <Textarea
                    id="branch-address"
                    value={newBranch.address}
                    onChange={e => setNewBranch({ ...newBranch, address: e.target.value })}
                    placeholder="Branch address"
                  />
                </div>
                <Button className="w-full">Create Branch</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Add Campus</Button></DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Campus</DialogTitle>
                <DialogDescription>Add a new campus location</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Campus Name</Label>
                  <Input
                    id="name"
                    value={newCampus.name}
                    onChange={e => setNewCampus({ ...newCampus, name: e.target.value })}
                    placeholder="e.g., North Campus"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newCampus.description}
                    onChange={e => setNewCampus({ ...newCampus, description: e.target.value })}
                    placeholder="Campus description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={newCampus.city}
                      onChange={e => setNewCampus({ ...newCampus, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={newCampus.state}
                      onChange={e => setNewCampus({ ...newCampus, state: e.target.value })}
                    />
                  </div>
                </div>
                <Button
                  onClick={() => createMutation.mutate(newCampus)}
                  disabled={createMutation.isPending || !newCampus.name}
                  className="w-full"
                >
                  {createMutation.isPending ? "Creating..." : "Create Campus"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading campuses...</div>
      ) : campuses?.length ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campuses.map(campus => (
            <Card
              key={campus.id}
              className={`hover:shadow-md transition-shadow ${selectedCampus === campus.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedCampus(campus.id === selectedCampus ? null : campus.id)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle>{campus.name}</CardTitle>
                      <CardDescription>{campus.city}, {campus.state}</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {campus.isActive ? (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(campus.id);
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {campus.description && (
                  <p className="text-sm text-muted-foreground mb-2">{campus.description}</p>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building className="h-3 w-3" />
                  <span>Created {format(new Date(campus.createdAt), "MMM d, yyyy")}</span>
                </div>
                {selectedCampus === campus.id && branches && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-semibold mb-2">Branches</h4>
                    {branches.length ? (
                      branches.map(branch => (
                        <div key={branch.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted">
                          <MapPin className="h-3 w-3" />
                          <span className="text-sm">{branch.name}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No branches yet</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No campuses configured yet</p>
            <Button onClick={() => setShowCreateDialog(true)}>Create Your First Campus</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
