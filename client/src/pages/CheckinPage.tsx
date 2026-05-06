import { useState } from "react";
import { useCreateAttendance, useAttendanceLink, useCheckinWithLink } from "@/hooks/use-attendance";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LuLoader2, LuCheckCircle2, LuCalendar, LuVideo, LuMapPin, LuClock, LuQrCode, LuLink as LinkIcon, LuBarChart3 } from 'react-icons/lu';
import { useLocation } from "wouter";

const serviceTypes = [
  { value: "SUNDAY_SERVICE", label: "Sunday Service" },
  { value: "MIDWEEK_SERVICE", label: "Midweek Service" },
  { value: "SPECIAL_EVENT", label: "Special Event" },
  { value: "ONLINE_LIVE", label: "Online Live Stream" },
  { value: "ONLINE_REPLAY", label: "Online Replay" },
];

export default function CheckinPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedServiceType, setSelectedServiceType] = useState<string>("");
  const [serviceName, setServiceName] = useState("");
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  
  const createAttendance = useCreateAttendance();
  const checkinWithLink = useCheckinWithLink();
  
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!selectedServiceType || !serviceName || !serviceDate) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      await createAttendance.mutateAsync({
        serviceType: selectedServiceType,
        serviceName,
        serviceDate: new Date(serviceDate).toISOString(),
        notes: notes || undefined,
      });
      setSuccess(true);
    } catch (err: any) {
      console.error("Check-in error:", err);
      setError(err.message || "Failed to check in. Please try again.");
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container max-w-md mx-auto py-12 px-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Please log in to check in to a service.</p>
            <Button onClick={() => setLocation("/login")}>Log In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-lg mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Check In</h1>
        <p className="text-muted-foreground mt-2">
          Let us know you attended
        </p>
      </div>

      {success && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-3" />
            <h3 className="text-lg font-semibold text-green-800">Check-in Successful!</h3>
            <p className="text-green-700 mt-1">Thank you for checking in.</p>
            <div className="flex gap-2 mt-4 justify-center">
              <Button variant="outline" onClick={() => setSuccess(false)}>
                Check In Another
              </Button>
              <Button onClick={() => setLocation("/attendance")}>
                View My Attendance
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!success && (
        <Card>
          <CardHeader>
            <CardTitle>Service Check-in</CardTitle>
            <CardDescription>
              Select the service you attended today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCheckin} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div>
                <Label htmlFor="serviceType">Service Type *</Label>
                <Select value={selectedServiceType} onValueChange={setSelectedServiceType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="serviceName">Service Name *</Label>
                <Input
                  id="serviceName"
                  placeholder="e.g., Sunday Morning Service"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="serviceDate">Date *</Label>
                <Input
                  id="serviceDate"
                  type="date"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any observations or notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={createAttendance.isPending}
              >
                {createAttendance.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking in...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Check In
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Other Check-in Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start" asChild>
            <a href="/attendance/analytics">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Attendance Analytics
            </a>
          </Button>
          <Button variant="outline" className="w-full justify-start" asChild>
            <a href="/attendance">
              <Calendar className="mr-2 h-4 w-4" />
              My Attendance History
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
