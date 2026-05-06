import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LuDollarSign, LuDownload, LuChart } from "react-icons/lu";
import { useState } from "react";

export default function FinancialReportsPage() {
  const [period, setPeriod] = useState("2026");
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <DollarSign className="text-green-600" />
        Financial Reports
      </h1>
      
      <div className="flex gap-4 items-center">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="2026">2026</SelectItem>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2024">2024</SelectItem>
          </SelectContent>
        </Select>
        <Button><Download className="mr-2 h-4 w-4" /> Export Report</Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>Total Donations</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">$12,450.00</p>
            <p className="text-sm text-muted-foreground">In {period}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Campaign Performance</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Building Fund</span>
                <span className="font-medium">$5,200 / $10,000</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-1/2"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Top Donors</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>John D.</span>
                <span>$1,500</span>
              </div>
              <div className="flex justify-between">
                <span>Sarah M.</span>
                <span>$1,200</span>
              </div>
              <div className="flex justify-between">
                <span>Mike C.</span>
                <span>$800</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Chart className="h-5 w-5" />
            Monthly Breakdown
          </CardTitle>
          <CardDescription>Donation trends for {period}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Chart visualization would go here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
