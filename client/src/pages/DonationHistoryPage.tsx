import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { buildApiUrl } from "@/lib/api-config";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LuDownload, LuCheckCircle, LuClock, LuDollarSign } from "react-icons/lu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Donation {
  id: number;
  amount: number;
  currency: string;
  status: string;
  campaignTitle?: string;
  createdAt: string;
}

export default function DonationHistoryPage() {
  const { user } = useAuth();
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const { data: donations, isLoading } = useQuery({
    queryKey: ["donations", "my", year],
    queryFn: async () => {
      const res = await fetch(buildApiUrl(`/api/donations/my?year=${year}`), { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const totalGiven = donations?.reduce((sum: number, d: Donation) => sum + (d.status === "succeeded" ? d.amount : 0), 0) || 0;

  if (!user) return <div className="container mx-auto py-12 text-center">Please log in</div>;

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <DollarSign className="text-green-600" />
          Giving History
        </h1>
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            {[2026, 2025, 2024, 2023].map((y) => (
              <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total Given in {year}</CardTitle>
          <CardDescription>${(totalGiven / 100).toFixed(2)}</CardDescription>
        </CardHeader>
      </Card>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="space-y-3">
          {donations?.map((d: Donation) => (
            <Card key={d.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {d.campaignTitle || "General Donation"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">${(d.amount / 100).toFixed(2)}</p>
                    <Badge className={d.status === "succeeded" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {d.status === "succeeded" ? (
                        <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Completed</span>
                      ) : (
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {d.status}</span>
                      )}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
