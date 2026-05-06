import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LuBell, LuPlus, LuTrash2, LuClock } from "react-icons/lu";
import { useState } from "react";

const reminders = [
  { id: 1, event: "Sunday Service", time: "30min", method: "push", enabled: true },
  { id: 2, event: "Bible Study", time: "1hour", method: "email", enabled: true },
  { id: 3, event: "Prayer Meeting", time: "2hours", method: "sms", enabled: false },
];

export default function EventRemindersPage() {
  const [enabled, setEnabled] = useState(true);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Bell className="text-primary" />
        Event Reminders
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Reminder Settings</CardTitle>
          <CardDescription>Configure automatic event reminders</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="enable-reminders">Enable Reminders</Label>
            <Button
              variant={enabled ? "default" : "outline"}
              size="sm"
              onClick={() => setEnabled(!enabled)}
            >
              {enabled ? "Enabled" : "Disabled"}
            </Button>
          </div>
          <div className="space-y-2">
            <Label>Default Reminder Time</Label>
            <Select defaultValue="30min">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="15min">15 minutes before</SelectItem>
                <SelectItem value="30min">30 minutes before</SelectItem>
                <SelectItem value="1hour">1 hour before</SelectItem>
                <SelectItem value="2hours">2 hours before</SelectItem>
                <SelectItem value="1day">1 day before</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reminders.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{r.event}</p>
                    <p className="text-sm text-muted-foreground">{r.time} before • {r.method}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button className="mt-4"><Plus className="mr-2 h-4 w-4" /> Add Reminder</Button>
        </CardContent>
      </Card>
    </div>
  );
}
