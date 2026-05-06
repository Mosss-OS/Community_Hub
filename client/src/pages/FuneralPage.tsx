import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LuCross, LuCalendar, LuPhone, LuUser } from "react-icons/lu";
import { useState } from "react";

export default function FuneralPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Cross className="text-gray-600" />
          Funeral Services
        </h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <LuPlus className="mr-2 h-4 w-4" />
          Request Service
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Funeral Service Request</CardTitle>
            <CardDescription>We are here to support you during this difficult time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Deceased Name</Label>
                <Input placeholder="Full name" />
              </div>
              <div className="space-y-2">
                <Label>Date of Passing</Label>
                <Input type="date" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Service Date (Preferred)</Label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <Label>Contact Person</Label>
              <Input placeholder="Name of family contact" />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input placeholder="555-0123" />
            </div>
            <div className="space-y-2">
              <Label>Special Requests</Label>
              <Textarea placeholder="Any special arrangements or requests..." rows={3} />
            </div>
            <div className="flex gap-2">
              <Button>Submit Request</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Our Commitment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>We provide compassionate support during your time of loss.</p>
            <p>Our pastoral team will guide you through the planning process.</p>
            <p>Services can be held at the church or funeral home.</p>
            <p>We offer grief counseling for family members.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Pastor Tom: (555) 012-3456
            </p>
            <p className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Available 24/7 for emergencies
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
