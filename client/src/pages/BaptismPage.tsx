import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LuDroplet, LuCalendar, LuUser, LuCheckCircle } from "react-icons/lu";
import { useState } from "react";

const upcomingBaptisms = [
  { id: 1, name: "John Smith", date: "2026-05-18", service: "Morning", pastor: "Pastor Tom" },
  { id: 2, name: "Emily Davis", date: "2026-05-18", service: "Evening", pastor: "Pastor Tom" },
  { id: 3, name: "Michael Brown", date: "2026-06-01", service: "Morning", pastor: "Pastor Sarah" },
];

export default function BaptismPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Droplet className="text-blue-600" />
          Baptism
        </h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <LuUser className="mr-2 h-4 w-4" />
          Sign Up
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Baptism Registration</CardTitle>
            <CardDescription>Register for water baptism</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input placeholder="John" />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input placeholder="Smith" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Preferred Date</Label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <Label>Service Time</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning Service (10 AM)</SelectItem>
                  <SelectItem value="evening">Evening Service (6 PM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button>Submit Registration</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Baptisms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingBaptisms.map((b) => (
              <div key={b.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">{b.name}</p>
                    <p className="text-sm text-muted-foreground">
                      <Calendar className="inline h-3 w-3 mr-1" />
                      {b.date} - {b.service} Service
                    </p>
                  </div>
                </div>
                <Badge variant="outline">{b.pastor}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About Baptism</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Baptism is a public declaration of your faith in Jesus Christ.</p>
            <p>We baptize by immersion, following the example of Jesus.</p>
            <p>Classes are required before baptism - contact the church office.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
