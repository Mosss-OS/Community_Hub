import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useBranding, type Branding } from "@/hooks/use-branding";
import { useEventWithRsvps } from "@/hooks/use-events";
import { useSermons } from "@/hooks/use-sermons";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Users, Shield, Calendar, FileText, Plus, Trash2, Edit, Palette, Heart, Search, MapPin, Clock, User, Mail, Phone, BarChart3, Link, QrCode, TrendingUp, Video, DollarSign, TrendingDown, CheckCircle, HeartHandshake } from "lucide-react";
import { apiRoutes } from "@/lib/api-routes";
import { buildApiUrl } from "@/lib/api-config";
import type { Event, Sermon, InsertEvent, InsertSermon, UserRole } from "@/types/api";
import { USER_ROLES } from "@/types/api";

interface DashboardStats {
  totalMembers: number;
  totalDonations: number;
  totalEvents: number;
  totalSermons: number;
  totalPrayers: number;
  recentDonations: number;
  recentAttendance: number;
}

interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  houseFellowship?: string;
  houseCellLocation?: string;
  parish?: string;
  role?: UserRole;
  isVerified?: boolean;
  createdAt: string;
  isAdmin: boolean;
}

function BrandingForm({ branding, onSubmit, isLoading }: { branding: Branding | undefined; onSubmit: (data: Partial<Branding>) => void; isLoading: boolean }) {
  const [formData, setFormData] = useState({
    primary: branding?.colors?.primary || "#3b82f6",
    secondary: branding?.colors?.secondary || "#f8fafc",
    accent: branding?.colors?.accent || "#10b981",
    headingFont: branding?.fonts?.heading || "Inter",
    bodyFont: branding?.fonts?.body || "Inter",
    logoUrl: branding?.logoUrl || "",
    faviconUrl: branding?.faviconUrl || "",
    churchName: branding?.churchName || "",
    churchAddress: branding?.churchAddress || "",
    churchCity: branding?.churchCity || "",
    churchState: branding?.churchState || "",
    churchCountry: branding?.churchCountry || "",
    churchZipCode: branding?.churchZipCode || "",
    churchPhone: branding?.churchPhone || "",
    churchEmail: branding?.churchEmail || "",
    sundayService: branding?.serviceTimes?.sunday || "7:00 AM & 9:00 AM",
    wednesdayService: branding?.serviceTimes?.wednesday || "6:00 PM",
    fridayService: branding?.serviceTimes?.friday || "7:00 PM",
    youtubeUrl: branding?.youtubeUrl || "",
    instagramUrl: branding?.instagramUrl || "",
    facebookUrl: branding?.facebookUrl || "",
    twitterUrl: branding?.twitterUrl || "",
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingLogo(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
        credentials: 'include',
      });
      
      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, logoUrl: data.url }));
      } else {
        alert('Failed to upload logo');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      colors: {
        primary: formData.primary,
        secondary: formData.secondary,
        accent: formData.accent,
      },
      fonts: {
        heading: formData.headingFont,
        body: formData.bodyFont,
      },
      logoUrl: formData.logoUrl || null,
      faviconUrl: formData.faviconUrl || null,
      churchName: formData.churchName || null,
      churchAddress: formData.churchAddress || null,
      churchCity: formData.churchCity || null,
      churchState: formData.churchState || null,
      churchCountry: formData.churchCountry || null,
      churchZipCode: formData.churchZipCode || null,
      churchPhone: formData.churchPhone || null,
      churchEmail: formData.churchEmail || null,
      serviceTimes: {
        sunday: formData.sundayService,
        wednesday: formData.wednesdayService,
        friday: formData.fridayService,
      },
      youtubeUrl: formData.youtubeUrl || null,
      instagramUrl: formData.instagramUrl || null,
      facebookUrl: formData.facebookUrl || null,
      twitterUrl: formData.twitterUrl || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="primary">Primary Color</Label>
          <div className="flex gap-2 mt-1">
            <Input type="color" value={formData.primary} onChange={e => setFormData({...formData, primary: e.target.value})} className="w-12 h-10 p-1" />
            <Input value={formData.primary} onChange={e => setFormData({...formData, primary: e.target.value})} className="flex-1" />
          </div>
        </div>
        <div>
          <Label htmlFor="secondary">Secondary Color</Label>
          <div className="flex gap-2 mt-1">
            <Input type="color" value={formData.secondary} onChange={e => setFormData({...formData, secondary: e.target.value})} className="w-12 h-10 p-1" />
            <Input value={formData.secondary} onChange={e => setFormData({...formData, secondary: e.target.value})} className="flex-1" />
          </div>
        </div>
        <div>
          <Label htmlFor="accent">Accent Color</Label>
          <div className="flex gap-2 mt-1">
            <Input type="color" value={formData.accent} onChange={e => setFormData({...formData, accent: e.target.value})} className="w-12 h-10 p-1" />
            <Input value={formData.accent} onChange={e => setFormData({...formData, accent: e.target.value})} className="flex-1" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="headingFont">Heading Font</Label>
          <Input id="headingFont" value={formData.headingFont} onChange={e => setFormData({...formData, headingFont: e.target.value})} placeholder="e.g., Inter, Poppins" />
        </div>
        <div>
          <Label htmlFor="bodyFont">Body Font</Label>
          <Input id="bodyFont" value={formData.bodyFont} onChange={e => setFormData({...formData, bodyFont: e.target.value})} placeholder="e.g., Inter, Open Sans" />
        </div>
      </div>

      <div>
        <Label>Church Logo</Label>
        <div className="flex items-start gap-4 mt-2">
          <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
            {formData.logoUrl ? (
              <img src={formData.logoUrl} alt="Logo preview" className="w-full h-full object-contain" />
            ) : (
              <span className="text-xs text-gray-400 text-center p-2">No logo</span>
            )}
          </div>
          <div className="flex-1">
            <Input 
              type="file" 
              accept="image/*"
              onChange={handleLogoUpload}
              disabled={uploadingLogo}
              className="mb-2"
            />
            <p className="text-xs text-gray-500">Upload a logo (recommended: 200x200px, PNG or JPG)</p>
            {uploadingLogo && (
              <div className="mt-2 space-y-1">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-blue-500">Uploading... {uploadProgress}%</p>
              </div>
            )}
          </div>
        </div>
        <div className="mt-2">
          <Label htmlFor="logoUrl">Or paste Logo URL</Label>
          <Input 
            id="logoUrl" 
            value={formData.logoUrl} 
            onChange={e => setFormData({...formData, logoUrl: e.target.value})} 
            placeholder="https://..." 
          />
        </div>
      </div>

      <div className="border-t pt-4 mt-4">
        <h3 className="text-lg font-semibold mb-4">Church Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="churchName">Church Name</Label>
            <Input id="churchName" value={formData.churchName} onChange={e => setFormData({...formData, churchName: e.target.value})} placeholder="Church name" />
          </div>
          <div>
            <Label htmlFor="churchPhone">Phone</Label>
            <Input id="churchPhone" value={formData.churchPhone} onChange={e => setFormData({...formData, churchPhone: e.target.value})} placeholder="+234..." />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="churchAddress">Address</Label>
            <Input id="churchAddress" value={formData.churchAddress} onChange={e => setFormData({...formData, churchAddress: e.target.value})} placeholder="Street address" />
          </div>
          <div>
            <Label htmlFor="churchCity">City</Label>
            <Input id="churchCity" value={formData.churchCity} onChange={e => setFormData({...formData, churchCity: e.target.value})} placeholder="City" />
          </div>
          <div>
            <Label htmlFor="churchState">State</Label>
            <Input id="churchState" value={formData.churchState} onChange={e => setFormData({...formData, churchState: e.target.value})} placeholder="State" />
          </div>
          <div>
            <Label htmlFor="churchCountry">Country</Label>
            <Input id="churchCountry" value={formData.churchCountry} onChange={e => setFormData({...formData, churchCountry: e.target.value})} placeholder="Country" />
          </div>
          <div>
            <Label htmlFor="churchZipCode">Zip Code</Label>
            <Input id="churchZipCode" value={formData.churchZipCode} onChange={e => setFormData({...formData, churchZipCode: e.target.value})} placeholder="Zip code" />
          </div>
          <div>
            <Label htmlFor="churchEmail">Email</Label>
            <Input id="churchEmail" type="email" value={formData.churchEmail} onChange={e => setFormData({...formData, churchEmail: e.target.value})} placeholder="church@example.com" />
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="font-medium mb-4">Service Times</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="sundayService">Sunday Service</Label>
            <Input id="sundayService" value={formData.sundayService} onChange={e => setFormData({...formData, sundayService: e.target.value})} placeholder="7:00 AM & 9:00 AM" />
          </div>
          <div>
            <Label htmlFor="wednesdayService">Wednesday Service</Label>
            <Input id="wednesdayService" value={formData.wednesdayService} onChange={e => setFormData({...formData, wednesdayService: e.target.value})} placeholder="6:00 PM" />
          </div>
          <div>
            <Label htmlFor="fridayService">Friday Service</Label>
            <Input id="fridayService" value={formData.fridayService} onChange={e => setFormData({...formData, fridayService: e.target.value})} placeholder="7:00 PM" />
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="font-medium mb-4">Social Media Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="youtubeUrl">YouTube URL</Label>
            <Input id="youtubeUrl" value={formData.youtubeUrl} onChange={e => setFormData({...formData, youtubeUrl: e.target.value})} placeholder="https://youtube.com/@channel" />
          </div>
          <div>
            <Label htmlFor="instagramUrl">Instagram URL</Label>
            <Input id="instagramUrl" value={formData.instagramUrl} onChange={e => setFormData({...formData, instagramUrl: e.target.value})} placeholder="https://instagram.com/church" />
          </div>
          <div>
            <Label htmlFor="facebookUrl">Facebook URL</Label>
            <Input id="facebookUrl" value={formData.facebookUrl} onChange={e => setFormData({...formData, facebookUrl: e.target.value})} placeholder="https://facebook.com/church" />
          </div>
          <div>
            <Label htmlFor="twitterUrl">Twitter/X URL</Label>
            <Input id="twitterUrl" value={formData.twitterUrl} onChange={e => setFormData({...formData, twitterUrl: e.target.value})} placeholder="https://x.com/church" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Branding
        </Button>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: formData.primary }} />
            <span className="text-sm">Primary</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: formData.secondary }} />
            <span className="text-sm">Secondary</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: formData.accent }} />
            <span className="text-sm">Accent</span>
          </div>
        </div>
      </div>
    </form>
  );
}

