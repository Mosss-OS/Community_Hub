import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LuDownload, LuDollarSign, LuCalendar } from "react-icons/lu";
import { useState } from "react";

const receipts = [
  { id: 1, date: "2026-01-15", amount: 50000, campaign: "Building Fund" },
  { id: 2, date: "2026-02-20", amount: 25000, campaign: "General" },
  { id: 3, date: "2026-03-10", amount: 100000, campaign: "Missions" },
];

export default function DonationReceiptsPage() {
  const [year, setYear] = useState("2026");

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <DollarSign className="text-green-600" />
        Donation Receipts
      </h1>

      <div className="flex items-center gap-4">
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="2026">2026</SelectItem>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2024">2024</SelectItem>
          </SelectContent>
        </Select>
        <Button><Download className="mr-2 h-4 w-4" /> Download All</Button>
      </div>

      <div className="space-y-3">
        {receipts.map((r) => (
          <Card key={r.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>${r.amount / 100}</CardTitle>
                  <p className="text-sm text-muted-foreground">{r.campaign}</p>
                </div>
                <Button size="sm" variant="outline">
                  <Download className="mr-2 h-3 w-3" /> Receipt
                </Button>
              </div>
              <CardDescription>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {r.date}
                </span>
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
