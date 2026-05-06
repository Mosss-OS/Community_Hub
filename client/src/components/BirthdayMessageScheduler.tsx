import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { LuCake, LuLoader2 } from 'react-icons/lu';
import { useToast } from "@/components/ui/use-toast";
import { buildApiUrl } from "@/lib/api-config";

export function BirthdayMessageScheduler() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState("Happy Birthday! May God bless you abundantly on your special day! 🎂🎉");
  const [time, setTime] = useState("09:00");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(buildApiUrl("/api/members/birthday-settings"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ birthdayMessagesEnabled: enabled, birthdayMessage: message, birthdayMessageTime: time }),
      });
      if (response.ok) {
        toast({ title: "Settings saved successfully" });
      } else {
        toast({ title: "Failed to save settings", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error saving settings", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  const birthday = (user as any).birthday;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cake className="h-5 w-5 text-primary" />
          Birthday Message Scheduler
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Enable Birthday Messages</p>
            <p className="text-sm text-muted-foreground">Automatically send birthday greetings</p>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>

        {birthday && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">Your Birthday</p>
            <p className="text-sm text-muted-foreground">{new Date(birthday).toLocaleDateString()}</p>
          </div>
        )}

        <div>
          <Label htmlFor="message">Birthday Message</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your birthday message..."
            className="mt-1"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="time">Send Time</Label>
          <Select value={time} onValueChange={setTime}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="06:00">6:00 AM</SelectItem>
              <SelectItem value="08:00">8:00 AM</SelectItem>
              <SelectItem value="09:00">9:00 AM</SelectItem>
              <SelectItem value="12:00">12:00 PM</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
}
