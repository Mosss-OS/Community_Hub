import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Heart } from "lucide-react";

interface Campaign {
  id: string;
  title: string;
  goal: number;
  raised: number;
  daysLeft: number;
}

export function GivingCampaignCards() {
  const campaigns: Campaign[] = [
    { id: "1", title: "Building Fund", goal: 50000, raised: 32500, daysLeft: 45 },
    { id: "2", title: "Mission Trip", goal: 10000, raised: 8500, daysLeft: 30 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {campaigns.map(c => (
        <Card key={c.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              {c.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-muted rounded-full h-3 mb-3">
              <div 
                className="bg-green-600 h-3 rounded-full" 
                style={{ width: `${(c.raised / c.goal) * 100}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              ${c.raised.toLocaleString()} raised of ${c.goal.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">{c.daysLeft} days left</p>
            <Button className="w-full mt-3">Donate Now</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
