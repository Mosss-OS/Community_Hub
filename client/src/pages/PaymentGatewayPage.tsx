import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LuCreditCard, LuSave, LuCheckCircle } from "react-icons/lu";
import { useState } from "react";

export default function PaymentGatewayPage() {
  const [provider, setProvider] = useState("paystack");
  const [publicKey, setPublicKey] = useState("");

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <CreditCard className="text-primary" />
        Payment Gateway
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Payment Configuration</CardTitle>
          <CardDescription>Configure donation payment providers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Payment Provider</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="paystack">Paystack</SelectItem>
                <SelectItem value="flutterwave">Flutterwave</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="monnify">Monnify</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="public-key">Public Key</Label>
            <Input 
              id="public-key"
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              placeholder="pk_live_..."
              type="password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="secret-key">Secret Key</Label>
            <Input 
              id="secret-key"
              placeholder="sk_live_..."
              type="password"
            />
          </div>
          <Button><Save className="mr-2 h-4 w-4" /> Save Configuration</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Test Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline">Test Payment Flow</Button>
        </CardContent>
      </Card>
    </div>
  );
}
