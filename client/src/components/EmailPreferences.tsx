import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface EmailPreferencesProps {
  userId: string;
}

export function EmailPreferences({ userId }: EmailPreferencesProps) {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState({
    weeklyDigest: true,
    eventReminders: true,
    prayerRequests: false,
    newSermons: true,
    groupUpdates: false,
  });
  const [frequency, setFrequency] = useState("weekly");

  const handleSave = () => {
    // TODO: Save to backend
    toast({ title: "Success", description: "Email preferences saved!" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="weeklyDigest"
              checked={preferences.weeklyDigest}
              onCheckedChange={(checked) =>
                setPreferences((prev) => ({ ...prev, weeklyDigest: !!checked }))
              }
            />
            <Label htmlFor="weeklyDigest">Weekly Digest</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="eventReminders"
              checked={preferences.eventReminders}
              onCheckedChange={(checked) =>
                setPreferences((prev) => ({ ...prev, eventReminders: !!checked }))
              }
            />
            <Label htmlFor="eventReminders">Event Reminders</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="prayerRequests"
              checked={preferences.prayerRequests}
              onCheckedChange={(checked) =>
                setPreferences((prev) => ({ ...prev, prayerRequests: !!checked }))
              }
            />
            <Label htmlFor="prayerRequests">Prayer Requests</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="newSermons"
              checked={preferences.newSermons}
              onCheckedChange={(checked) =>
                setPreferences((prev) => ({ ...prev, newSermons: !!checked }))
              }
            />
            <Label htmlFor="newSermons">New Sermons</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="groupUpdates"
              checked={preferences.groupUpdates}
              onCheckedChange={(checked) =>
                setPreferences((prev) => ({ ...prev, groupUpdates: !!checked }))
              }
            />
            <Label htmlFor="groupUpdates">Group Updates</Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Frequency</Label>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleSave}>Save Preferences</Button>
      </CardContent>
    </Card>
  );
}
