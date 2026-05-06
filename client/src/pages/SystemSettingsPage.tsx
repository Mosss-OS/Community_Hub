import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LuCog, LuSave, LuGlobe, LuClock } from "react-icons/lu";
import { useState } from "react";

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState({
    churchName: "Watchman Lekki",
    timezone: "Africa/Lagos",
    language: "en",
    dateFormat: "MM/dd/yyyy",
  });

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Cog className="text-primary" />
        System Settings
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Configure global system settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="churchName">Church Name</Label>
            <Input 
              id="churchName" 
              value={settings.churchName} 
              onChange={(e) => setSettings({...settings, churchName: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select value={settings.timezone} onValueChange={(v) => setSettings({...settings, timezone: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Africa/Lagos">Africa/Lagos</SelectItem>
                <SelectItem value="America/New_York">America/New York</SelectItem>
                <SelectItem value="Europe/London">Europe/London</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Date Format</Label>
            <Select value={settings.dateFormat} onValueChange={(v) => setSettings({...settings, dateFormat: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/dd/yyyy">MM/dd/yyyy</SelectItem>
                <SelectItem value="dd/MM/yyyy">dd/MM/yyyy</SelectItem>
                <SelectItem value="yyyy-MM-dd">yyyy-MM-dd</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button><Save className="mr-2 h-4 w-4" /> Save Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
