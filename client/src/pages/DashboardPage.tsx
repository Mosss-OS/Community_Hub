import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMyPrayerRequests } from "@/hooks/use-prayer";
import { useUserRsvps } from "@/hooks/use-events";
import { useMyMessages, useUnreadCount, useMarkAsRead, useSendMessage, useReplyToMessage } from "@/hooks/use-messages";
import { usePermissions } from "@/hooks/use-permissions";
import { useAbsentMembers } from "@/hooks/use-attendance";
import { useWatchHistory, useClearWatchHistory } from "@/hooks/use-watch-history";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { buildApiUrl } from "@/lib/api-config";
import { User, Mail, Calendar, Shield, Heart, Loader2, Phone, MapPin, Home, Building, Edit, MessageSquare, Bell, Check, Users, UserX, Send, Reply, Briefcase, Cake, AlertCircle, Play, Trash2, QrCode, Download } from "lucide-react";
import { Link } from "wouter";
import { DashboardWidgets } from "@/components/DashboardWidgets";
import { formatDistanceToNow, format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import { MemberEngagementScore } from "@/components/MemberEngagementScore";
import { BirthdayMessageScheduler } from "@/components/BirthdayMessageScheduler";
import { BibleVerseWidget } from "@/components/BibleVerseWidget";
import { InterestTags } from "@/components/InterestTags";
import { ProfileFrame } from "@/components/ProfileFrame";
import { PrayerFocusVisual } from "@/components/PrayerFocusVisual";
import { AudioPodcastFeed } from "@/components/AudioPodcastFeed";
import { MobileWidgetCustomization } from "@/components/MobileWidgetCustomization";
import { MemberDirectoryFilters } from "@/components/MemberDirectoryFilters";
import { VirtualGroupRooms } from "@/components/VirtualGroupRooms";
import { GivingCampaignCards } from "@/components/GivingCampaignCards";

function calculateProfileCompleteness(user: any) {
  const filledFields = PROFILE_FIELDS.filter(field => {
    const value = (user as any)[field.key];
    return value && value.toString().trim() !== '';
  }).length;
  return Math.round((filledFields / PROFILE_FIELDS.length) * 100);
}

export default function DashboardPage() {
  const { user, isLoading, refetch } = useAuth();
  const { data: myPrayers, isLoading: isPrayersLoading } = useMyPrayerRequests();
  const { data: userRsvps, isLoading: isRsvpsLoading } = useUserRsvps();
  const { data: myMessages, isLoading: isMessagesLoading } = useMyMessages();
  const { data: unreadCount } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const sendMessage = useSendMessage();
  const replyToMessage = useReplyToMessage();
  const { canViewAbsentMembers, canFollowUpAbsent, canSendMessages } = usePermissions();
  const { data: absentMembers, isLoading: isAbsentLoading, error: absentError } = useAbsentMembers(3);
  const { data: watchHistory, isLoading: isWatchHistoryLoading } = useWatchHistory();
  const clearWatchHistory = useClearWatchHistory();
  const { toast } = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [showAbsentActions, setShowAbsentActions] = useState<string | null>(null);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "", lastName: user?.lastName || "",
    phone: user?.phone || "", address: user?.address || "",
    houseFellowship: user?.houseFellowship || "", parish: (user as any)?.parish || "",
    houseCellLocation: user?.houseCellLocation || "", career: (user as any)?.career || "",
    stateOfOrigin: (user as any)?.stateOfOrigin || "",
    birthday: (user as any)?.birthday ? new Date((user as any).birthday).toISOString().split('T')[0] : "",
    twitterHandle: (user as any)?.twitterHandle || "", instagramHandle: (user as any)?.instagramHandle || "",
    facebookHandle: (user as any)?.facebookHandle || "", linkedinHandle: (user as any)?.linkedinHandle || "",
    profileVisibility: (user as any)?.profileVisibility || "members",
    showInDirectory: (user as any)?.showInDirectory !== false,
    showPhone: (user as any)?.showPhone !== false,
    showBirthday: (user as any)?.showBirthday !== false,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "", lastName: user.lastName || "",
        phone: user.phone || "", address: user.address || "",
        houseFellowship: user.houseFellowship || "", parish: (user as any)?.parish || "",
        houseCellLocation: user.houseCellLocation || "", career: (user as any)?.career || "",
        stateOfOrigin: (user as any)?.stateOfOrigin || "",
        birthday: (user as any)?.birthday ? new Date((user as any).birthday).toISOString().split('T')[0] : "",
        twitterHandle: (user as any)?.twitterHandle || "", instagramHandle: (user as any)?.instagramHandle || "",
        facebookHandle: (user as any)?.facebookHandle || "", linkedinHandle: (user as any)?.linkedinHandle || "",
        profileVisibility: (user as any)?.profileVisibility || "members",
        showInDirectory: (user as any)?.showInDirectory !== false,
        showPhone: (user as any)?.showPhone !== false,
        showBirthday: (user as any)?.showBirthday !== false,
      });
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-3 py-6">
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-3 py-6">
        <div className="glass-card-strong rounded-3xl max-w-md mx-auto p-8 text-center">
          <h2 className="text-xl font-bold font-[--font-display] mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">Please log in to view your dashboard.</p>
          <Button asChild className="rounded-2xl gradient-accent text-primary-foreground font-bold shadow-lg">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Dashboard | Watchman Lekki</title></Helmet>

      <div className="min-h-screen bg-background py-4 sm:py-6">
        <div className="container px-3 sm:px-4 md:px-8 max-w-[70%] mx-auto">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h1 className="text-lg sm:text-xl md:text-3xl font-[--font-display] font-bold text-foreground mb-0.5 sm:mb-1 md:mb-2">My Dashboard</h1>
              <p className="text-muted-foreground text-xs sm:text-sm">Welcome back, {user.firstName || user.email}!</p>
            </div>
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gradient-accent text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/20">
                  <Edit className="mr-1.5 h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Edit Profile</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl glass-card-strong border-border/20">
                <DialogHeader>
                  <DialogTitle className="font-[--font-display]">Edit Profile</DialogTitle>
                  <DialogDescription>Update your personal information</DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setIsUpdating(true);
                    try {
                      const res = await fetch(buildApiUrl("/api/members/me"), { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(formData) });
                      if (res.ok) { await refetch(); setIsEditOpen(false); toast({ title: "Profile updated successfully" }); }
                      else { toast({ title: "Failed to update profile", variant: "destructive" }); }
                    } catch { toast({ title: "Error updating profile", variant: "destructive" }); }
                    finally { setIsUpdating(false); }
                  }}
                  className="space-y-4 max-h-[60vh] overflow-y-auto pr-2"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label htmlFor="firstName">First Name</Label><Input id="firstName" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="rounded-2xl border-border/50 bg-card/50" /></div>
                    <div><Label htmlFor="lastName">Last Name</Label><Input id="lastName" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="rounded-2xl border-border/50 bg-card/50" /></div>
                  </div>
                  <div><Label htmlFor="phone">Phone Number</Label><Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Enter your phone number" className="rounded-2xl border-border/50 bg-card/50" /></div>
                  <div><Label htmlFor="address">Address</Label><Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Enter your address" className="rounded-2xl border-border/50 bg-card/50" /></div>
                  <div><Label htmlFor="parish">Parish</Label><Input id="parish" value={formData.parish} onChange={(e) => setFormData({ ...formData, parish: e.target.value })} placeholder="Enter your parish" className="rounded-2xl border-border/50 bg-card/50" /></div>
                  <div><Label htmlFor="houseFellowship">House Fellowship</Label><Input id="houseFellowship" value={formData.houseFellowship} onChange={(e) => setFormData({ ...formData, houseFellowship: e.target.value })} placeholder="Enter your house fellowship" className="rounded-2xl border-border/50 bg-card/50" /></div>
                  <div><Label htmlFor="houseCellLocation">House Cell Location</Label><Input id="houseCellLocation" value={formData.houseCellLocation} onChange={(e) => setFormData({ ...formData, houseCellLocation: e.target.value })} placeholder="Enter your house cell location" className="rounded-2xl border-border/50 bg-card/50" /></div>
                  <div><Label htmlFor="career">Career / Profession</Label><Input id="career" value={formData.career} onChange={(e) => setFormData({ ...formData, career: e.target.value })} placeholder="e.g., Software Engineer, Teacher" className="rounded-2xl border-border/50 bg-card/50" /></div>
                  <div><Label htmlFor="stateOfOrigin">State of Origin</Label><Input id="stateOfOrigin" value={formData.stateOfOrigin} onChange={(e) => setFormData({ ...formData, stateOfOrigin: e.target.value })} placeholder="Enter your state of origin" className="rounded-2xl border-border/50 bg-card/50" /></div>
                  <div><Label htmlFor="birthday">Birthday</Label><Input id="birthday" type="date" value={formData.birthday} onChange={(e) => setFormData({ ...formData, birthday: e.target.value })} className="rounded-2xl border-border/50 bg-card/50" /></div>
                  <div className="border-t border-border/20 pt-4"><Label className="text-sm font-medium mb-2 block">Social Media Handles</Label></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label htmlFor="twitterHandle">Twitter</Label><Input id="twitterHandle" value={formData.twitterHandle} onChange={(e) => setFormData({ ...formData, twitterHandle: e.target.value })} placeholder="@username" className="rounded-2xl border-border/50 bg-card/50" /></div>
                    <div><Label htmlFor="instagramHandle">Instagram</Label><Input id="instagramHandle" value={formData.instagramHandle} onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })} placeholder="@username" className="rounded-2xl border-border/50 bg-card/50" /></div>
                    <div><Label htmlFor="facebookHandle">Facebook</Label><Input id="facebookHandle" value={formData.facebookHandle} onChange={(e) => setFormData({ ...formData, facebookHandle: e.target.value })} placeholder="Facebook profile" className="rounded-2xl border-border/50 bg-card/50" /></div>
                    <div><Label htmlFor="linkedinHandle">LinkedIn</Label><Input id="linkedinHandle" value={formData.linkedinHandle} onChange={(e) => setFormData({ ...formData, linkedinHandle: e.target.value })} placeholder="LinkedIn profile" className="rounded-2xl border-border/50 bg-card/50" /></div>
                  </div>
                  <div className="border-t border-border/20 pt-4 space-y-3">
                    <Label className="text-sm font-medium">Privacy Settings</Label>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Show in Directory</p>
                        <p className="text-xs text-muted-foreground">Appear in member directory</p>
                      </div>
                      <input type="checkbox" checked={formData.showInDirectory ?? true} onChange={(e) => setFormData({ ...formData, showInDirectory: e.target.checked })} className="h-4 w-4 rounded border-border/50" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Profile Visibility</p>
                        <p className="text-xs text-muted-foreground">Who can see your profile</p>
                      </div>
                      <select value={formData.profileVisibility ?? 'members'} onChange={(e) => setFormData({ ...formData, profileVisibility: e.target.value })} className="rounded-xl border border-border/50 bg-card/50 px-3 py-1.5 text-sm">
                        <option value="everyone">Everyone</option>
                        <option value="members">Members Only</option>
                        <option value="nobody">Nobody</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Show Phone Number</p>
                        <p className="text-xs text-muted-foreground">Display phone in profile</p>
                      </div>
                      <input type="checkbox" checked={formData.showPhone ?? true} onChange={(e) => setFormData({ ...formData, showPhone: e.target.checked })} className="h-4 w-4 rounded border-border/50" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Show Birthday</p>
                        <p className="text-xs text-muted-foreground">Display birthday in profile</p>
                      </div>
                      <input type="checkbox" checked={formData.showBirthday ?? true} onChange={(e) => setFormData({ ...formData, showBirthday: e.target.checked })} className="h-4 w-4 rounded border-border/50" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={isUpdating}>{isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Save Changes</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <AnnouncementBanner />

          <DashboardWidgets />

          <MemberEngagementScore />

          <BibleVerseWidget />

          <InterestTags />

          <ProfileFrame userId={user?.id} profile={user || undefined} />

          <ContactExport />

          <InteractiveMap />

          <SermonCertificate userId={user?.id} />

          <MemberMilestones />

          <PrayerFocusVisual />

          <AudioPodcastFeed />

          <MobileWidgetCustomization />

          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <BirthdayMessageScheduler />
            {/* Profile Completeness */}
            {(() => {
              const completeness = calculateProfileCompleteness(user);
              const missingFields = PROFILE_FIELDS.filter(field => {
                const value = (user as any)[field.key];
                return !value || value.toString().trim() === '';
              });
              return (
                <div className="md:col-span-2 glass-card-strong rounded-3xl overflow-hidden border-l-4 border-l-amber-500">
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-foreground font-[--font-display]">Profile Completeness</h3>
                        <p className="text-sm text-muted-foreground">{completeness}% complete</p>
                      </div>
                      <span className="text-2xl font-bold text-amber-500">{completeness}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 mb-4">
                      <div className="bg-gradient-to-r from-amber-400 to-amber-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${completeness}%` }} />
                    </div>
                    {missingFields.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground mb-2 font-medium">Missing information:</p>
                        <div className="flex flex-wrap gap-2">
                          {missingFields.map(field => (
                            <span key={field.key} className="text-xs bg-muted px-2.5 py-1 rounded-full text-muted-foreground">{field.label}</span>
                          ))}
                        </div>
                        <Button size="sm" className="mt-3 rounded-2xl bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border border-amber-500/20" onClick={() => setIsEditOpen(true)}>
                          <Edit className="mr-1.5 h-3 w-3" /> Complete Your Profile
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Quick Actions */}
            <div className="space-y-4">
              <Card className="glass-card-strong rounded-3xl overflow-hidden border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Check out the events page for upcoming gatherings.</p>
                  <Button asChild className="mt-4 w-full rounded-2xl" variant="outline">
                    <Link href="/events">View All Events</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass-card-strong rounded-3xl overflow-hidden border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessageSquare className="h-5 w-5 text-green-600" />
                    Messages
                    {unreadCount ? <Badge className="ml-2 bg-green-500">{unreadCount}</Badge> : null}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">You have {unreadCount || 0} unread messages.</p>
                  <Button asChild className="mt-4 w-full rounded-2xl" variant="outline">
                    <Link href="/messages">View Messages</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const PROFILE_FIELDS = [
  { key: 'phone', label: 'Phone Number' },
  { key: 'address', label: 'Address' },
  { key: 'parish', label: 'Parish' },
  { key: 'houseFellowship', label: 'House Fellowship' },
  { key: 'houseCellLocation', label: 'House Cell Location' },
  { key: 'career', label: 'Career' },
  { key: 'stateOfOrigin', label: 'State of Origin' },
  { key: 'birthday', label: 'Birthday' },
];
