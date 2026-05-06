import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LuActivity } from 'react-icons/lu';

const HEATMAP_DATA = [
  { day: "Mon", hours: [2, 3, 1, 4, 2, 5, 1] },
  { day: "Tue", hours: [1, 4, 2, 3, 5, 2, 1] },
  { day: "Wed", hours: [3, 2, 5, 1, 4, 2, 3] },
  { day: "Thu", hours: [2, 5, 3, 2, 1, 4, 2] },
  { day: "Fri", hours: [4, 1, 2, 5, 3, 1, 4] },
  { day: "Sat", hours: [1, 3, 4, 2, 5, 3, 1] },
  { day: "Sun", hours: [5, 2, 1, 4, 2, 3, 5] },
];

export function MemberActivityHeatmap() {
  const maxHours = 5;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-primary" /> Member Activity Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {HEATMAP_DATA.map(row => (
            <div key={row.day} className="flex items-center gap-2">
              <span className="w-8 text-xs">{row.day}</span>
              <div className="flex gap-1">
                {row.hours.map((h, i) => (
                  <div key={i} className="w-6 h-6 rounded" style={{ backgroundColor: `rgba(79, 70, 229, ${h / maxHours})` }} title={`${h}h`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
