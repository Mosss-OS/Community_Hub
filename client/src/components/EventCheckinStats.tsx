import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Activity, BarChart3 } from "lucide-react";

interface CheckinStat {
  label: string;
  value: number;
  change: number;
  icon: any;
}

export function EventCheckinStats() {
  const [stats, setStats] = useState<CheckinStat[]>([
    { label: "Total Check-ins", value: 247, change: 12, icon: Users },
    { label: "New Visitors", value: 18, change: 5, icon: TrendingUp },
    { label: "Returning Members", value: 189, change: 8, icon: Activity },
    { label: "Peak Hour", value: 10, change: 0, icon: BarChart3 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => prev.map(stat => ({
        ...stat,
        value: stat.label === "Total Check-ins" 
          ? stat.value + Math.floor(Math.random() * 3)
          : stat.value,
        change: stat.label === "New Visitors"
          ? stat.change + (Math.random() > 0.5 ? 1 : 0)
          : stat.change
      })));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              {stat.change !== 0 && (
                <span className={`text-xs font-medium ${stat.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change > 0 ? '↑' : '↓'} {Math.abs(stat.change)}%
                </span>
              )}
            </div>
            <p className="text-2xl font-bold mb-1">{stat.value.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
