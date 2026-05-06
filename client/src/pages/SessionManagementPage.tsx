import { useState } from "react";
import { PageSEO } from "@/components/PageSEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LuLaptop, LuSmartphone, LuTablet, LuMapPin, LuClock, LuTrash2, LuCheckCheck } from 'react-icons/lu';

interface Session {
  id: string;
  device: string;
  deviceType: "desktop" | "mobile" | "tablet";
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

const mockSessions: Session[] = [
  { id: "1", device: "Chrome on MacOS", deviceType: "desktop", location: "Lagos, Nigeria", lastActive: "Active now", isCurrent: true },
  { id: "2", device: "Safari on iPhone", deviceType: "mobile", location: "Lagos, Nigeria", lastActive: "2 hours ago", isCurrent: false },
  { id: "3", device: "Firefox on Windows", deviceType: "desktop", location: "Abuja, Nigeria", lastActive: "1 day ago", isCurrent: false },
  { id: "4", device: "Chrome on Android", deviceType: "mobile", location: "Lagos, Nigeria", lastActive: "3 days ago", isCurrent: false },
];

export default function SessionManagementPage() {
  const [sessions, setSessions] = useState<Session[]>(mockSessions);

  const terminateSession = (id: string) => {
    setSessions(sessions.filter(s => s.id !== id));
    alert("Session terminated! (This is a demo)");
  };

  const terminateAllOthers = () => {
    setSessions(sessions.filter(s => s.isCurrent));
    alert("All other sessions terminated! (This is a demo)");
  };

  const getDeviceIcon = (type: string) => {
    switch(type) {
      case "desktop": return <Laptop className="w-5 h-5" />;
      case "mobile": return <Smartphone className="w-5 h-5" />;
      case "tablet": return <Tablet className="w-5 h-5" />;
      default: return <Laptop className="w-5 h-5" />;
    }
  };

  return (
    <>
      <PageSEO title="Session Management | Watchman Lekki" description="Manage your active sessions across devices" />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Session Management</h1>
              <p className="text-muted-foreground">Manage your active sessions and devices</p>
            </div>
            <Button 
              variant="outline" 
              className="text-destructive hover:bg-destructive/10"
              onClick={terminateAllOthers}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Terminate All Other Sessions
            </Button>
          </div>

          <div className="space-y-4">
            {sessions.map((session) => (
              <Card key={session.id} className={session.isCurrent ? "border-primary" : ""}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${session.isCurrent ? "bg-primary/10" : "bg-muted/50"}`}>
                        {getDeviceIcon(session.deviceType)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{session.device}</p>
                          {session.isCurrent && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                              <CheckCheck className="w-3 h-3 inline mr-1" />
                              Current Session
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {session.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {session.lastActive}
                          </span>
                        </div>
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => terminateSession(session.id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Terminating a session will sign you out on that device. You'll need to sign in again.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
