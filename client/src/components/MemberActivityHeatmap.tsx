import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface HeatmapData {
  day: string;
  hours: number[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOUR_LABELS = ["6a", "9a", "12p", "3p", "6p", "9p"];

const generateMockData = (): HeatmapData[] => {
  return DAYS.map(day => ({
    day,
    hours: Array(24).fill(0).map(() => Math.floor(Math.random() * 100)),
  }));
};

export function MemberActivityHeatmap() {
  const [data, setData] = useState<HeatmapData[]>([]);

  useEffect(() => {
    setData(generateMockData());
  }, []);

  const getColor = (value: number) => {
    if (value === 0) return "bg-muted/20";
    if (value < 25) return "bg-primary/20";
    if (value < 50) return "bg-primary/40";
    if (value < 75) return "bg-primary/60";
    return "bg-primary/80";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Member Activity Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.map((row) => (
            <div key={row.day} className="flex items-center gap-2">
              <span className="w-10 text-xs text-muted-foreground">{row.day}</span>
              <div className="flex gap-1 flex-1">
                {row.hours.slice(6, 22).map((value, hour) => (
                  <div
                    key={hour}
                    className={`flex-1 h-6 rounded-sm ${getColor(value)}`}
                    title={`${row.day} ${hour + 6}:00 - ${value} active members`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <span>6 AM</span>
          <span>12 PM</span>
          <span>6 PM</span>
          <span>10 PM</span>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <span className="text-xs text-muted-foreground">Less</span>
          <div className="flex gap-1">
            {["bg-muted/20", "bg-primary/20", "bg-primary/40", "bg-primary/60", "bg-primary/80"].map((color) => (
              <div key={color} className={`w-4 h-4 rounded-sm ${color}`} />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">More</span>
        </div>
      </CardContent>
    </Card>
  );
}
