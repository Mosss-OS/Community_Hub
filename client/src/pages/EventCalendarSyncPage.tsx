import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LuCalendar, LuDownload } from "react-icons/lu";

export default function EventCalendarSyncPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Calendar className="text-primary" />
        Event Calendar Sync
      </h1>
      <Card>
        <CardHeader><CardTitle>Sync to Calendar</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">Export events to your preferred calendar app</p>
          <div className="flex gap-2">
            <Button><Download className="mr-2 h-4 w-4" /> Google Calendar</Button>
            <Button variant="outline"><Download className="mr-2 h-4 w-4" /> iCal/Outlook</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
