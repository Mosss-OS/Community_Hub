import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LuClock } from "react-icons/lu";

export function ServiceTimesWidget() {
  const serviceTimes = [
    { day: "Sunday", time: "8:00 AM & 9:00 AM", service: "Morning Service" },
    { day: "Wednesday", time: "6:00 PM", service: "Midweek Service" },
    { day: "Friday", time: "7:00 PM", service: "Youth Service" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="text-primary" />
          Service Times
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {serviceTimes.map((service, i) => (
            <div key={i} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
              <div>
                <p className="font-medium">{service.day}</p>
                <p className="text-sm text-muted-foreground">{service.service}</p>
              </div>
              <span className="text-sm font-medium">{service.time}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
