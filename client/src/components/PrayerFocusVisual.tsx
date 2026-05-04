import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tag, Heart } from "lucide-react";

const CATEGORIES = ["Healing", "Guidance", "Thanksgiving", "Protection", "Family", "Health", "Finances", "Spiritual Growth"];

interface PrayerFocus {
  id: string;
  category: string;
  description: string;
  color: string;
}

export function PrayerFocusVisual() {
  const focuses: PrayerFocus[] = [
    { id: "1", category: "Healing", description: "Pray for the sick", color: "bg-green-100 text-green-700" },
    { id: "2", category: "Guidance", description: "Pray for church leadership", color: "bg-blue-100 text-blue-700" },
    { id: "3", category: "Thanksgiving", description: "Give thanks for blessings", color: "bg-yellow-100 text-yellow-700" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Tag className="h-5 w-5 text-primary" /> Prayer Focus Categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {focuses.map(f => (
          <div key={f.id} className={`p-3 rounded-lg ${f.color}`}>
            <div className="flex items-center justify-between">
              <p className="font-medium">{f.category}</p>
              <Heart className="h-4 w-4" />
            </div>
            <p className="text-sm mt-1">{f.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
