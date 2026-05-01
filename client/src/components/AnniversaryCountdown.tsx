import { useState, useEffect } from "react";
import { HiHeart } from "react-icons/hi";
import { Card, CardContent } from "@/components/ui/card";

interface Anniversary {
  id: string;
  name: string;
  date: Date;
  daysUntil: number;
}

export function AnniversaryCountdown() {
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);

  useEffect(() => {
    // Mock data - replace with API call
    const mockAnniversaries: Anniversary[] = [
      { id: "1", name: "John & Jane Doe", date: new Date(2026, 4, 15), daysUntil: 14 },
      { id: "2", name: "Mike & Sarah Smith", date: new Date(2026, 4, 28), daysUntil: 27 },
      { id: "3", name: "David & Grace Johnson", date: new Date(2026, 5, 10), daysUntil: 40 },
    ];
    setAnniversaries(mockAnniversaries.sort((a, b) => a.daysUntil - b.daysUntil));
  }, []);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <HiHeart className="w-5 h-5 text-red-500" />
          <h3 className="font-semibold">Anniversary Countdown</h3>
        </div>
        {anniversaries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming anniversaries</p>
        ) : (
          <div className="space-y-3">
            {anniversaries.slice(0, 3).map((ann) => (
              <div key={ann.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{ann.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {ann.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-500">{ann.daysUntil}</p>
                  <p className="text-xs text-muted-foreground">days</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
