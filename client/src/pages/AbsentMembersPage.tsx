import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { useAbsentMembers, type AbsentMember } from "@/hooks/use-attendance";
import { useSendMessage } from "@/hooks/use-messages";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LuUsers, LuUserX, LuMail, LuCalendar, LuAlertTriangle, LuLoader2, LuRefreshCw, LuMessageSquare, LuPhone, LuSend, LuCheck } from 'react-icons/lu';
import { useToast } from "@/components/ui/use-toast";

export default function AbsentMembersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { canViewAbsentMembers, canFollowUpAbsent, canSendMessages } = usePermissions();
  const [consecutiveMissed, setConsecutiveMissed] = useState(3);
  const { data: absentMembers, isLoading, error, refetch } = useAbsentMembers(consecutiveMissed);
  const { toast } = useToast();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!canViewAbsentMembers()) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              You don&apos;t have permission to view this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Absence Detection</h1>
          <p className="text-muted-foreground mt-1">
            Members who have missed recent services
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Detection Settings</CardTitle>
          <CardDescription>
            Configure how many consecutive missed services trigger an alert
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Consecutive missed services:</label>
            <Input
              type="number"
              min={1}
              max={12}
              value={consecutiveMissed}
              onChange={(e) => setConsecutiveMissed(parseInt(e.target.value) || 3)}
              className="w-20"
            />
            <span className="text-sm text-muted-foreground">
              (1-12 weeks)
            </span>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-destructive">Failed to load absent members</p>
            <Button variant="outline" onClick={() => refetch()} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : absentMembers && absentMembers.length > 0 ? (
        <>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <span className="text-lg font-medium">
              {absentMembers.length} member{absentMembers.length !== 1 ? "s" : ""} flagged for follow-up
            </span>
          </div>
          
          <div className="space-y-4">
            {absentMembers.map((member) => (
              <AbsentMemberCard key={member.userId} member={member} />
            ))}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Users className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">All Members Active!</h3>
            <p className="text-muted-foreground">
              No members have been flagged for absence in this period.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AbsentMemberCard({ member }: { member: AbsentMember }) {
  const [showActions, setShowActions] = useState(false);
  const [sending, setSending] = useState(false);
  const { canFollowUpAbsent, canSendMessages } = usePermissions();
  const sendMessage = useSendMessage();
  const { toast } = useToast();

  const handleSendMessage = async (messageType: 'REMINDER' | 'CONCERN' | 'PASTORAL') => {
    if (!canSendMessages()) {
      toast({ title: "Permission denied", description: "You don't have permission to send messages", variant: "destructive" });
      return;
    }

    setSending(true);
    try {
      const templates = {
        REMINDER: {
          title: "We Miss You!",
          content: `Dear ${member.firstName || "Brother/Sister"},\n\nWe noticed you haven't been with us for the past ${member.missedCount} services. We truly miss seeing you!\n\nPlease know that you are always welcome. Let us know if there's anything we can do to support you.\n\nLooking forward to seeing you soon!\n\nGrace and Peace,\nCHub`
        },
        CONCERN: {
          title: "Pastoral Care Follow-up",
          content: `Dear ${member.firstName || "Brother/Sister"},\n\nWe have noticed your absence from our recent services and wanted to check in with you.\n\nWe care about your wellbeing and would love to hear from you. Please feel free to reach out if there's anything we can pray about or help with.\n\nGod Bless,\nCHub Pastoral Team`
        },
        PASTORAL: {
          title: "Pastoral Visit Request",
          content: `Dear ${member.firstName || "Brother/Sister"},\n\nOur pastoral team would like to schedule a visit with you. We believe in the power of fellowship and would love to come alongside you.\n\nPlease let us know a convenient time.\n\nGod Bless,\nPastor & Church Leadership`
        }
      };

      const template = templates[messageType];

      await sendMessage.mutateAsync({
        userId: member.userId,
        type: messageType === 'REMINDER' ? 'GENERAL' : messageType === 'CONCERN' ? 'PASTORAL' : 'PASTORAL',
        title: template.title,
        content: template.content,
        priority: messageType === 'PASTORAL' ? 'high' : 'normal'
      });

      toast({ title: "Message sent", description: `Message sent to ${member.firstName || member.email}` });
      setShowActions(false);
    } catch (err) {
      toast({ title: "Failed to send message", description: "Please try again", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-amber-100">
              <UserX className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-medium">
                {member.firstName || "Member"} {member.lastName || ""}
              </h3>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {member.email}
                </span>
                {member.lastAttendance && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Last attended: {new Date(member.lastAttendance).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
                  Missed {member.missedCount} service{member.missedCount !== 1 ? "s" : ""}
                </Badge>
                {member.phone && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <Phone className="h-3 w-3 mr-1" />
                    Has phone
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowActions(!showActions)}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {showActions && canFollowUpAbsent() && (
          <div className="mt-4 pt-4 border-t border-amber-200">
            <p className="text-sm font-medium mb-3">Send a message:</p>
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                variant="outline"
                disabled={sending || !canSendMessages()}
                onClick={() => handleSendMessage('REMINDER')}
              >
                <Send className="h-3 w-3 mr-1" />
                We Miss You
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                disabled={sending || !canSendMessages()}
                onClick={() => handleSendMessage('CONCERN')}
              >
                <Mail className="h-3 w-3 mr-1" />
                Check In
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                disabled={sending || !canSendMessages()}
                onClick={() => handleSendMessage('PASTORAL')}
              >
                <Calendar className="h-3 w-3 mr-1" />
                Pastoral Visit
              </Button>
            </div>
            {!canSendMessages() && (
              <p className="text-xs text-muted-foreground mt-2">
                You don't have permission to send messages directly.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
