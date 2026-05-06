import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LuBell, LuCheck, LuLoader2 } from 'react-icons/lu';
import { useToast } from "@/hooks/use-toast";
import { buildApiUrl } from "@/lib/api-config";

interface WaitlistEntry {
  id: string;
  eventId: number;
  eventTitle: string;
  email: string;
  phone?: string;
  createdAt: string;
}

export function EventWaitlist({ eventId, eventTitle, capacity, enrolled }: { eventId: number; eventTitle: string; capacity: number; enrolled: number }) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  const spotsLeft = capacity - enrolled;
  const isFull = spotsLeft <= 0;

  const joinWaitlist = async () => {
    if (!email.trim()) {
      toast({ title: "Please enter your email", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(buildApiUrl("/api/events/waitlist"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ eventId, email, phone }),
      });

      if (response.ok) {
        setIsJoined(true);
        toast({ title: "Added to waitlist! We'll notify you when a spot opens up." });
      } else {
        toast({ title: "Failed to join waitlist", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error joining waitlist", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isJoined) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-green-700">
            <Check className="h-5 w-5" />
            <div>
              <p className="font-medium">You're on the waitlist!</p>
              <p className="text-sm">We'll notify you when a spot opens up for {eventTitle}.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-amber-600" />
          Event Full - Join Waitlist
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {eventTitle} is full ({enrolled}/{capacity} spots taken). Join the waitlist to be notified when a spot opens up.
        </p>
        <div>
          <Label htmlFor="waitlist-email">Email *</Label>
          <Input
            id="waitlist-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
          />
        </div>
        <div>
          <Label htmlFor="waitlist-phone">Phone (optional)</Label>
          <Input
            id="waitlist-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Your phone number"
          />
        </div>
        <Button onClick={joinWaitlist} disabled={isSubmitting || !email.trim()} className="w-full">
          {isSubmitting ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Joining...</>
          ) : (
            <><Bell className="mr-2 h-4 w-4" /> Join Waitlist</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
