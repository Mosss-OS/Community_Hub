import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonList } from "@/components/SkeletonList";
import { EmptyState } from "@/components/EmptyState";
import { Users } from "lucide-react";
import { HiViewGrid, HiMenu } from "react-icons/hi";
import { 
  Search, 
  Loader2, 
  Users,
  Mail,
  Phone,
  MapPin,
  Home,
  Building,
  Shield,
  ChevronLeft,
  ChevronRight,
  User,
  Download,
  Calendar,
  Activity,
  MessageSquare,
  Eye,
  EyeOff
} from "lucide-react";
import { buildApiUrl } from "@/lib/api-config";

interface Member {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  address: string | null;
  houseFellowship: string | null;
  houseCellLocation: string | null;
  parish: string | null;
  role: string;
  isAdmin: boolean;
  createdAt: string;
}

interface MembersResponse {
  members: Member[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    roles: string[];
    houseFellowships: string[];
    parishes?: string[];
  };
}

const roleColors: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-800",
  PASTOR: "bg-purple-100 text-purple-800",
  PASTORS_WIFE: "bg-purple-100 text-purple-800",
  CELL_LEADER: "bg-blue-100 text-blue-800",
  USHERS_LEADER: "bg-green-100 text-green-800",
  PRAYER_TEAM: "bg-pink-100 text-pink-800",
  FINANCE_TEAM: "bg-yellow-100 text-yellow-800",
  CHILDREN_LEADER: "bg-orange-100 text-orange-800",
  CHOIRMASTER: "bg-indigo-100 text-indigo-800",
  CHORISTER: "bg-indigo-100 text-indigo-800",
  SOUND_EQUIPMENT: "bg-gray-100 text-gray-800",
  SECURITY: "bg-red-100 text-red-800",
  SUNDAY_SCHOOL_TEACHER: "bg-teal-100 text-teal-800",
  TECH_TEAM: "bg-slate-100 text-slate-800",
  DECOR_TEAM: "bg-rose-100 text-rose-800",
  EVANGELISM_TEAM: "bg-cyan-100 text-cyan-800",
  USHER: "bg-green-100 text-green-800",
  MEMBER: "bg-gray-100 text-gray-800",
  USER: "bg-gray-100 text-gray-800",
};

const formatRole = (role: string) => {
  return role.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
};

