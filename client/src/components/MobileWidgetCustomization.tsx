import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, Settings } from "lucide-react";

export function MobileWidgetCustomization() {
  const widgets = [
    { id: "1", name: "Quick Donate", enabled: true },
    { id: "2", name: "Daily Verse", enabled: true },
    { id: "3", name: "Events", enabled: false },
    { id: "4", name: "Prayer Requests", enabled: true },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Smartphone className="h-5 w-5 text-primary" /> Mobile Widget Customization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {widgets.map(w => (
          <div key={w.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <p className="font-medium">{w.name}</p>
            <Button variant={w.enabled ? "default" : "outline"} size="sm">
              {w.enabled ? "Enabled" : "Disabled"}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
