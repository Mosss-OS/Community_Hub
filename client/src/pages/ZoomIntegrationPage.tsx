import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LuVideo, LuSave, LuLink as LinkIcon } from "react-icons/lu";
import { useState } from "react";

export default function ZoomIntegrationPage() {
  const [zoomApiKey, setZoomApiKey] = useState("");
  const [accountId, setAccountId] = useState("");

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Video className="text-primary" />
        Zoom Integration
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Zoom Configuration</CardTitle>
          <CardDescription>Connect your Zoom account for live streaming</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input 
              id="api-key"
              type="password"
              value={zoomApiKey}
              onChange={(e) => setZoomApiKey(e.target.value)}
              placeholder="Zoom API Key"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account-id">Account ID</Label>
            <Input 
              id="account-id"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              placeholder="Zoom Account ID"
            />
          </div>
          <div className="space-y-2">
            <Label>Meeting Type</Label>
            <Select defaultValue="livestream">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="livestream">Live Streaming</SelectItem>
                <SelectItem value="webinar">Webinar</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button><Save className="mr-2 h-4 w-4" /> Save Configuration</Button>
        </CardContent>
      </Card>
    </div>
  );
}
