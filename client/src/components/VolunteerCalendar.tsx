import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Check, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { buildApiUrl } from "@/lib/api-config";

export function VolunteerCalendar({ userId }: { userId?: string }) {
  const { toast } = useToast();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const toggleDate = (date: Date) => {
    const exists = selectedDates.some(d => d.toDateString() === date.toDateString());
    if (exists) {
      setSelectedDates(selectedDates.filter(d => d.toDateString() !== date.toDateString()));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  const saveAvailability = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(buildApiUrl("/api/volunteers/availability"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          dates: selectedDates.map(d => d.toISOString()),
        }),
      });

      if (response.ok) {
        toast({ title: "Availability saved successfully!" });
      } else {
        toast({ title: "Failed to save availability", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error saving availability", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          Volunteer Availability
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Select the dates you're available for volunteering. Click on multiple dates to mark your availability.
        </p>

        <Calendar
          mode="multiple"
          selected={selectedDates}
          onSelect={(dates) => setSelectedDates(dates || [])}
          className="rounded-md border"
        />

        <div>
          <p className="text-sm font-medium mb-2">Selected Dates ({selectedDates.length})</p>
          <div className="flex flex-wrap gap-2">
            {selectedDates.length === 0 ? (
              <p className="text-sm text-muted-foreground">No dates selected</p>
            ) : (
              selectedDates.map((date, idx) => (
                <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                  {date.toLocaleDateString()}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => toggleDate(date)}
                  />
                </Badge>
              ))
            )}
          </div>
        </div>

        <Button onClick={saveAvailability} disabled={isSaving || selectedDates.length === 0} className="w-full">
          {isSaving ? (
            "Saving..."
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Save Availability
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
