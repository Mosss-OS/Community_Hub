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
import { LuFileText, LuPlus, LuTrash2, LuGlobe, LuLock, LuEye } from 'react-icons/lu';
import { format } from "date-fns";

interface CustomPage {
  id: number;
  title: string;
  slug: string;
  content: string;
  isPublic: boolean;
  showInMenu: boolean;
  layout: string;
  createdAt: string;
  updatedAt: string;
}

async function fetchCustomPages(): Promise<CustomPage[]> {
  const response = await fetch(buildApiUrl("/api/custom-pages"));
  if (!response.ok) throw new Error("Failed to fetch pages");
  return response.json();
}

async function createPage(data: Partial<CustomPage>): Promise<CustomPage> {
  const response = await fetch(buildApiUrl("/api/custom-pages"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create page");
  return response.json();
}

async function updatePage(id: number, updates: Partial<CustomPage>): Promise<CustomPage> {
  const response = await fetch(buildApiUrl(`/api/custom-pages/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error("Failed to update page");
  return response.json();
}

async function deletePage(id: number): Promise<void> {
  const response = await fetch(buildApiUrl(`/api/custom-pages/${id}`), {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to delete page");
}

export default function CustomPagesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPreview, setShowPreview] = useState<CustomPage | null>(null);
  const [newPage, setNewPage] = useState({
    title: "",
    slug: "",
    content: "",
    isPublic: true,
    showInMenu: false,
    layout: "default",
  });

  const { data: pages, isLoading } = useQuery({
    queryKey: ["custom-pages"],
    queryFn: fetchCustomPages,
    enabled: user?.isAdmin,
  });

  const createMutation = useMutation({
    mutationFn: createPage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-pages"] });
      setShowCreateDialog(false);
      setNewPage({ title: "", slug: "", content: "", isPublic: true, showInMenu: false, layout: "default" });
      toast({ title: "Success", description: "Page created successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create page", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-pages"] });
      toast({ title: "Success", description: "Page deleted" });
    },
  });

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
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
          <h1 className="text-3xl font-bold">Custom Pages</h1>
          <p className="text-muted-foreground">Create and manage custom pages for your site</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Create Page</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Create Custom Page</DialogTitle>
              <DialogDescription>Add a new custom page to your site</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newPage.title}
                  onChange={e => {
                    const title = e.target.value;
                    setNewPage({
                      ...newPage,
                      title,
                      slug: generateSlug(title),
                    });
                  }}
                  placeholder="e.g., About Our Mission"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">/page/</span>
                  <Input
                    id="slug"
                    value={newPage.slug}
                    onChange={e => setNewPage({ ...newPage, slug: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content (HTML)</Label>
                <Textarea
                  id="content"
                  value={newPage.content}
                  onChange={e => setNewPage({ ...newPage, content: e.target.value })}
                  placeholder="<h1>Welcome</h1><p>Your content here...</p>"
                  rows={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="layout">Layout</Label>
                <Select value={newPage.layout} onValueChange={v => setNewPage({ ...newPage, layout: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="full-width">Full Width</SelectItem>
                    <SelectItem value="sidebar">With Sidebar</SelectItem>
                    <SelectItem value="landing">Landing Page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newPage.isPublic}
                    onChange={e => setNewPage({ ...newPage, isPublic: e.target.checked })}
                  />
                  <span className="text-sm">Public page</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newPage.showInMenu}
                    onChange={e => setNewPage({ ...newPage, showInMenu: e.target.checked })}
                  />
                  <span className="text-sm">Show in menu</span>
                </label>
              </div>
              <Button
                onClick={() => createMutation.mutate(newPage)}
                disabled={createMutation.isPending || !newPage.title || !newPage.slug}
                className="w-full"
              >
                {createMutation.isPending ? "Creating..." : "Create Page"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading pages...</div>
      ) : pages?.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pages.map(page => (
            <Card key={page.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{page.title}</CardTitle>
                    <CardDescription>/page/{page.slug}</CardDescription>
                  </div>
                  <div className="flex gap-1">
                    {page.isPublic ? (
                      <Badge className="bg-green-100 text-green-800"><Globe className="h-3 w-3 mr-1" /> Public</Badge>
                    ) : (
                      <Badge variant="secondary"><Lock className="h-3 w-3 mr-1" /> Private</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {page.showInMenu && <Badge variant="outline">In Menu</Badge>}
                    <Badge variant="outline">{page.layout}</Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowPreview(page)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(page.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Updated {format(new Date(page.updatedAt), "MMM d, yyyy")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No custom pages yet</p>
            <Button onClick={() => setShowCreateDialog(true)}>Create Your First Page</Button>
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!showPreview} onOpenChange={() => setShowPreview(null)}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{showPreview?.title}</DialogTitle>
            <DialogDescription>Page Preview</DialogDescription>
          </DialogHeader>
          {showPreview && (
            <div className="py-4">
              <div className="border rounded p-6 bg-muted/50">
                <h1 className="text-2xl font-bold mb-4">{showPreview.title}</h1>
                <div dangerouslySetInnerHTML={{ __html: showPreview.content || "<p>No content</p>" }} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
