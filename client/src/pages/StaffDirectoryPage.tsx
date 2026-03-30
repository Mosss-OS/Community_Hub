import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Loader2, 
  Mail, 
  Phone, 
  MapPin,
  User,
  Cross
} from "lucide-react";
import { buildApiUrl } from "@/lib/api-config";

interface StaffMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  address: string | null;
  profileImage: string | null;
  houseFellowship: string | null;
  houseCellLocation: string | null;
  parish: string | null;
  role: string;
  career: string | null;
  createdAt: string;
}

const roleLabels: Record<string, string> = {
  ADMIN: "Administrator",
  PASTOR: "Pastor",
  PASTORS_WIFE: "Pastor's Wife",
  CELL_LEADER: "Cell Leader",
  USHERS_LEADER: "Ushering Leader",
  PRAYER_TEAM: "Prayer Team",
  FINANCE_TEAM: "Finance Team",
  CHILDREN_LEADER: "Children's Ministry",
  CHOIRMASTER: "Choir Master",
  CHORISTER: "Choir Member",
  SOUND_EQUIPMENT: "Sound Team",
  SECURITY: "Security",
  SUNDAY_SCHOOL_TEACHER: "Sunday School",
  TECH_TEAM: "Tech Team",
  DECOR_TEAM: "Decoration Team",
  EVANGELISM_TEAM: "Evangelism Team",
  USHER: "Usher",
};

const leadershipRoles = ["PASTOR", "PASTORS_WIFE", "ADMIN"];
const staffRoles = ["CELL_LEADER", "USHERS_LEADER", "PRAYER_TEAM", "FINANCE_TEAM", "CHILDREN_LEADER", "CHOIRMASTER", "SOUND_EQUIPMENT", "SECURITY", "SUNDAY_SCHOOL_TEACHER", "TECH_TEAM", "DECOR_TEAM", "EVANGELISM_TEAM"];

export default function StaffDirectoryPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");

  useEffect(() => {
    async function fetchStaff() {
      try {
        const res = await fetch(buildApiUrl("/api/members?limit=100&includeStaff=true"), {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          const allMembers = data.members || data;
          const staffMembers = allMembers.filter((m: StaffMember) => 
            [...leadershipRoles, ...staffRoles].includes(m.role)
          );
          setStaff(staffMembers);
          setFilteredStaff(staffMembers);
        }
      } catch (err) {
        console.error("Error fetching staff:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStaff();
  }, []);

  useEffect(() => {
    let filtered = staff;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.firstName.toLowerCase().includes(query) ||
          s.lastName.toLowerCase().includes(query) ||
          s.email.toLowerCase().includes(query) ||
          (s.parish && s.parish.toLowerCase().includes(query)) ||
          (s.houseFellowship && s.houseFellowship.toLowerCase().includes(query))
      );
    }
    
    if (selectedRole !== "all") {
      filtered = filtered.filter((s) => s.role === selectedRole);
    }
    
    setFilteredStaff(filtered);
  }, [searchQuery, selectedRole, staff]);

  const leadership = filteredStaff.filter((s) => leadershipRoles.includes(s.role));
  const ministryLeaders = filteredStaff.filter((s) => staffRoles.includes(s.role) && !["USHERS_LEADER", "CELL_LEADER"].includes(s.role));
  const cellLeaders = filteredStaff.filter((s) => s.role === "CELL_LEADER");
  const ushers = filteredStaff.filter((s) => s.role === "USHERS_LEADER");

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff & Leaders</h1>
          <p className="text-muted-foreground mt-1">
            Meet our church leadership and ministry teams
          </p>
        </div>
      </div>

      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-4 py-2 rounded-xl border border-border/50 bg-card/50"
        >
          <option value="all">All Roles</option>
          {Object.entries(roleLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {leadership.length > 0 && selectedRole === "all" && (
            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Cross className="h-6 w-6 text-primary" />
                Pastoral Leadership
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {leadership.map((member) => (
                  <Card key={member.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5" />
                    <CardContent className="-mt-12 relative">
                      <div className="w-24 h-24 rounded-full bg-background border-4 border-card overflow-hidden mx-auto">
                        {member.profileImage ? (
                          <img src={member.profileImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10">
                            <User className="h-10 w-10 text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="text-center mt-3">
                        <h3 className="font-bold text-lg">{member.firstName} {member.lastName}</h3>
                        <p className="text-primary text-sm font-medium">{roleLabels[member.role] || member.role}</p>
                        {member.parish && (
                          <p className="text-muted-foreground text-sm mt-1">{member.parish}</p>
                        )}
                      </div>
                      <div className="mt-4 space-y-2">
                        <a href={`mailto:${member.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                          <Mail className="h-4 w-4" /> {member.email}
                        </a>
                        {member.phone && (
                          <a href={`tel:${member.phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                            <Phone className="h-4 w-4" /> {member.phone}
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {cellLeaders.length > 0 && selectedRole === "all" && (
            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4">Cell Leaders</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {cellLeaders.map((member) => (
                  <Card key={member.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                        {member.profileImage ? (
                          <img src={member.profileImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="h-6 w-6 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{member.firstName} {member.lastName}</h3>
                        <p className="text-sm text-blue-600">Cell Leader</p>
                        {member.houseCellLocation && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {member.houseCellLocation}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {ministryLeaders.length > 0 && selectedRole === "all" && (
            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4">Ministry Leaders</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {ministryLeaders.map((member) => (
                  <Card key={member.id} className="p-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 overflow-hidden">
                      {member.profileImage ? (
                        <img src={member.profileImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-8 w-8 text-primary" />
                      )}
                    </div>
                    <h3 className="font-semibold">{member.firstName} {member.lastName}</h3>
                    <p className="text-sm text-primary">{roleLabels[member.role] || member.role}</p>
                    {member.career && <p className="text-xs text-muted-foreground mt-1">{member.career}</p>}
                  </Card>
                ))}
              </div>
            </section>
          )}

          {filteredStaff.length === 0 && (
            <Card className="p-8 text-center">
              <User className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No staff members found matching your search.</p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
