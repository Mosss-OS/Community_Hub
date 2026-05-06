import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LuHeart, LuCalendar, LuUsers, LuChurch } from "react-icons/lu";
import { useState } from "react";

export default function WeddingPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Heart className="text-pink-600" />
          Wedding Ceremonies
        </h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <LuPlus className="mr-2 h-4 w-4" />
          Book Wedding
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Wedding Booking</CardTitle>
            <CardDescription>Book a wedding ceremony at our church</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Groom's Name</Label>
                <Input placeholder="John Smith" />
              </div>
              <div className="space-y-2">
                <Label>Bride's Name</Label>
                <Input placeholder="Jane Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Wedding Date</Label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <Label>Preferred Time</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10am">10:00 AM</SelectItem>
                  <SelectItem value="2pm">2:00 PM</SelectItem>
                  <SelectItem value="4pm">4:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Special Requirements</Label>
              <textarea className="w-full p-2 border rounded" rows={3} placeholder="Any special requests..." />
            </div>
            <div className="flex gap-2">
              <Button>Submit Booking</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Weddings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Church className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">John & Jane</p>
                  <p className="text-sm text-muted-foreground">May 20, 2026 at 2:00 PM</p>
                </div>
              </div>
              <Badge>Confirmed</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Church className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Mike & Sarah</p>
                  <p className="text-sm text-muted-foreground">June 15, 2026 at 10:00 AM</p>
                </div>
              </div>
              <Badge variant="outline">Pending</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Wedding Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Both parties must be baptized Christians</p>
            <p>• Pre-marital counseling required (6 sessions)</p>
            <p>• Book at least 3 months in advance</p>
            <p>• Provide marriage license before ceremony</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