export default function MembersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<MembersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [houseFellowshipFilter, setHouseFellowshipFilter] = useState("");
  const [parishFilter, setParishFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [directoryOnly, setDirectoryOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  useEffect(() => {
    async function fetchMembers() {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "20",
        });
        
        if (search) params.append("search", search);
        if (roleFilter) params.append("role", roleFilter);
        if (houseFellowshipFilter) params.append("houseFellowship", houseFellowshipFilter);
        if (parishFilter) params.append("parish", parishFilter);
        if (dateFrom) params.append("dateFrom", dateFrom);
        if (dateTo) params.append("dateTo", dateTo);
        if (directoryOnly) params.append("directoryOnly", "true");

        const res = await fetch(buildApiUrl(`/api/members?${params}`), {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch members");
        }

        const result = await res.json();
        setData(result);
      } catch (err: any) {
        console.error("Error fetching members:", err);
        setError(err.message || "Failed to load members");
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchMembers();
    }
  }, [user, page, roleFilter, houseFellowshipFilter, parishFilter, dateFrom, dateTo]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const exportToCSV = () => {
    if (!data?.members.length) return;
    
    const headers = ["Name", "Email", "Phone", "Role", "House Fellowship", "House Cell", "Parish", "Member Since"];
    const rows = data.members.map(m => [
      `${m.firstName} ${m.lastName}`,
      m.email,
      m.phone || "",
      m.role,
      m.houseFellowship || "",
      m.houseCellLocation || "",
      m.parish || "",
      new Date(m.createdAt).toLocaleDateString()
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `members_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = async () => {
    if (!data?.members.length) return;
    
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Member Directory", 14, 22);
    doc.setFontSize(10);
    doc.text(`Exported on ${new Date().toLocaleDateString()}`, 14, 30);
    
    let y = 40;
    data.members.forEach((member, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(10);
      doc.text(`${member.firstName} ${member.lastName}`, 14, y);
      doc.setFontSize(8);
      doc.text(`${member.email} | ${member.role} | Joined: ${new Date(member.createdAt).toLocaleDateString()}`, 14, y + 6);
      y += 14;
    });
    
    doc.save(`members_export_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const exportToVCard = () => {
    if (!data?.members.length) return;
    
    const vcards = data.members.map(member => {
      const name = `${member.firstName} ${member.lastName}`.trim();
      const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${name}`,
        `EMAIL:${member.email}`,
      ];
      
      if (member.phone) lines.push(`TEL:${member.phone}`);
      if (member.address) lines.push(`ADR;TYPE=HOME:;;${member.address}`);
      if (member.role) lines.push(`TITLE:${formatRole(member.role)}`);
      if (member.houseFellowship) lines.push(`NOTE:House Fellowship: ${member.houseFellowship}`);
      
      lines.push("END:VCARD");
      return lines.join("\r\n");
    }).join("\r\n\r\n");

    const blob = new Blob([vcards], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `members_export_${new Date().toISOString().split("T")[0]}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("");
    setHouseFellowshipFilter("");
    setParishFilter("");
    setDateFrom("");
    setDateTo("");
    setDirectoryOnly(false);
    setPage(1);
  };

  if (authLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="space-y-4 mb-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <SkeletonList type="item" count={5} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-24" />
            </div>
          </CardContent>
        </Card>
        <SkeletonList type="item" count={5} />
      </div>
    );
  }



  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Member Directory</h1>
          <p className="text-muted-foreground mt-1">
            Manage and view all church members
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {data?.pagination.total || 0} total members
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg ${viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
          >
            <HiMenu className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
          >
            <HiViewGrid className="w-5 h-5" />
          </button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone, or house fellowship..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>

          <div className="flex flex-wrap gap-4 mt-4">
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="">All Roles</option>
              {data?.filters.roles.map((role) => (
                <option key={role} value={role}>
                  {formatRole(role)}
                </option>
              ))}
            </select>

            <select
              value={houseFellowshipFilter}
              onChange={(e) => { setHouseFellowshipFilter(e.target.value); setPage(1); }}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="">All House Fellowships</option>
              {data?.filters.houseFellowships.map((hf) => (
                <option key={hf} value={hf}>
                  {hf}
                </option>
              ))}
            </select>

            <select
              value={parishFilter}
              onChange={(e) => { setParishFilter(e.target.value); setPage(1); }}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="">All Parishes</option>
              {data?.filters.parishes?.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="w-auto h-10"
              placeholder="From date"
            />

            <Input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="w-auto h-10"
              placeholder="To date"
            />

            {(roleFilter || houseFellowshipFilter || parishFilter || dateFrom || dateTo || search || directoryOnly) && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
            <Button 
              variant={directoryOnly ? "default" : "outline"} 
              size="sm"
              onClick={() => { setDirectoryOnly(!directoryOnly); setPage(1); }}
              title="Show only members in directory"
            >
              {directoryOnly ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
              Directory
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2 mb-4">
        <Button variant="outline" onClick={exportToCSV} disabled={!data?.members.length}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
        <Button variant="outline" onClick={exportToPDF} disabled={!data?.members.length}>
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
        <Button variant="outline" onClick={exportToVCard} disabled={!data?.members.length}>
          <Download className="w-4 h-4 mr-2" />
          Export VCard
        </Button>
      </div>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-card border rounded-lg">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && data && (
        <>
          {data.members.length === 0 ? (
            <EmptyState 
              title="No members found"
              description="No members match your search filters. Try adjusting your search criteria."
              actionLabel="Clear filters"
              actionHref="/members"
            />
          ) : (
            <>
              <div className={`grid gap-4 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                {data.members.map((member) => (
                  <Card key={member.id} className={`hover:shadow-md transition-shadow ${viewMode === "grid" ? "" : "flex items-center p-4"}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {member.firstName} {member.lastName}
                            </CardTitle>
                            <span className={`text-xs px-2 py-1 rounded-full ${roleColors[member.role] || "bg-gray-100 text-gray-800"}`}>
                              {formatRole(member.role)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      {member.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{member.phone}</span>
                        </div>
                      )}
                      {member.houseFellowship && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Home className="h-4 w-4" />
                          <span>{member.houseFellowship}</span>
                        </div>
                      )}
                      {member.houseCellLocation && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{member.houseCellLocation}</span>
                        </div>
                      )}
                      {member.parish && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Building className="h-4 w-4" />
                          <span>{member.parish}</span>
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground pt-2">
                        Member since {new Date(member.createdAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {data.pagination.page} of {data.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                    disabled={page === data.pagination.totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