export default function AdminDashboardPage() {
  const { user, isLoading: isUserLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[] | null>(null);
  const [houseCellInputs, setHouseCellInputs] = useState<Record<string, string>>({});
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  const { data: eventWithRsvps, isLoading: isRsvpsLoading } = useEventWithRsvps(selectedEventId ?? 0);

  const { data: users, isLoading: isUsersLoading, refetch: refetchUsers } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await fetch(buildApiUrl(apiRoutes.admin.users), {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
    enabled: user?.isAdmin === true,
  });

  const { data: events, isLoading: isEventsLoading, refetch: refetchEvents } = useQuery<Event[]>({
    queryKey: [apiRoutes.events.list],
    queryFn: async () => {
      const res = await fetch(buildApiUrl(apiRoutes.events.list));
      if (!res.ok) throw new Error("Failed to fetch events");
      return res.json();
    },
  });

  const { data: sermons, isLoading: isSermonsLoading, refetch: refetchSermons } = useQuery<Sermon[]>({
    queryKey: [apiRoutes.sermons.list],
    queryFn: async () => {
      const res = await fetch(buildApiUrl(apiRoutes.sermons.list));
      if (!res.ok) throw new Error("Failed to fetch sermons");
      return res.json();
    },
  });

  const { data: dashboardStats, isLoading: isStatsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/analytics/dashboard"],
    queryFn: async () => {
      const res = await fetch(buildApiUrl("/api/analytics/dashboard"), {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      return res.json();
    },
    enabled: user?.isAdmin === true,
  });

  const createEvent = useMutation({
    mutationFn: async (data: InsertEvent) => {
      const res = await fetch(buildApiUrl(apiRoutes.events.create), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create event");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiRoutes.events.list] });
      toast({ title: "Event created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create event", variant: "destructive" });
    },
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertEvent> }) => {
      const res = await fetch(buildApiUrl(`/api/events/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update event");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiRoutes.events.list] });
      toast({ title: "Event updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update event", variant: "destructive" });
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(buildApiUrl(`/api/events/${id}`), {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete event");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiRoutes.events.list] });
      toast({ title: "Event deleted" });
    },
  });

  const createSermon = useMutation({
    mutationFn: async (data: InsertSermon) => {
      const res = await fetch(buildApiUrl(apiRoutes.sermons.create), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create sermon");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiRoutes.sermons.list] });
      toast({ title: "Sermon created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create sermon", variant: "destructive" });
    }
  });

  const updateSermon = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertSermon> }) => {
      const res = await fetch(buildApiUrl(`/api/sermons/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update sermon");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiRoutes.sermons.list] });
      toast({ title: "Sermon updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update sermon", variant: "destructive" });
    }
  });

  const deleteSermon = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(buildApiUrl(`/api/sermons/${id}`), {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete sermon");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiRoutes.sermons.list] });
      toast({ title: "Sermon deleted" });
    },
  });

  const updateUserRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      const res = await fetch(buildApiUrl(`/api/admin/users/${userId}/role`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update user role");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Role updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update role", variant: "destructive" });
    },
  });

  const searchMembers = useMutation({
    mutationFn: async (query: string) => {
      const res = await fetch(buildApiUrl(`/api/members/search?q=${encodeURIComponent(query)}`), {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to search members");
      return res.json();
    },
    onSuccess: (data) => {
      setFilteredUsers(data);
      toast({ title: `Found ${data.length} member(s)` });
    },
    onError: () => {
      toast({ title: "Failed to search members", variant: "destructive" });
    },
  });

  const updateHouseCell = useMutation({
    mutationFn: async ({ userId, houseCellLocation }: { userId: string; houseCellLocation: string }) => {
      const res = await fetch(buildApiUrl(`/api/members/${userId}/house-cell`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ houseCellLocation }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update house cell");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "House cell location updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update house cell", variant: "destructive" });
    },
  });

  const verifyUser = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(buildApiUrl(`/api/admin/users/${userId}/verify`), {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to verify user");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Member verified successfully" });
    },
    onError: () => {
      toast({ title: "Failed to verify member", variant: "destructive" });
    },
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchMembers.mutate(query);
    } else {
      setFilteredUsers(null);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setRoleFilter("all");
    setFilteredUsers(null);
  };

  const displayUsers = (filteredUsers || users)?.filter(user => 
    roleFilter === "all" || user.role === roleFilter || (!user.role && roleFilter === "MEMBER")
  );
  const isSearching = filteredUsers !== null || roleFilter !== "all";

  const { data: branding, isLoading: isBrandingLoading } = useBranding();
  const updateBranding = useMutation({
    mutationFn: async (data: Partial<Branding>) => {
      const res = await fetch(buildApiUrl("/api/branding"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update branding");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/branding"] });
      toast({ title: "Branding updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update branding", variant: "destructive" });
    },
  });

  if (isUserLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Admin access required.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <Helmet>
        <title>Admin Dashboard | Watchman Lekki</title>
      </Helmet>

      <div className="container px-4 md:px-8 max-w-[95%] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500">Manage your church platform</p>
          </div>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger value="users" className="gap-2 rounded-md">
              <Users className="h-4 w-4" /> Users
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2 rounded-md">
              <Calendar className="h-4 w-4" /> Events
            </TabsTrigger>
            <TabsTrigger value="sermons" className="gap-2 rounded-md">
              <FileText className="h-4 w-4" /> Sermons
            </TabsTrigger>
            <TabsTrigger value="attendance" className="gap-2 rounded-md">
              <BarChart3 className="h-4 w-4" /> Attendance
            </TabsTrigger>
            <TabsTrigger value="branding" className="gap-2 rounded-md">
              <Palette className="h-4 w-4" /> Branding
            </TabsTrigger>
            <TabsTrigger value="overview" className="gap-2 rounded-md">
              <Shield className="h-4 w-4" /> Overview
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="border border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">User Management</CardTitle>
                <CardDescription className="text-gray-500">View and manage all registered users</CardDescription>
              </CardHeader>
              <CardContent>
                {isUsersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search members by name, email, phone, house fellowship..."
                          value={searchQuery}
                          onChange={(e) => handleSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-[160px]">
                          <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          {USER_ROLES.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {(isSearching || roleFilter !== "all") && (
                        <Button type="button" variant="outline" onClick={clearSearch}>
                          Clear
                        </Button>
                      )}
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                      <div className="min-w-[1100px]">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Name</th>
                            <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Email</th>
                            <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Phone</th>
                            <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">House Cell Location</th>
                            <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">House Fellowship</th>
                            <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Verified</th>
                            <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Joined</th>
                            <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Role</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayUsers?.map((u) => (
                            <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-4 px-4 font-medium text-gray-900 text-sm">
                                {u.firstName ? `${u.firstName} ${u.lastName || ''}` : '-'}
                              </td>
                              <td className="py-4 px-4 text-gray-600 text-sm">{u.email}</td>
                              <td className="py-4 px-4 text-gray-500 text-sm">{u.phone || '-'}</td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <Input
                                    placeholder="Enter location"
                                    value={houseCellInputs[u.id] || u.houseCellLocation || ''}
                                    onChange={(e) => setHouseCellInputs({ ...houseCellInputs, [u.id]: e.target.value })}
                                    className="h-9 w-40 text-sm"
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const location = houseCellInputs[u.id];
                                      if (location) {
                                        updateHouseCell.mutate({ userId: u.id, houseCellLocation: location });
                                      }
                                    }}
                                    disabled={updateHouseCell.isPending || !houseCellInputs[u.id]}
                                    className="h-9"
                                  >
                                    Save
                                  </Button>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-gray-600 text-sm">{u.houseFellowship || '-'}</td>
                              <td className="py-4 px-4">
                                {u.isVerified ? (
                                  <Badge className="bg-green-500 text-white">Verified</Badge>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">Pending</Badge>
                                    <Button
                                      size="sm"
                                      variant="default"
                                      onClick={() => verifyUser.mutate(u.id)}
                                      disabled={verifyUser.isPending}
                                      className="h-8 text-xs bg-blue-600 hover:bg-blue-700"
                                    >
                                      Verify
                                    </Button>
                                  </div>
                                )}
                              </td>
                              <td className="py-4 px-4 text-gray-500 text-sm">
                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                              </td>
                              <td className="py-4 px-4">
                                <Select
                                  value={u.role || 'MEMBER'}
                                  onValueChange={(value) => {
                                    if (value !== u.role) {
                                      updateUserRole.mutate({ userId: u.id, role: value as UserRole });
                                    }
                                  }}
                                  disabled={updateUserRole.isPending}
                                >
                                  <SelectTrigger className="w-[180px] h-9 bg-white">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white/95 backdrop-blur-sm border-gray-200 shadow-xl">
                                    {USER_ROLES.map((role) => (
                                      <SelectItem key={role.value} value={role.value} className="cursor-pointer">
                                        {role.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {displayUsers?.length === 0 && (
                        <p className="text-center py-8 text-gray-500">No users found</p>
                      )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Event Management</CardTitle>
                  <CardDescription>Create and manage church events</CardDescription>
                </div>
                <CreateEventDialog onSubmit={(data) => createEvent.mutate(data)} isLoading={createEvent.isPending} />
              </CardHeader>
              <CardContent>
                {isEventsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {events?.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold">{event.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.date).toLocaleDateString()} • {event.location}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => setSelectedEventId(Number(event.id))}>
                            <Users className="h-4 w-4 mr-1" />
                            RSVPs
                          </Button>
                          <EditEventDialog event={event} onSubmit={(data) => updateEvent.mutate({ id: event.id, data })} isLoading={updateEvent.isPending} />
                          <Button variant="destructive" size="icon" onClick={() => deleteEvent.mutate(event.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {events?.length === 0 && (
                      <p className="text-center py-8 text-muted-foreground">No events yet</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sermons Tab */}
          <TabsContent value="sermons">
            <div className="space-y-6">
              {/* Series Management Section */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Sermon Series</CardTitle>
                    <CardDescription>Manage sermon series</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <SeriesManagement />
                </CardContent>
              </Card>

              {/* Individual Sermons Section */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Individual Sermons</CardTitle>
                    <CardDescription>Create and manage sermons</CardDescription>
                  </div>
                  <CreateSermonDialog onSubmit={(data) => createSermon.mutate(data)} isLoading={createSermon.isPending} />
                </CardHeader>
                <CardContent>
                  {isSermonsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sermons?.map((sermon) => (
                        <div key={sermon.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-semibold">{sermon.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {sermon.speaker} • {new Date(sermon.date).toLocaleDateString()}
                              {sermon.series && <span className="ml-2 text-purple-600">• {sermon.series}</span>}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <EditSermonDialog 
                              sermon={sermon} 
                              onSubmit={(data) => updateSermon.mutate({ id: sermon.id, data })} 
                              isLoading={updateSermon.isPending} 
                            />
                            <Button variant="destructive" size="icon" onClick={() => deleteSermon.mutate(sermon.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {sermons?.length === 0 && (
                        <p className="text-center py-8 text-muted-foreground">No sermons yet</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance">
            <Card className="border border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Attendance Management</CardTitle>
                <CardDescription className="text-gray-500">Manage attendance tracking and generate check-in links</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="p-4 rounded-lg border bg-gradient-to-br from-blue-50 to-blue-100/50">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <BarChart3 className="h-5 w-5 text-blue-600" />
                        </div>
                        <h3 className="font-semibold">Analytics & Reports</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">View comprehensive church analytics and reports</p>
                      <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                        <a href="/analytics" target="_blank">Open Analytics</a>
                      </Button>
                    </div>
                    <div className="p-4 rounded-lg border bg-gradient-to-br from-purple-50 to-purple-100/50">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                          <TrendingUp className="h-5 w-5 text-purple-600" />
                        </div>
                        <h3 className="font-semibold">Attendance Analytics</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">View detailed attendance analytics and trends</p>
                      <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                        <a href="/attendance/analytics" target="_blank">Open Attendance</a>
                      </Button>
                    </div>
                    <div className="p-4 rounded-lg border bg-gradient-to-br from-green-50 to-green-100/50">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-green-500/10">
                          <Link className="h-5 w-5 text-green-600" />
                        </div>
                        <h3 className="font-semibold">Generate Check-in Link</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">Create unique attendance links for members</p>
                      <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                        <a href="/attendance/checkin" target="_blank">Create Check-in Link</a>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg border bg-gray-50">
                    <h3 className="font-semibold mb-3">Quick Actions</h3>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href="/admin/sermon-clips" target="_blank">
                          <Video className="w-4 h-4 mr-2" />
                          Sermon Clips
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href="/members" target="_blank">Member Directory</a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href="/attendance" target="_blank">My Attendance History</a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href="/attendance/absent" target="_blank">Absent Members</a>
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border bg-amber-50">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/10">
                        <QrCode className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-amber-800">QR Code Check-in</h4>
                        <p className="text-sm text-amber-700 mt-1">
                          Generate QR codes for physical services. Members can scan to check in instantly.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding">
            <Card>
              <CardHeader>
                <CardTitle>Branding Settings</CardTitle>
                <CardDescription>Customize the appearance of your church website</CardDescription>
              </CardHeader>
              <CardContent>
                {isBrandingLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <BrandingForm 
                    branding={branding} 
                    onSubmit={(data) => updateBranding.mutate(data)}
                    isLoading={updateBranding.isPending}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview">
            {isStatsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Quick Stats</h2>
                  <p className="text-sm text-gray-500">Key metrics for your church platform</p>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-blue-700">Total Members</CardTitle>
                      <Users className="h-5 w-5 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-blue-900">{dashboardStats?.totalMembers || 0}</div>
                      <p className="text-xs text-blue-600 mt-1">Registered members</p>
                      <Button variant="link" className="p-0 h-auto mt-2 text-blue-600" asChild>
                        <a href="/analytics?tab=members">View details →</a>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-green-100 bg-gradient-to-br from-green-50 to-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-green-700">Total Donations</CardTitle>
                      <DollarSign className="h-5 w-5 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-900">${(dashboardStats?.totalDonations || 0).toLocaleString()}</div>
                      <p className="text-xs text-green-600 mt-1">All time giving</p>
                      <Button variant="link" className="p-0 h-auto mt-2 text-green-600" asChild>
                        <a href="/analytics?tab=donations">View details →</a>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-purple-700">Recent Donations</CardTitle>
                      <TrendingUp className="h-5 w-5 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-purple-900">${(dashboardStats?.recentDonations || 0).toLocaleString()}</div>
                      <p className="text-xs text-purple-600 mt-1">Last 30 days</p>
                      <Button variant="link" className="p-0 h-auto mt-2 text-purple-600" asChild>
                        <a href="/analytics?tab=donations">View details →</a>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-amber-100 bg-gradient-to-br from-amber-50 to-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-amber-700">Recent Attendance</CardTitle>
                      <CheckCircle className="h-5 w-5 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-amber-900">{dashboardStats?.recentAttendance || 0}</div>
                      <p className="text-xs text-amber-600 mt-1">Check-ins (30 days)</p>
                      <Button variant="link" className="p-0 h-auto mt-2 text-amber-600" asChild>
                        <a href="/attendance/analytics">View details →</a>
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Events</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardStats?.totalEvents || 0}</div>
                      <p className="text-xs text-muted-foreground">Total events</p>
                      <Button variant="link" className="p-0 h-auto mt-2" asChild>
                        <a href="/events">Manage events →</a>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Sermons</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardStats?.totalSermons || 0}</div>
                      <p className="text-xs text-muted-foreground">Total sermons</p>
                      <Button variant="link" className="p-0 h-auto mt-2" asChild>
                        <a href="/sermons">Manage sermons →</a>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Prayer Requests</CardTitle>
                      <HeartHandshake className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardStats?.totalPrayers || 0}</div>
                      <p className="text-xs text-muted-foreground">Total requests</p>
                      <Button variant="link" className="p-0 h-auto mt-2" asChild>
                        <a href="/prayer">View prayers →</a>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Administrators</CardTitle>
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{users?.filter(u => u.isAdmin).length || 0}</div>
                      <p className="text-xs text-muted-foreground">Admin accounts</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" size="sm" asChild>
                      <a href="/analytics" target="_blank">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Full Analytics
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href="/attendance/analytics" target="_blank">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Attendance Reports
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href="/members" target="_blank">
                        <Users className="w-4 h-4 mr-2" />
                        Member Directory
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href="/groups" target="_blank">
                        <Link className="w-4 h-4 mr-2" />
                        Group Management
                      </a>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        <EventRsvpDialog eventId={selectedEventId} open={selectedEventId !== null} onClose={() => setSelectedEventId(null)} />
      </div>
    </div>
  );
}

function CreateEventDialog({ onSubmit, isLoading }: { onSubmit: (data: InsertEvent) => void; isLoading: boolean }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", date: "", location: "", imageUrl: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title: formData.title,
      description: formData.description,
      date: new Date(formData.date).toISOString(),
      location: formData.location,
      imageUrl: formData.imageUrl || undefined,
    });
    setOpen(false);
    setFormData({ title: "", description: "", date: "", location: "", imageUrl: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Add Event</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
          </div>
          <div>
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="datetime-local" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required />
          </div>
          <div>
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input id="imageUrl" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} placeholder="https://..." />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Event
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditEventDialog({ event, onSubmit, isLoading }: { event: Event; onSubmit: (data: Partial<InsertEvent>) => void; isLoading: boolean }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description,
    date: new Date(event.date).toISOString().slice(0, 16),
    location: event.location,
    imageUrl: event.imageUrl || ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title: formData.title,
      description: formData.description,
      date: new Date(formData.date).toISOString(),
      location: formData.location,
      imageUrl: formData.imageUrl || undefined,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"><Edit className="h-4 w-4" /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-title">Title</Label>
            <Input id="edit-title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
          </div>
          <div>
            <Label htmlFor="edit-description">Description</Label>
            <Textarea id="edit-description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
          </div>
          <div>
            <Label htmlFor="edit-date">Date</Label>
            <Input id="edit-date" type="datetime-local" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
          </div>
          <div>
            <Label htmlFor="edit-location">Location</Label>
            <Input id="edit-location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required />
          </div>
          <div>
            <Label htmlFor="edit-imageUrl">Image URL</Label>
            <Input id="edit-imageUrl" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} placeholder="https://..." />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EventRsvpDialog({ eventId, open, onClose }: { eventId: number | null; open: boolean; onClose: () => void }) {
  const { data: eventData, isLoading } = useEventWithRsvps(eventId ?? 0);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Event RSVPs</DialogTitle>
          <DialogDescription>
            {eventData?.title || "Loading..."}
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : !eventData?.rsvps || eventData.rsvps.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No RSVPs yet</p>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{eventData.rsvps.length} people RSVP'd</p>
            <div className="space-y-3">
              {eventData.rsvps.map((rsvp: any) => (
                <div key={rsvp.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{rsvp.user?.firstName} {rsvp.user?.lastName}</p>
                      <p className="text-sm text-muted-foreground">{rsvp.user?.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{rsvp.rsvpStatus || "going"}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {rsvp.createdAt ? new Date(rsvp.createdAt).toLocaleDateString() : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function CreateSermonDialog({ onSubmit, isLoading }: { onSubmit: (data: InsertSermon) => void; isLoading: boolean }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", speaker: "", date: "", series: "", description: "", videoUrl: "", audioUrl: "", thumbnailUrl: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title: formData.title,
      speaker: formData.speaker,
      date: new Date(formData.date).toISOString(),
      series: formData.series || undefined,
      description: formData.description || undefined,
      videoUrl: formData.videoUrl || undefined,
      audioUrl: formData.audioUrl || undefined,
      thumbnailUrl: formData.thumbnailUrl || undefined,
    });
    setOpen(false);
    setFormData({ title: "", speaker: "", date: "", series: "", description: "", videoUrl: "", audioUrl: "", thumbnailUrl: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Add Sermon</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Sermon</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            </div>
            <div>
              <Label htmlFor="speaker">Speaker</Label>
              <Input id="speaker" value={formData.speaker} onChange={e => setFormData({...formData, speaker: e.target.value})} required />
            </div>
            <div>
              <Label htmlFor="sermonDate">Date</Label>
              <Input id="sermonDate" type="datetime-local" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
            </div>
            <div>
              <Label htmlFor="series">Series</Label>
              <Input id="series" value={formData.series} onChange={e => setFormData({...formData, series: e.target.value})} placeholder="Optional" />
            </div>
          </div>
          <div>
            <Label htmlFor="sermonDescription">Description</Label>
            <Textarea id="sermonDescription" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="videoUrl">Video URL</Label>
              <Input id="videoUrl" value={formData.videoUrl} onChange={e => setFormData({...formData, videoUrl: e.target.value})} placeholder="https://youtube.com/..." />
            </div>
            <div>
              <Label htmlFor="audioUrl">Audio URL</Label>
              <Input id="audioUrl" value={formData.audioUrl} onChange={e => setFormData({...formData, audioUrl: e.target.value})} placeholder="https://..." />
            </div>
          </div>
          <div>
            <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
            <Input id="thumbnailUrl" value={formData.thumbnailUrl} onChange={e => setFormData({...formData, thumbnailUrl: e.target.value})} placeholder="https://..." />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Sermon
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface EditSermonDialogProps {
  sermon: Sermon;
  onSubmit: (data: Partial<InsertSermon>) => void;
  isLoading: boolean;
}

function EditSermonDialog({ sermon, onSubmit, isLoading }: EditSermonDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: sermon.title,
    speaker: sermon.speaker,
    date: sermon.date ? new Date(sermon.date).toISOString().slice(0, 16) : "",
    series: sermon.series || "",
    description: sermon.description || "",
    videoUrl: sermon.videoUrl || "",
    audioUrl: sermon.audioUrl || "",
    thumbnailUrl: sermon.thumbnailUrl || "",
    topic: sermon.topic || "",
    isUpcoming: sermon.isUpcoming || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title: formData.title,
      speaker: formData.speaker,
      date: new Date(formData.date).toISOString(),
      series: formData.series || undefined,
      description: formData.description || undefined,
      videoUrl: formData.videoUrl || undefined,
      audioUrl: formData.audioUrl || undefined,
      thumbnailUrl: formData.thumbnailUrl || undefined,
      topic: formData.topic || undefined,
      isUpcoming: formData.isUpcoming,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Sermon</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="editTitle">Title</Label>
              <Input id="editTitle" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            </div>
            <div>
              <Label htmlFor="editSpeaker">Speaker</Label>
              <Input id="editSpeaker" value={formData.speaker} onChange={e => setFormData({...formData, speaker: e.target.value})} required />
            </div>
            <div>
              <Label htmlFor="editDate">Date</Label>
              <Input id="editDate" type="datetime-local" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
            </div>
            <div>
              <Label htmlFor="editSeries">Series</Label>
              <Input id="editSeries" value={formData.series} onChange={e => setFormData({...formData, series: e.target.value})} placeholder="Optional" />
            </div>
            <div>
              <Label htmlFor="editTopic">Topic</Label>
              <Input id="editTopic" value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})} placeholder="Optional" />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input 
                type="checkbox" 
                id="editUpcoming" 
                checked={formData.isUpcoming} 
                onChange={e => setFormData({...formData, isUpcoming: e.target.checked})}
                className="w-4 h-4"
              />
              <Label htmlFor="editUpcoming" className="font-normal">Mark as upcoming</Label>
            </div>
          </div>
          <div>
            <Label htmlFor="editDescription">Description</Label>
            <Textarea id="editDescription" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="editVideoUrl">Video URL</Label>
              <Input id="editVideoUrl" value={formData.videoUrl} onChange={e => setFormData({...formData, videoUrl: e.target.value})} placeholder="https://youtube.com/..." />
            </div>
            <div>
              <Label htmlFor="editAudioUrl">Audio URL</Label>
              <Input id="editAudioUrl" value={formData.audioUrl} onChange={e => setFormData({...formData, audioUrl: e.target.value})} placeholder="https://..." />
            </div>
          </div>
          <div>
            <Label htmlFor="editThumbnailUrl">Thumbnail URL</Label>
            <Input id="editThumbnailUrl" value={formData.thumbnailUrl} onChange={e => setFormData({...formData, thumbnailUrl: e.target.value})} placeholder="https://..." />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Sermon
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface SermonSeries {
  name: string;
  count: number;
  thumbnailUrl?: string;
}

function SeriesManagement() {
  const { data: seriesList, isLoading, refetch } = useQuery<SermonSeries[]>({
    queryKey: ["/api/sermons/series"],
    queryFn: async () => {
      const res = await fetch("/api/sermons/series", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch series");
      return res.json();
    },
  });

  const renameMutation = useMutation({
    mutationFn: async ({ oldName, newName }: { oldName: string; newName: string }) => {
      const res = await fetch(`/api/sermons/series/${encodeURIComponent(oldName)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newName }),
      });
      if (!res.ok) throw new Error("Failed to rename series");
      return res.json();
    },
    onSuccess: () => {
      refetch();
      toast({ title: "Series renamed successfully" });
    },
    onError: () => {
      toast({ title: "Failed to rename series", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch(`/api/sermons/series/${encodeURIComponent(name)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete series");
      return res.json();
    },
    onSuccess: () => {
      refetch();
      toast({ title: "Series deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete series", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!seriesList || seriesList.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No sermon series yet.</p>
        <p className="text-sm mt-2">Create sermons with a series name to see them here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {seriesList.map((series) => (
        <SeriesItem
          key={series.name}
          series={series}
          onRename={(newName) => renameMutation.mutate({ oldName: series.name, newName })}
          onDelete={() => deleteMutation.mutate(series.name)}
          isRenaming={renameMutation.isPending}
        />
      ))}
    </div>
  );
}

function SeriesItem({ series, onRename, onDelete, isRenaming }: { series: SermonSeries; onRename: (newName: string) => void; onDelete: () => void; isRenaming: boolean }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(series.name);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSave = () => {
    if (newName.trim() && newName !== series.name) {
      onRename(newName.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setNewName(series.name);
    setIsEditing(false);
  };

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg">
      {series.thumbnailUrl && (
        <img src={series.thumbnailUrl} alt={series.name} className="w-16 h-16 rounded-lg object-cover" />
      )}
      <div className="flex-1">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="max-w-xs"
              autoFocus
            />
            <Button size="sm" onClick={handleSave} disabled={isRenaming}>Save</Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>Cancel</Button>
          </div>
        ) : (
          <>
            <h4 className="font-semibold">{series.name}</h4>
            <p className="text-sm text-muted-foreground">{series.count} sermon{series.count !== 1 ? "s" : ""}</p>
          </>
        )}
      </div>
      {!isEditing && (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-1" />
            Rename
          </Button>
          {showConfirm ? (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="destructive" onClick={onDelete} disabled={isRenaming}>Confirm</Button>
              <Button size="sm" variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setShowConfirm(true)}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
