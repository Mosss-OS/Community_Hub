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
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, MapPin, Users, Plus, CheckCircle, Star, Award } from "lucide-react";
import { VolunteerCalendar } from "@/components/VolunteerCalendar";
import { format, parseISO, isAfter } from "date-fns";

interface VolunteerOpportunity {
  id: number; title: string; description: string | null; requiredSkills: number[];
  date: string; duration: number | null; location: string | null;
  spotsAvailable: number | null; spotsFilled: number; createdBy: string | null;
  createdAt: string; isActive: boolean;
}

interface VolunteerAssignment {
  id: number; volunteerId: string; opportunityId: number; status: string;
  checkInAt: string | null; checkOutAt: string | null; hoursWorked: number;
}

async function fetchOpportunities(): Promise<VolunteerOpportunity[]> {
  const response = await fetch(buildApiUrl("/api/volunteer/opportunities"));
  if (!response.ok) throw new Error("Failed to fetch opportunities");
  return response.json();
}

async function fetchMyAssignments(): Promise<VolunteerAssignment[]> {
  const response = await fetch(buildApiUrl("/api/volunteer/assignments"));
  if (!response.ok) throw new Error("Failed to fetch assignments");
  return response.json();
}

async function fetchSkills() {
  const response = await fetch(buildApiUrl("/api/volunteer/skills"));
  if (!response.ok) throw new Error("Failed to fetch skills");
  return response.json();
}

