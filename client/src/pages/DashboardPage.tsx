import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMyPrayerRequests } from "@/hooks/use-prayer";
import { useUserRsvps } from "@/hooks/use-events";
import { useMyMessages, useUnreadCount, useMarkAsRead, useSendMessage, useReplyToMessage } from "@/hooks/use-messages";
import { usePermissions } from "@/hooks/use-permissions";
import { useAbsentMembers } from "@/hooks/use-attendance";
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
import { formatDistanceToNow, format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";

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
      });
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-3 py-6">
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
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
    <div className="min-h-screen bg-background py-4 sm:py-6">
      <Helmet><title>Dashboard | CHub</title></Helmet>

      <div className="container px-3 sm:px-4 md:px-8 max-w-5xl mx-auto">
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
                <Button type="submit" disabled={isUpdating} className="w-full rounded-2xl gradient-accent text-primary-foreground font-bold shadow-lg">
                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
            <DialogContent className="rounded-3xl glass-card-strong border-border/20">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 font-[--font-display]">
                  {selectedMessage?.priority === 'high' && (<span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">Urgent</span>)}
                  {selectedMessage?.title}
                </DialogTitle>
                <DialogDescription>
                  {selectedMessage && format(new Date(selectedMessage.createdAt), "MMM d, yyyy 'at' h:mm a")}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4"><p className="text-foreground/70 whitespace-pre-wrap">{selectedMessage?.content}</p></div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedMessage(null)} className="rounded-2xl">Close</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
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

          {/* Profile Card */}
          <div className="glass-card-strong rounded-3xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl gradient-accent flex items-center justify-center shadow-lg">
                  <User className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground font-[--font-display]">Profile Information</h3>
                  <p className="text-muted-foreground text-sm">Your account details</p>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { icon: User, label: "Name", value: user.firstName ? `${user.firstName} ${user.lastName || ''}` : "Not set" },
                  { icon: Mail, label: "Email", value: user.email },
                  { icon: Phone, label: "Phone", value: user.phone || "Not set" },
                  { icon: MapPin, label: "Address", value: user.address || "Not set" },
                  { icon: Home, label: "House Fellowship", value: user.houseFellowship || "Not set" },
                  { icon: Home, label: "House Cell Location", value: user.houseCellLocation || "Not set" },
                  { icon: Building, label: "Parish", value: (user as any).parish || "Not set" },
                  { icon: Briefcase, label: "Career", value: (user as any).career || "Not set" },
                  { icon: MapPin, label: "State of Origin", value: (user as any).stateOfOrigin || "Not set" },
                  { icon: Cake, label: "Birthday", value: (user as any).birthday ? new Date((user as any).birthday).toLocaleDateString() : "Not set" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-muted-foreground/50" />
                    <div>
                      <p className="text-sm text-muted-foreground">{label}</p>
                      <p className="font-medium text-foreground">{value}</p>
                    </div>
                  </div>
                ))}
                
                {/* Social Media Handles */}
                {(user as any).twitterHandle && (
                  <div className="flex items-center gap-3">
                    <svg className="h-4 w-4 text-muted-foreground/50" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
                    <div><p className="text-sm text-muted-foreground">Twitter</p><p className="font-medium text-foreground">{(user as any).twitterHandle}</p></div>
                  </div>
                )}
                {(user as any).instagramHandle && (
                  <div className="flex items-center gap-3">
                    <svg className="h-4 w-4 text-muted-foreground/50" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                    <div><p className="text-sm text-muted-foreground">Instagram</p><p className="font-medium text-foreground">{(user as any).instagramHandle}</p></div>
                  </div>
                )}
                {(user as any).facebookHandle && (
                  <div className="flex items-center gap-3">
                    <svg className="h-4 w-4 text-muted-foreground/50" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    <div><p className="text-sm text-muted-foreground">Facebook</p><p className="font-medium text-foreground">{(user as any).facebookHandle}</p></div>
                  </div>
                )}
                {(user as any).linkedinHandle && (
                  <div className="flex items-center gap-3">
                    <svg className="h-4 w-4 text-muted-foreground/50" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                    <div><p className="text-sm text-muted-foreground">LinkedIn</p><p className="font-medium text-foreground">{(user as any).linkedinHandle}</p></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="glass-card-strong rounded-3xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground font-[--font-display]">Account Status</h3>
                  <p className="text-muted-foreground text-sm">Your membership details</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground/50" />
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-medium text-foreground">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Check-in QR Code */}
          <div className="glass-card-strong rounded-3xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <QrCode className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground font-[--font-display]">Check-in QR Code</h3>
                  <p className="text-muted-foreground text-sm">Scan at church services</p>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-2xl shadow-sm">
                  <QRCodeSVG 
                    value={`${window.location.origin}/attendance/checkin?user=${user.id}`}
                    size={160}
                    level="M"
                    includeMargin={true}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Show this QR code at church services for quick check-in
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 gap-2"
                  onClick={() => {
                    const canvas = document.createElement('canvas');
                    const svg = document.querySelector('canvas + svg')?.parentElement?.querySelector('svg') as SVGElement;
                    const svgData = new XMLSerializer().serializeToString(svg || document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
                    const img = new Image();
                    img.onload = () => {
                      canvas.width = 200;
                      canvas.height = 200;
                      const ctx = canvas.getContext('2d');
                      ctx?.drawImage(img, 0, 0);
                      const pngFile = canvas.toDataURL('image/png');
                      const downloadLink = document.createElement('a');
                      downloadLink.download = `checkin-qr-${user.firstName || 'member'}.png`;
                      downloadLink.href = pngFile;
                      downloadLink.click();
                    };
                  }}
                >
                  <Download className="h-4 w-4" />
                  Download QR Code
                </Button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="md:col-span-2 glass-card-strong rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-border/20">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground font-[--font-display]">My Messages</h3>
                {unreadCount?.count ? (<span className="ml-auto bg-destructive text-destructive-foreground text-xs px-2.5 py-0.5 rounded-full font-bold">{unreadCount.count} new</span>) : null}
              </div>
              <p className="text-muted-foreground text-sm mt-1">Updates from your pastors and church leaders</p>
            </div>
            <div className="p-4">
              {isMessagesLoading ? (
                <div className="flex items-center justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
              ) : myMessages && myMessages.length > 0 ? (
                <div className="space-y-3">
                  {myMessages.slice(0, 5).map((message) => (
                    <div key={message.id} className={`p-4 rounded-2xl transition-all ${message.isRead ? 'glass-card' : 'bg-primary/5 border-l-4 border-primary'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => { if (!message.isRead) markAsRead.mutate(message.id); setSelectedMessage(message); setIsReplying(false); setReplyContent(""); }}>
                          <p className="font-bold text-foreground truncate">{message.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">{message.content}</p>
                          <p className="text-xs text-muted-foreground/50 mt-1">{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</p>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          {message.priority === 'high' && (<span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">Urgent</span>)}
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedMessage(message); setIsReplying(true); }}>
                            <Reply className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {selectedMessage?.id === message.id && isReplying && (
                        <div className="mt-3 pt-3 border-t border-border/20" onClick={(e) => e.stopPropagation()}>
                          <Textarea placeholder="Type your reply..." value={replyContent} onChange={(e) => setReplyContent(e.target.value)} rows={2} className="mb-2 rounded-2xl border-border/50 bg-card/50" />
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="outline" onClick={() => { setIsReplying(false); setReplyContent(""); }} className="rounded-xl">Cancel</Button>
                            <Button size="sm" disabled={!replyContent.trim() || replyToMessage.isPending} className="rounded-xl gradient-accent text-primary-foreground"
                              onClick={async () => {
                                try { await replyToMessage.mutateAsync({ messageId: message.id, content: replyContent }); toast({ title: "Reply sent" }); setReplyContent(""); setIsReplying(false); }
                                catch { toast({ title: "Failed to send reply", variant: "destructive" }); }
                              }}>
                              {replyToMessage.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Send className="h-3 w-3 mr-1" /> Send</>}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {myMessages.length > 5 && (
                    <Button variant="outline" className="w-full rounded-2xl" asChild>
                      <Link href="/messages"><span>View All Messages ({myMessages.length})</span></Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground/20" /><p>No messages yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Prayer Requests */}
          <div className="md:col-span-2 glass-card-strong rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-border/20">
              <div className="flex items-center gap-2"><Heart className="h-5 w-5 text-primary" /><h3 className="text-lg font-bold font-[--font-display]">My Prayer Requests</h3></div>
              <p className="text-muted-foreground text-sm mt-1">Your prayer requests and how many are praying</p>
            </div>
            <div className="p-4">
              {isPrayersLoading ? (
                <div className="flex items-center justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
              ) : myPrayers && myPrayers.length > 0 ? (
                <div className="space-y-3">
                  {myPrayers.slice(0, 5).map((prayer) => (
                    <div key={prayer.id} className="flex items-center justify-between p-4 glass-card rounded-2xl">
                      <div className="flex-1 min-w-0"><p className="font-bold text-foreground truncate">{prayer.content}</p><p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(prayer.createdAt), { addSuffix: true })}</p></div>
                      <div className="flex items-center gap-1 ml-4 text-primary"><Heart className="h-4 w-4 fill-current" /><span className="font-bold">{prayer.prayCount || 0}</span></div>
                    </div>
                  ))}
                  {myPrayers.length > 5 && (<Button variant="outline" className="w-full rounded-2xl" asChild><Link href="/prayer"><span>View All ({myPrayers.length})</span></Link></Button>)}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground"><p>You haven't submitted any prayer requests yet.</p><Button variant="ghost" asChild className="mt-2"><Link href="/prayer">Share a Prayer Request</Link></Button></div>
              )}
            </div>
          </div>

          {/* Events */}
          <div className="md:col-span-2 glass-card-strong rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-border/20">
              <div className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /><h3 className="text-lg font-bold font-[--font-display]">My Interested Events</h3></div>
              <p className="text-muted-foreground text-sm mt-1">Events you've RSVP'd to</p>
            </div>
            <div className="p-4">
              {isRsvpsLoading ? (
                <div className="flex items-center justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
              ) : userRsvps && userRsvps.length > 0 ? (
                <div className="space-y-3">
                  {userRsvps.slice(0, 5).map((rsvp: any) => (
                    rsvp.event && (
                      <Link key={rsvp.id} href={`/events/${rsvp.event.id}`}>
                        <div className="flex items-center justify-between p-4 glass-card rounded-2xl hover:shadow-md transition-all cursor-pointer">
                          <div className="flex-1 min-w-0"><p className="font-bold text-foreground truncate">{rsvp.event.title}</p><p className="text-xs text-muted-foreground">{format(new Date(rsvp.event.date), "MMM d, yyyy 'at' h:mm a")}</p></div>
                          {rsvp.addedToCalendar && (<span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">Added to Calendar</span>)}
                        </div>
                      </Link>
                    )
                  ))}
                  {userRsvps.length > 5 && (<Button variant="outline" className="w-full rounded-2xl" asChild><Link href="/events"><span>View All Events</span></Link></Button>)}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground"><p>You haven't RSVP'd to any events yet.</p><Button variant="ghost" asChild className="mt-2"><Link href="/events">Browse Events</Link></Button></div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="md:col-span-2 glass-card-strong rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-border/20"><h3 className="text-lg font-bold font-[--font-display]">Quick Actions</h3><p className="text-muted-foreground text-sm mt-1">Common tasks and links</p></div>
            <div className="p-6 flex flex-wrap gap-4">
              {[
                { href: "/prayer", label: "Submit Prayer Request" },
                { href: "/events", label: "View Events" },
                { href: "/sermons", label: "Watch Sermons" },
                { href: "/give", label: "Give" },
              ].map(({ href, label }) => (
                <Button key={href} variant="outline" asChild className="rounded-2xl border-border/50 hover:bg-muted/50">
                  <Link href={href}>{label}</Link>
                </Button>
              ))}
            </div>
          </div>

          {/* Absent Members */}
          {canViewAbsentMembers() && (
            <div className="md:col-span-2 glass-card rounded-3xl overflow-hidden shimmer-border">
              <div className="p-6 border-b border-border/20">
                <div className="flex items-center gap-2">
                  <UserX className="h-5 w-5 text-accent" />
                  <h3 className="text-lg font-bold font-[--font-display]">Members Needing Follow-up</h3>
                  {absentMembers && absentMembers.length > 0 && (<span className="ml-auto text-sm font-medium text-accent">{absentMembers.length} absent</span>)}
                </div>
                <p className="text-muted-foreground text-sm mt-1">Members who have missed recent services - reach out to them!</p>
              </div>
              <div className="p-4">
                {isAbsentLoading ? (
                  <div className="flex items-center justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
                ) : absentError ? (
                  <div className="text-center py-4 text-destructive"><p>Failed to load absent members</p><p className="text-xs text-muted-foreground">{(absentError as Error).message}</p></div>
                ) : absentMembers && absentMembers.length > 0 ? (
                  <div className="space-y-3">
                    {absentMembers.slice(0, 5).map((member) => (
                      <div key={member.userId} className="flex items-center justify-between p-4 glass-card rounded-2xl">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-2xl bg-accent/10"><UserX className="h-4 w-4 text-accent" /></div>
                          <div><p className="font-bold text-foreground">{member.firstName || "Member"} {member.lastName || ""}</p><p className="text-xs text-muted-foreground">Missed {member.missedCount} services</p></div>
                        </div>
                        {canFollowUpAbsent() && canSendMessages() && (
                          <Button size="sm" variant="outline" className="rounded-2xl border-border/50"
                            onClick={async () => {
                              try {
                                await sendMessage.mutateAsync({ userId: member.userId, type: 'GENERAL', title: 'We Miss You!', content: `Dear ${member.firstName || 'Brother/Sister'},\n\nWe noticed you haven't been with us for the past ${member.missedCount} services. We truly miss seeing you!\n\nPlease know that you are always welcome.\n\nGrace and Peace,\nCHub`, priority: 'normal' });
                                toast({ title: "Message sent! ✅", description: `${member.firstName || 'Member'} will be removed from the absent list for 7 days.` });
                              } catch (err: any) { toast({ title: "Failed to send message", description: err?.message, variant: "destructive" }); }
                            }}>
                            <Send className="h-3 w-3 mr-1" /> Reach Out
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" className="w-full rounded-2xl" asChild><Link href="/absent-members"><span>View All Absent Members</span></Link></Button>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground"><p>No members currently flagged as absent. 🎉</p></div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
