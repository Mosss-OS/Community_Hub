import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check } from "lucide-react";
import { useState } from "react";

export function ScripturePush() {
  const [enabled, setEnabled] = useState(true);
  const [time, setTime] = useState("08:00");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /> Scripture Push Notification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm">Enable daily push</p>
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="h-4 w-4" />
        </div>
        <div>
          <label className="text-sm">Push time</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1 block w-full rounded-md border p-2" />
        </div>
        <Button className="w-full">Save Settings</Button>
      </CardContent>
    </Card>
  );
}
