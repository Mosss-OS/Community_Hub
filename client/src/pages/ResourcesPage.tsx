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
import { useToast } from "@/hooks/use-toast";
import {
  LuFileText as FileText,
  LuVideo as Video,
  LuMusic as Music,
  LuImage as Image,
  LuLink as Link,
  LuDownload as Download,
  LuStar as Star,
  LuPlus as Plus,
  LuSearch as Search,
} from "react-icons/lu";
import { format } from "date-fns";

type ResourceCategory = 'DOCUMENT' | 'VIDEO' | 'AUDIO' | 'IMAGE' | 'LINK' | 'OTHER';

interface Resource {
  id: number;
  title: string;
  description: string | null;
  category: ResourceCategory;
  fileUrl: string | null;
  externalUrl: string | null;
  thumbnailUrl: string | null;
  fileSize: number | null;
  mimeType: string | null;
  isPublic: boolean;
  downloadCount: number;
  createdBy: string | null;
  createdAt: string;
  organizationId: string | null;
}

async function fetchResources(organizationId?: string): Promise<Resource[]> {
  const url = organizationId ? `${buildApiUrl("/api/resources")}?organizationId=${organizationId}` : buildApiUrl("/api/resources");
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch resources");
  return response.json();
}

async function fetchFavoriteResources(): Promise<any[]> {
  const response = await fetch(buildApiUrl("/api/resources/favorites/me"));
  if (!response.ok) throw new Error("Failed to fetch favorites");
  return response.json();
}

async function createResource(data: Partial<Resource>): Promise<Resource> {
  const response = await fetch(buildApiUrl("/api/resources"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create resource");
  return response.json();
}

async function downloadResource(id: number): Promise<any> {
  const response = await fetch(buildApiUrl(`/api/resources/${id}/download`), {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to download resource");
  return response.json();
}

async function favoriteResource(id: number): Promise<any> {
  const response = await fetch(buildApiUrl(`/api/resources/${id}/favorite`), {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to favorite resource");
  return response.json();
}

const categoryIcons: Record<ResourceCategory, any> = {
  DOCUMENT: FileText,
  VIDEO: Video,
  AUDIO: Music,
  IMAGE: Image,
  LINK: Link,
  OTHER: FileText,
};

export default function ResourcesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    category: "DOCUMENT" as ResourceCategory,
    fileUrl: "",
    externalUrl: "",
    isPublic: false,
  });

  const { data: resources, isLoading } = useQuery({
    queryKey: ["resources"],
    queryFn: () => fetchResources(user?.organizationId),
  });

  const { data: favorites } = useQuery({
    queryKey: ["resource-favorites"],
    queryFn: fetchFavoriteResources,
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: createResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      setShowCreateDialog(false);
      setNewResource({ title: "", description: "", category: "DOCUMENT", fileUrl: "", externalUrl: "", isPublic: false });
      toast({ title: "Success", description: "Resource created successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create resource", variant: "destructive" });
    },
  });

  const downloadMutation = useMutation({
    mutationFn: downloadResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      toast({ title: "Success", description: "Download started!" });
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: favoriteResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resource-favorites"] });
      toast({ title: "Success", description: "Resource favorited!" });
    },
  });

  const filteredResources = resources?.filter(r => {
    const matchesSearch = !searchQuery || r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || r.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const favoriteIds = new Set(favorites?.map(f => f.resourceId) || []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Resources & Content Library</h1>
          <p className="text-muted-foreground">Access and manage church resources</p>
        </div>
        {user?.isAdmin && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Add Resource</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Create New Resource</DialogTitle>
                <DialogDescription>Add a new resource to the library</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={newResource.title} onChange={e => setNewResource({ ...newResource, title: e.target.value })} placeholder="Resource title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={newResource.description} onChange={e => setNewResource({ ...newResource, description: e.target.value })} placeholder="Resource description" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={newResource.category} onValueChange={v => setNewResource({ ...newResource, category: v as ResourceCategory })}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DOCUMENT">Document</SelectItem>
                      <SelectItem value="VIDEO">Video</SelectItem>
                      <SelectItem value="AUDIO">Audio</SelectItem>
                      <SelectItem value="IMAGE">Image</SelectItem>
                      <SelectItem value="LINK">Link</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fileUrl">File URL (optional)</Label>
                  <Input id="fileUrl" value={newResource.fileUrl} onChange={e => setNewResource({ ...newResource, fileUrl: e.target.value })} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="externalUrl">External URL (optional)</Label>
                  <Input id="externalUrl" value={newResource.externalUrl} onChange={e => setNewResource({ ...newResource, externalUrl: e.target.value })} placeholder="https://..." />
                </div>
                <Button onClick={() => createMutation.mutate(newResource)} disabled={createMutation.isPending || !newResource.title} className="w-full">
                  {createMutation.isPending ? "Creating..." : "Create Resource"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search resources..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="DOCUMENT">Documents</SelectItem>
            <SelectItem value="VIDEO">Videos</SelectItem>
            <SelectItem value="AUDIO">Audio</SelectItem>
            <SelectItem value="IMAGE">Images</SelectItem>
            <SelectItem value="LINK">Links</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading resources...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredResources?.map(resource => {
            const Icon = categoryIcons[resource.category] || FileText;
            return (
              <Card key={resource.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <Badge variant="secondary">{resource.category}</Badge>
                    </div>
                    {favoriteIds.has(resource.id) && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                  </div>
                  <CardTitle className="text-lg">{resource.title}</CardTitle>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1"><Download className="h-3 w-3" /> {resource.downloadCount} downloads</span>
                    <span>{format(new Date(resource.createdAt), "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => downloadMutation.mutate(resource.id)} disabled={downloadMutation.isPending}>
                      <Download className="mr-2 h-3 w-3" /> Download
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => favoriteMutation.mutate(resource.id)}>
                      <Star className="mr-2 h-3 w-3" /> Favorite
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
