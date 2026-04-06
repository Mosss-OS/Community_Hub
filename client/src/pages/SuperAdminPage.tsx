import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { buildApiUrl } from "@/lib/api-config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit, Trash2, Eye, Building2, Users, Calendar, Loader2, Search, Palette, UserMinus, ShieldAlert, ArrowLeft, Mail as MailIcon, LogOut } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { User, Branding } from "@/types/api";

interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  isActive: boolean;
  churchName: string | null;
  churchEmail: string | null;
  createdAt: string;
}

async function fetchOrganizations(): Promise<Organization[]> {
  const res = await fetch(buildApiUrl("/api/super-admin/organizations"), { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch organizations");
  return res.json();
}

async function createOrganization(data: Partial<Organization>) {
  const res = await fetch(buildApiUrl("/api/super-admin/organizations"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create organization");
  return res.json();
}

async function updateOrganization(id: string, data: Partial<Organization>) {
  const res = await fetch(buildApiUrl(`/api/super-admin/organizations/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update organization");
  return res.json();
}

async function deleteOrganization(id: string) {
  const res = await fetch(buildApiUrl(`/api/super-admin/organizations/${id}`), {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete organization");
}

async function fetchOrgUsers(orgId: string): Promise<User[]> {
  const res = await fetch(buildApiUrl(`/api/super-admin/organizations/${orgId}/users`), { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

async function updateOrgUserRole(orgId: string, userId: string, role: string) {
  const res = await fetch(buildApiUrl(`/api/super-admin/organizations/${orgId}/users/${userId}/role`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error("Failed to update user role");
}

async function removeOrgUser(orgId: string, userId: string) {
  const res = await fetch(buildApiUrl(`/api/super-admin/organizations/${orgId}/users/${userId}`), {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to remove user");
}

async function fetchOrgBranding(orgId: string): Promise<Branding> {
  const res = await fetch(buildApiUrl(`/api/super-admin/organizations/${orgId}/branding`), { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch branding");
  return res.json();
}

async function updateOrgBranding(orgId: string, data: Partial<Branding>) {
  const res = await fetch(buildApiUrl(`/api/super-admin/organizations/${orgId}/branding`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update branding");
}

async function logoutUser() {
  const res = await fetch(buildApiUrl("/api/auth/logout"), { method: "POST", credentials: "include" });
  if (!res.ok) throw new Error("Logout failed");
  window.location.href = "/login";
}

export default function SuperAdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    logoUrl: "",
    churchName: "",
    churchEmail: "",
    churchPhone: "",
    churchAddress: "",
    churchCity: "",
    churchState: "",
    churchCountry: "",
    isActive: true,
  });

  const { data: organizations, isLoading } = useQuery({
    queryKey: ["organizations"],
    queryFn: fetchOrganizations,
    enabled: !!user?.isSuperAdmin,
  });

  const createMutation = useMutation({
    mutationFn: createOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      setShowCreateDialog(false);
      resetForm();
      toast({ title: "Organization created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create organization", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Organization> }) => updateOrganization(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      setEditingOrg(null);
      resetForm();
      toast({ title: "Organization updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update organization", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      toast({ title: "Organization deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete organization", variant: "destructive" });
    },
  });

  function resetForm() {
    setFormData({
      name: "",
      slug: "",
      description: "",
      logoUrl: "",
      churchName: "",
      churchEmail: "",
      churchPhone: "",
      churchAddress: "",
      churchCity: "",
      churchState: "",
      churchCountry: "",
      isActive: true,
    });
  }

  function openEditDialog(org: Organization) {
    setEditingOrg(org);
    setFormData({
      name: org.name,
      slug: org.slug,
      description: org.description || "",
      logoUrl: org.logoUrl || "",
      churchName: org.churchName || "",
      churchEmail: "",
      churchPhone: "",
      churchAddress: "",
      churchCity: "",
      churchState: "",
      churchCountry: "",
      isActive: org.isActive,
    });
  }

  function handleSubmit() {
    if (editingOrg) {
      updateMutation.mutate({ id: editingOrg.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  }

  const filteredOrgs = organizations?.filter(org => 
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.churchName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.slug.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (!user?.isSuperAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-gray-600">
                You need super admin privileges to access this page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedOrgId) {
    const selectedOrg = organizations?.find(o => o.id === selectedOrgId);
    return <OrgDetailView 
      org={selectedOrg!} 
      onBack={() => setSelectedOrgId(null)} 
    />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-[1400px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Super Admin Dashboard</h1>
          <p className="text-gray-500">Global platform management and organization whitelisting</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={logoutUser} className="h-11 rounded-xl border-gray-200 hover:bg-red-50 hover:text-red-600 transition-all">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={(open) => {
            setShowCreateDialog(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 h-11">
                <Plus className="w-4 h-4 mr-2" />
                Add Organization
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Create New Organization</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold">Organization Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Redeemed Christian Church"
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-sm font-semibold">Unique Slug * (URL identifier)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    placeholder="e.g., rccg-main"
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold">Global Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Official description for the platform listing"
                  className="rounded-xl min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logoUrl" className="text-sm font-semibold">Official Logo URL</Label>
                <Input
                  id="logoUrl"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  placeholder="https://..."
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-bold text-lg text-gray-900">Entity Details</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="churchName" className="text-sm font-semibold">Full Display Name</Label>
                    <Input
                      id="churchName"
                      value={formData.churchName}
                      onChange={(e) => setFormData({ ...formData, churchName: e.target.value })}
                      placeholder="e.g., WCCRM Lagos HQ"
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="churchEmail" className="text-sm font-semibold">Contact Email</Label>
                    <Input
                      id="churchEmail"
                      type="email"
                      value={formData.churchEmail}
                      onChange={(e) => setFormData({ ...formData, churchEmail: e.target.value })}
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="h-11 px-6 rounded-xl">Cancel</Button>
                <Button onClick={handleSubmit} disabled={createMutation.isPending || !formData.name || !formData.slug} className="h-11 px-8 rounded-xl font-bold">
                  {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Finalize & Create
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>

      <div className="mb-8 relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Filter organizations by name or slug..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-11 h-12 rounded-2xl border-gray-200 shadow-sm transition-all focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-gray-500 font-medium">Synchronizing organization data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
          {filteredOrgs.map((org) => (
            <Card key={org.id} className="group overflow-hidden border-2 border-transparent hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 rounded-[2rem] bg-white">
              <CardHeader className="pb-4 relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shadow-inner overflow-hidden flex-shrink-0">
                      {org.logoUrl ? (
                        <img src={org.logoUrl} alt={org.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      ) : (
                        <Building2 className="w-7 h-7 text-primary/40" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold tracking-tight text-gray-900 group-hover:text-primary transition-colors line-clamp-1">{org.name}</CardTitle>
                      <CardDescription className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded-md inline-block mt-1">{org.slug}</CardDescription>
                    </div>
                  </div>
                  <div className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm mt-1 ${org.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {org.isActive ? 'Active' : 'Offline'}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="min-h-[3rem]">
                    {org.description ? (
                      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{org.description}</p>
                    ) : (
                      <p className="text-sm italic text-gray-300">No official description provided.</p>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedOrgId(org.id)} className="flex-1 h-10 rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-white font-bold transition-all border border-primary/10">
                      <ShieldAlert className="w-4 h-4 mr-2" />
                      Manage
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(org)} className="h-10 w-10 p-0 rounded-xl hover:bg-amber-50 hover:text-amber-600 transition-colors border border-transparent hover:border-amber-100">
                      <Edit className="w-4.5 h-4.5" />
                    </Button>
                    <Button variant="ghost" size="sm" asChild className="h-10 w-10 p-0 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors border border-transparent hover:border-blue-100">
                      <a href={`/admin?org=${org.id}`} target="_blank" rel="noopener noreferrer">
                        <Eye className="w-4.5 h-4.5" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => {
                      if (confirm(`CRITICAL: Are you sure you want to delete ${org.name}? This will purge all associated tenant data.`)) {
                        deleteMutation.mutate(org.id);
                      }
                    }} className="h-10 w-10 p-0 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors border border-transparent hover:border-red-100">
                      <Trash2 className="w-4.5 h-4.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredOrgs.length === 0 && !isLoading && (
        <div className="text-center py-32 rounded-[3rem] border-2 border-dashed border-gray-100 bg-gray-50/50">
          <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-10 h-10 text-gray-200" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">No whitelisted organizations found</h3>
          <p className="text-gray-500 max-w-xs mx-auto">Try adjusting your filters or create a new organization copy to get started.</p>
        </div>
      )}
    </div>
  );
}

function OrgDetailView({ org, onBack }: { org: Organization, onBack: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("branding");

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["org-users", org.id],
    queryFn: () => fetchOrgUsers(org.id),
  });

  const { data: branding, isLoading: brandingLoading } = useQuery({
    queryKey: ["org-branding", org.id],
    queryFn: () => fetchOrgBranding(org.id),
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string, role: string }) => updateOrgUserRole(org.id, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-users", org.id] });
      toast({ title: "User role updated" });
    },
  });

  const removeUserMutation = useMutation({
    mutationFn: (userId: string) => removeOrgUser(org.id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-users", org.id] });
      toast({ title: "User removed from organization" });
    },
  });

  const brandingMutation = useMutation({
    mutationFn: (data: Partial<Branding>) => updateOrgBranding(org.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-branding", org.id] });
      toast({ title: "Branding updated successfully" });
    },
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-[1200px]">
      <Button variant="ghost" onClick={onBack} className="mb-8 hover:bg-gray-100 rounded-2xl group pl-2 transition-all">
        <ArrowLeft className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold text-gray-600">Back to Dashboard</span>
      </Button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[2rem] bg-white shadow-2xl shadow-primary/10 border-4 border-white overflow-hidden flex-shrink-0">
            {org.logoUrl ? (
              <img src={org.logoUrl} alt={org.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/5">
                <Building2 className="w-10 h-10 text-primary/40" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">{org.name}</h1>
              <span className="bg-primary/5 text-primary text-[10px] uppercase font-black px-2 py-0.5 rounded-lg border border-primary/10 tracking-widest">TENANT</span>
            </div>
            <p className="text-gray-500 font-mono text-sm leading-none flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse" />
              platform.communityhub.app/{org.slug}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="rounded-2xl h-12 px-6 font-bold border-2" asChild>
             <a href={`/admin?org=${org.id}`} target="_blank">Access Admin Console</a>
           </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
        <TabsList className="h-16 p-2 bg-gray-50 border border-gray-100 rounded-[2rem] gap-2">
          <TabsTrigger value="branding" className="h-12 px-8 rounded-2xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all">
            <Palette className="w-5 h-5 mr-2.5" />
            Branding & UI
          </TabsTrigger>
          <TabsTrigger value="users" className="h-12 px-8 rounded-2xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all">
            <Users className="w-5 h-5 mr-2.5" />
            Organization Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branding">
          <Card className="rounded-[2.5rem] border-gray-100 shadow-2xl shadow-gray-200/50 bg-white overflow-hidden">
            <CardHeader className="p-10 border-b border-gray-50">
              <CardTitle className="text-2xl font-bold">Branding Customization</CardTitle>
              <CardDescription className="text-base">Modify how this organization copy appears to its members.</CardDescription>
            </CardHeader>
            <CardContent className="p-10">
              <BrandingForm branding={branding} onSubmit={(data) => brandingMutation.mutate(data)} isLoading={brandingMutation.isPending} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="rounded-[2.5rem] border-gray-100 shadow-2xl shadow-gray-200/50 bg-white overflow-hidden">
             <CardHeader className="p-10 border-b border-gray-50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">Registered Members</CardTitle>
                <CardDescription className="text-base">Control access and assign administrative roles for {org.name}.</CardDescription>
              </div>
              <div className="bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10">
                <span className="text-sm font-bold text-primary">{users?.length || 0} Total Members</span>
              </div>
            </CardHeader>
            <CardContent className="p-10">
              {usersLoading ? (
                <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {users?.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-6 rounded-[2rem] border-2 border-gray-50 hover:border-primary/10 transition-all bg-gray-50/30 group">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-white shadow-lg border border-gray-100 flex items-center justify-center text-xl font-black text-primary">
                          {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-primary transition-colors">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1.5 font-medium"><MailIcon className="w-3 h-3" /> {user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Select 
                          value={user.isAdmin ? "admin" : "member"} 
                          onValueChange={(val) => roleMutation.mutate({ userId: user.id, role: val })}
                        >
                          <SelectTrigger className="w-[130px] h-10 rounded-xl bg-white font-bold border-gray-100 shadow-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                            <SelectItem value="member" className="font-medium rounded-lg">Member</SelectItem>
                            <SelectItem value="admin" className="font-bold text-primary rounded-lg">Administrator</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            if (confirm(`Remove ${user.firstName} from this organization?`)) {
                              removeUserMutation.mutate(user.id);
                            }
                          }}
                          className="h-10 w-10 p-0 rounded-xl hover:bg-red-50 hover:text-red-500 text-gray-300"
                        >
                          <UserMinus className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {users?.length === 0 && <p className="col-span-2 text-center py-20 text-gray-400 font-medium bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100">No members registered for this organization yet.</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BrandingForm({ branding, onSubmit, isLoading }: { branding: Branding | undefined, onSubmit: (data: Partial<Branding>) => void, isLoading: boolean }) {
  const [data, setData] = useState({
    churchName: branding?.churchName || "",
    churchEmail: branding?.churchEmail || "",
    churchPhone: branding?.churchPhone || "",
    churchAddress: branding?.churchAddress || "",
    logoUrl: branding?.logoUrl || "",
    primaryColor: branding?.colors?.primary || "#3b82f6",
    secondaryColor: branding?.colors?.secondary || "#1e40af",
    accentColor: branding?.colors?.accent || "#f59e0b",
  });

  // Update local state when branding data is fetched
  useState(() => {
    if (branding) setData({
      churchName: branding.churchName || "",
      churchEmail: branding.churchEmail || "",
      churchPhone: branding.churchPhone || "",
      churchAddress: branding.churchAddress || "",
      logoUrl: branding.logoUrl || "",
      primaryColor: branding.colors?.primary || "#3b82f6",
      secondaryColor: branding.colors?.secondary || "#1e40af",
      accentColor: branding.colors?.accent || "#f59e0b",
    });
  });

  return (
    <div className="space-y-10 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
        <div className="space-y-3">
          <Label className="text-sm font-black text-gray-500 uppercase tracking-widest">Public Church Name</Label>
          <Input value={data.churchName} onChange={e => setData({...data, churchName: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-gray-100 font-bold focus:bg-white transition-all shadow-inner" />
        </div>
        <div className="space-y-3">
          <Label className="text-sm font-black text-gray-500 uppercase tracking-widest">Platform Logo (Squared URL)</Label>
          <Input value={data.logoUrl} onChange={e => setData({...data, logoUrl: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-gray-100 font-medium focus:bg-white transition-all shadow-inner" />
        </div>
        <div className="space-y-3">
          <Label className="text-sm font-black text-gray-500 uppercase tracking-widest">Contact Email</Label>
          <Input value={data.churchEmail} onChange={e => setData({...data, churchEmail: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-gray-100 font-medium focus:bg-white transition-all shadow-inner" />
        </div>
        <div className="space-y-3">
          <Label className="text-sm font-black text-gray-500 uppercase tracking-widest">Physical Address</Label>
          <Input value={data.churchAddress} onChange={e => setData({...data, churchAddress: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-gray-100 font-medium focus:bg-white transition-all shadow-inner" />
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t border-gray-50">
        <Label className="text-base font-black text-gray-900">Color Palette & Visual Identity</Label>
        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-3 p-6 rounded-3xl bg-gray-50 border border-gray-100 shadow-inner">
            <Label className="text-xs font-black text-gray-400 uppercase tracking-widest">Primary Color</Label>
            <div className="flex items-center gap-4">
               <Input type="color" value={data.primaryColor} onChange={e => setData({...data, primaryColor: e.target.value})} className="w-14 h-14 p-1 rounded-2xl border-none bg-white shadow-md cursor-pointer" />
               <span className="font-mono text-sm font-bold text-gray-500">{data.primaryColor.toUpperCase()}</span>
            </div>
          </div>
          <div className="space-y-3 p-6 rounded-3xl bg-gray-50 border border-gray-100 shadow-inner">
            <Label className="text-xs font-black text-gray-400 uppercase tracking-widest">Secondary</Label>
             <div className="flex items-center gap-4">
               <Input type="color" value={data.secondaryColor} onChange={e => setData({...data, secondaryColor: e.target.value})} className="w-14 h-14 p-1 rounded-2xl border-none bg-white shadow-md cursor-pointer" />
                <span className="font-mono text-sm font-bold text-gray-500">{data.secondaryColor.toUpperCase()}</span>
            </div>
          </div>
          <div className="space-y-3 p-6 rounded-3xl bg-gray-50 border border-gray-100 shadow-inner">
            <Label className="text-xs font-black text-gray-400 uppercase tracking-widest">Accent</Label>
             <div className="flex items-center gap-4">
               <Input type="color" value={data.accentColor} onChange={e => setData({...data, accentColor: e.target.value})} className="w-14 h-14 p-1 rounded-2xl border-none bg-white shadow-md cursor-pointer" />
                <span className="font-mono text-sm font-bold text-gray-500">{data.accentColor.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-10 flex justify-end">
        <Button 
          onClick={() => onSubmit({
            ...data,
            colors: {
              primary: data.primaryColor,
              secondary: data.secondaryColor,
              accent: data.accentColor
            }
          } as any)} 
          disabled={isLoading} 
          className="h-16 px-12 rounded-[2rem] gradient-accent text-primary-foreground font-black text-lg shadow-2xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 transition-all"
        >
          {isLoading && <Loader2 className="mr-3 h-6 w-6 animate-spin" />}
          Apply Brand Identity
        </Button>
      </div>
    </div>
  );
}
