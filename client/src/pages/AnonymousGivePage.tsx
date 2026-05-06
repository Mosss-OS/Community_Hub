import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AnonymousGivePage() {
  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Anonymous Giving</h1>
      <Card>
        <CardHeader><CardTitle>Make an Anonymous Donation</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">Your identity will not be recorded with this donaton.</p>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" placeholder="0.00" />
          </div>
          <Button className="w-full">Give Anonymously</Button>
        </CardContent>
      </Card>
    </div>
  );
}