async function createOpportunity(data: Partial<VolunteerOpportunity>) {
  const response = await fetch(buildApiUrl("/api/volunteer/opportunities"), {
    method: "POST", headers: { "Content-Type": "application/json" },
    credentials: "include", body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create opportunity");
  return response.json();
}

async function signUp(opportunityId: number) {
  const response = await fetch(buildApiUrl("/api/volunteer/assignments"), {
    method: "POST", headers: { "Content-Type": "application/json" },
    credentials: "include", body: JSON.stringify({ opportunityId }),
  });
  if (!response.ok) throw new Error("Failed to sign up");
  return response.json();
}

export default function VolunteerPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newOpportunity, setNewOpportunity] = useState({ title: "", description: "", date: "", duration: 60, location: "", spotsAvailable: 5 });
  const [signingUpId, setSigningUpId] = useState<number | null>(null);

  const { data: opportunities, isLoading } = useQuery({ queryKey: ["volunteer-opportunities"], queryFn: fetchOpportunities });
  const { data: assignments } = useQuery({ queryKey: ["volunteer-assignments"], queryFn: fetchMyAssignments, enabled: !!user });

  const createMutation = useMutation({
    mutationFn: createOpportunity,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["volunteer-opportunities"] }); setShowCreateDialog(false); setNewOpportunity({ title: "", description: "", date: "", duration: 60, location: "", spotsAvailable: 5 }); toast({ title: "Success", description: "Opportunity created successfully!" }); },
    onError: () => { toast({ title: "Error", description: "Failed to create opportunity", variant: "destructive" }); },
  });

  const signUpMutation = useMutation({
    mutationFn: async (opportunityId: number) => { setSigningUpId(opportunityId); return signUp(opportunityId); },
    onSuccess: () => { setSigningUpId(null); queryClient.invalidateQueries({ queryKey: ["volunteer-assignments"] }); toast({ title: "Success", description: "You've signed up to volunteer!" }); },
    onError: () => { setSigningUpId(null); toast({ title: "Error", description: "Failed to sign up", variant: "destructive" }); },
  });

  const isAdmin = user?.isAdmin;
  const activeOpportunities = opportunities?.filter(o => o.isActive && isAfter(parseISO(o.date), new Date())) || [];
  const myOpportunityIds = assignments?.map(a => a.opportunityId) || [];

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-10">
        <div className="animate-pulse space-y-5">
          <div className="h-10 bg-muted rounded-2xl w-1/3"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => <div key={i} className="h-72 bg-muted rounded-3xl"></div>)}
          </div>
        </div>
      </div>
    );
  }

  if (activeOpportunities.length === 0 && !isAdmin) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="text-center py-16">
          <Users className="w-20 h-20 mx-auto text-muted-foreground/15 mb-5" />
          <h2 className="text-3xl font-bold text-foreground/50 mb-3 font-[--font-display]">No Volunteer Opportunities</h2>
          <p className="text-muted-foreground text-lg">Check back later for volunteer opportunities in our community.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Hero */}
      <div className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="orb orb-blue w-72 h-72 top-0 right-0 animate-float" />
        <div className="orb orb-gold w-48 h-48 bottom-10 left-20" style={{ animationDelay: '2s' }} />
        <div className="container px-6 md:px-8 relative z-10">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-accent font-bold text-sm uppercase tracking-wider mb-3 block">Serve Together</span>
              <h1 className="text-3xl md:text-5xl font-bold text-white font-[--font-display] tracking-tight mb-3">Volunteer</h1>
              <p className="text-white/40 text-lg">Serve our community and grow in faith together</p>
            </div>
            {isAdmin && (
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="gradient-accent text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all">
                    <Plus className="w-4 h-4 mr-2" /> Create Opportunity
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl glass-card-strong border-border/20">
                  <DialogHeader>
                    <DialogTitle className="font-[--font-display]">Create Volunteer Opportunity</DialogTitle>
                    <DialogDescription>Create a new volunteer opportunity for the community</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div><Label>Title</Label><Input value={newOpportunity.title} onChange={e => setNewOpportunity({ ...newOpportunity, title: e.target.value })} placeholder="e.g., Welcome Team Volunteer" className="rounded-2xl mt-1.5 border-border/50 bg-card/50" /></div>
                    <div><Label>Description</Label><Textarea value={newOpportunity.description} onChange={e => setNewOpportunity({ ...newOpportunity, description: e.target.value })} placeholder="Describe the volunteer role..." rows={3} className="rounded-2xl mt-1.5 border-border/50 bg-card/50" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label>Date & Time</Label><Input type="datetime-local" value={newOpportunity.date} onChange={e => setNewOpportunity({ ...newOpportunity, date: e.target.value })} className="rounded-2xl mt-1.5 border-border/50 bg-card/50" /></div>
                      <div><Label>Duration (minutes)</Label><Input type="number" value={newOpportunity.duration} onChange={e => setNewOpportunity({ ...newOpportunity, duration: parseInt(e.target.value) })} className="rounded-2xl mt-1.5 border-border/50 bg-card/50" /></div>
                    </div>
                    <div><Label>Location</Label><Input value={newOpportunity.location} onChange={e => setNewOpportunity({ ...newOpportunity, location: e.target.value })} placeholder="e.g., Main Sanctuary" className="rounded-2xl mt-1.5 border-border/50 bg-card/50" /></div>
                    <div><Label>Available Spots</Label><Input type="number" value={newOpportunity.spotsAvailable} onChange={e => setNewOpportunity({ ...newOpportunity, spotsAvailable: parseInt(e.target.value) })} className="rounded-2xl mt-1.5 border-border/50 bg-card/50" /></div>
                    <Button onClick={() => createMutation.mutate({ ...newOpportunity, date: new Date(newOpportunity.date).toISOString() })} disabled={createMutation.isPending || !newOpportunity.title || !newOpportunity.date} className="w-full rounded-2xl font-bold gradient-accent text-primary-foreground shadow-lg">
                      {createMutation.isPending ? "Creating..." : "Create Opportunity"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10 md:py-14">
        {/* Assignments */}
        {assignments && assignments.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-5 flex items-center font-[--font-display]">
              <CheckCircle className="w-6 h-6 mr-2.5 text-primary" /> My Assignments
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {assignments.map(assignment => {
                const opp = opportunities?.find(o => o.id === assignment.opportunityId);
                if (!opp) return null;
                return (
                  <div key={assignment.id} className="glass-card-strong rounded-3xl overflow-hidden border-l-4 border-l-primary">
                    <div className="p-6">
                      <h3 className="text-lg font-bold font-[--font-display] mb-2">{opp.title}</h3>
                      <Badge variant={assignment.status === "confirmed" ? "default" : "secondary"} className="mb-3">{assignment.status}</Badge>
                      <div className="space-y-2.5 text-sm">
                        <div className="flex items-center text-muted-foreground"><Calendar className="w-4 h-4 mr-2.5 text-primary/50" />{format(parseISO(opp.date), "MMM d, yyyy 'at' h:mm a")}</div>
                        {opp.location && <div className="flex items-center text-muted-foreground"><MapPin className="w-4 h-4 mr-2.5 text-primary/50" />{opp.location}</div>}
                        {assignment.hoursWorked > 0 && <div className="flex items-center text-muted-foreground"><Clock className="w-4 h-4 mr-2.5 text-primary/50" />{assignment.hoursWorked} hours logged</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Opportunities */}
        <div>
          <h2 className="text-2xl font-bold mb-5 flex items-center font-[--font-display]">
            <Users className="w-6 h-6 mr-2.5 text-accent" /> Available Opportunities
          </h2>
          {activeOpportunities.length === 0 ? (
            <div className="glass-card rounded-3xl p-10 text-center"><p className="text-muted-foreground">No volunteer opportunities available at the moment.</p></div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeOpportunities.map(opportunity => {
                const spotsLeft = opportunity.spotsAvailable ? opportunity.spotsAvailable - opportunity.spotsFilled : null;
                const isSignedUp = myOpportunityIds.includes(opportunity.id);
                return (
                  <div key={opportunity.id} className={`glass-card-strong rounded-3xl hover:shadow-2xl transition-all hover:-translate-y-1 ${isSignedUp ? "shimmer-border" : ""}`}>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-bold font-[--font-display]">{opportunity.title}</h3>
                        {spotsLeft !== null && (
                          <Badge variant={spotsLeft > 0 ? "default" : "destructive"} className="shrink-0">{spotsLeft} spots left</Badge>
                        )}
                      </div>
                      {opportunity.description && <p className="text-sm text-muted-foreground mb-4">{opportunity.description}</p>}
                      <div className="space-y-2.5 text-sm mb-5">
                        <div className="flex items-center text-muted-foreground"><Calendar className="w-4 h-4 mr-2.5 text-primary/50" />{format(parseISO(opportunity.date), "EEEE, MMM d 'at' h:mm a")}</div>
                        {opportunity.duration && <div className="flex items-center text-muted-foreground"><Clock className="w-4 h-4 mr-2.5 text-primary/50" />{opportunity.duration} minutes</div>}
                        {opportunity.location && <div className="flex items-center text-muted-foreground"><MapPin className="w-4 h-4 mr-2.5 text-primary/50" />{opportunity.location}</div>}
                        <div className="flex items-center text-muted-foreground"><Users className="w-4 h-4 mr-2.5 text-primary/50" />{opportunity.spotsFilled} / {opportunity.spotsAvailable || "∞"} volunteers</div>
                      </div>
                      {user ? (
                        isSignedUp ? (
                          <Button disabled className="w-full bg-primary/15 text-primary rounded-2xl font-bold"><CheckCircle className="w-4 h-4 mr-2" /> Signed Up</Button>
                        ) : spotsLeft !== null && spotsLeft <= 0 ? (
                          <Button disabled className="w-full rounded-2xl font-bold">No Spots Available</Button>
                        ) : (
                          <Button onClick={() => signUpMutation.mutate(opportunity.id)} disabled={signingUpId !== null} className="w-full rounded-2xl font-bold gradient-accent text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all">
                            {signingUpId === opportunity.id ? "Signing up..." : "Sign Up to Volunteer"}
                          </Button>
                        )
                      ) : (
                        <Button asChild className="w-full rounded-2xl font-bold gradient-accent text-primary-foreground"><a href="/login">Login to Volunteer</a></Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Stats */}
        {user && assignments && assignments.length > 0 && (
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { title: "Total Assignments", value: assignments.length, icon: Award },
              { title: "Hours Served", value: assignments.reduce((acc, a) => acc + a.hoursWorked, 0), icon: Clock },
              { title: "Status", value: assignments.some(a => a.status === "confirmed") ? "Active" : "Pending", icon: Star },
            ].map(({ title, value, icon: Icon }) => (
              <div key={title} className="glass-card-strong rounded-3xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-muted-foreground">{title}</span>
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <div className="text-3xl font-bold font-[--font-display] capitalize">{value}</div>
              </div>
            ))}
          </div>
        )}

        <VolunteerCalendar userId={user?.id} />
      </div>
    </div>
  );
}
