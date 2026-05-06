import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LuBell, LuMail, LuMessageSquare, LuPhone, LuSave } from "react-icons/lu";
import { useState } from "react";

export default function NotificationPreferencesPage() {
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    prayerAlerts: true,
    eventReminders: true,
    donationReceipts: true,
    sermonNotifications: false,
    communityUpdates: true,
  });

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences({ ...preferences, [key]: !preferences[key] });
  };

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Bell className="text-primary" />
        Notification Preferences
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
          <CardDescription>Choose how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <Label>Email Notifications</Label>
            </div>
            <Switch 
              checked={preferences.emailNotifications} 
              onCheckedChange={() => togglePreference('emailNotifications')} 
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <Label>Push Notifications</Label>
            </div>
            <Switch 
              checked={preferences.pushNotifications} 
              onCheckedChange={() => togglePreference('pushNotifications')} 
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <Label>SMS Notifications</Label>
            </div>
            <Switch 
              checked={preferences.smsNotifications} 
              onCheckedChange={() => togglePreference('smsNotifications')} 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>Select which events trigger notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <Label>Prayer Alerts</Label>
            </div>
            <Switch 
              checked={preferences.prayerAlerts} 
              onCheckedChange={() => togglePreference('prayerAlerts')} 
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <Label>Event Reminders</Label>
            </div>
            <Switch 
              checked={preferences.eventReminders} 
              onCheckedChange={() => togglePreference('eventReminders')} 
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <Label>Donation Receipts</Label>
            </div>
            <Switch 
              checked={preferences.donationReceipts} 
              onCheckedChange={() => togglePreference('donationReceipts')} 
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <Label>Sermon Notifications</Label>
            </div>
            <Switch 
              checked={preferences.sermonNotifications} 
              onCheckedChange={() => togglePreference('sermonNotifications')} 
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <Label>Community Updates</Label>
            </div>
            <Switch 
              checked={preferences.communityUpdates} 
              onCheckedChange={() => togglePreference('communityUpdates')} 
            />
          </div>
        </CardContent>
      </Card>

      <Button className="w-full">
        <Save className="mr-2 h-4 w-4" />
        Save Preferences
      </Button>
    </div>
  );
}
