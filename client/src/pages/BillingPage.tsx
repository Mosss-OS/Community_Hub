import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { buildApiUrl } from "@/lib/api-config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Download, Plus, CheckCircle, AlertCircle, Calendar } from "lucide-react";
import { format } from "date-fns";

type SubscriptionPlan = 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
type SubscriptionStatus = 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'TRIALING' | 'INCOMPLETE' | 'INCOMPLETE_EXPIRED' | 'UNPAID';
type BillingInterval = 'MONTHLY' | 'YEARLY';

interface Subscription {
  id: number;
  organizationId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  billingInterval: BillingInterval;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  stripeSubscriptionId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Invoice {
  id: number;
  subscriptionId: number | null;
  organizationId: string;
  amount: number;
  currency: string;
  status: string;
  stripeInvoiceId: string | null;
  invoiceUrl: string | null;
  pdfUrl: string | null;
  periodStart: string;
  periodEnd: string;
  paidAt: string | null;
  createdAt: string;
}

interface PaymentMethod {
  id: number;
  organizationId: string;
  type: string;
  last4: string | null;
  brand: string | null;
  expMonth: number | null;
  expYear: number | null;
  isDefault: boolean;
  stripePaymentMethodId: string | null;
  createdAt: string;
}

async function fetchSubscription(): Promise<Subscription | null> {
  const response = await fetch(buildApiUrl("/api/billing/subscription"));
  if (!response.ok) throw new Error("Failed to fetch subscription");
  return response.json();
}

async function fetchInvoices(): Promise<Invoice[]> {
  const response = await fetch(buildApiUrl("/api/billing/invoices"));
  if (!response.ok) throw new Error("Failed to fetch invoices");
  return response.json();
}

async function fetchPaymentMethods(): Promise<PaymentMethod[]> {
  const response = await fetch(buildApiUrl("/api/billing/payment-methods"));
  if (!response.ok) throw new Error("Failed to fetch payment methods");
  return response.json();
}

const planPrices = {
  FREE: { monthly: 0, yearly: 0 },
  BASIC: { monthly: 2900, yearly: 29000 },
  PREMIUM: { monthly: 9900, yearly: 99000 },
  ENTERPRISE: { monthly: 29900, yearly: 299000 },
};

const planFeatures = {
  FREE: ["5 Users", "Basic Events", "Community Support"],
  BASIC: ["50 Users", "Advanced Events", "Email Support", "5GB Storage"],
  PREMIUM: ["Unlimited Users", "All Features", "Priority Support", "100GB Storage", "Custom Branding"],
  ENTERPRISE: ["Everything in Premium", "Dedicated Support", "Unlimited Storage", "SLA Guarantee"],
};

export default function BillingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>("BASIC");
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("MONTHLY");
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  const { data: subscription, isLoading: subLoading } = useQuery({
    queryKey: ["subscription"],
    queryFn: fetchSubscription,
  });

  const { data: invoices, isLoading: invLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: fetchInvoices,
  });

  const { data: paymentMethods, isLoading: pmLoading } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: fetchPaymentMethods,
  });

  const statusColors: Record<SubscriptionStatus, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    TRIALING: "bg-blue-100 text-blue-800",
    CANCELED: "bg-red-100 text-red-800",
    PAST_DUE: "bg-orange-100 text-orange-800",
    INCOMPLETE: "bg-yellow-100 text-yellow-800",
    INCOMPLETE_EXPIRED: "bg-red-100 text-red-800",
    UNPAID: "bg-red-100 text-red-800",
  };

  const getStatusBadge = (status: SubscriptionStatus) => (
    <Badge className={statusColors[status] || ""}>{status}</Badge>
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing & Subscriptions</h1>
        <p className="text-muted-foreground">Manage your subscription and billing</p>
      </div>

      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Current Subscription</CardTitle>
              <CardDescription>Your current plan and status</CardDescription>
            </div>
            {subscription && getStatusBadge(subscription.status)}
          </div>
        </CardHeader>
        <CardContent>
          {subLoading ? (
            <div>Loading...</div>
          ) : subscription ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <CreditCard className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="text-2xl font-bold">{subscription.plan} Plan</h3>
                  <p className="text-muted-foreground">
                    {subscription.billingInterval === 'MONTHLY' ? 'Monthly' : 'Yearly'} billing
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Current Period</span>
                  <p className="font-medium">
                    {format(new Date(subscription.currentPeriodStart), "MMM d")} - {format(new Date(subscription.currentPeriodEnd), "MMM d, yyyy")}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <p className="font-medium">{subscription.status}</p>
                </div>
              </div>
              <Button onClick={() => setShowUpgradeDialog(true)}>Change Plan</Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">No active subscription found</p>
              <Button onClick={() => setShowUpgradeDialog(true)}>Choose a Plan</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Choose Your Plan</DialogTitle>
            <DialogDescription>Select the plan that best fits your needs</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center gap-2">
              <Button variant={billingInterval === 'MONTHLY' ? 'default' : 'outline'} onClick={() => setBillingInterval('MONTHLY')}>Monthly</Button>
              <Button variant={billingInterval === 'YEARLY' ? 'default' : 'outline'} onClick={() => setBillingInterval('YEARLY')}>Yearly (Save 17%)</Button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(planPrices).map(([plan, prices]) => (
                <Card key={plan} className={`cursor-pointer ${selectedPlan === plan ? 'ring-2 ring-primary' : ''}`} onClick={() => setSelectedPlan(plan as SubscriptionPlan)}>
                  <CardHeader>
                    <CardTitle className="text-center">{plan}</CardTitle>
                    <div className="text-center">
                      <span className="text-3xl font-bold">${(billingInterval === 'MONTHLY' ? prices.monthly : prices.yearly) / 100}</span>
                      <span className="text-muted-foreground">/{billingInterval === 'MONTHLY' ? 'mo' : 'yr'}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {planFeatures[plan as SubscriptionPlan]?.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button className="w-full" disabled={selectedPlan === subscription?.plan}>
              {selectedPlan === subscription?.plan ? 'Current Plan' : `Switch to ${selectedPlan}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your payment methods</CardDescription>
            </div>
            {user?.isAdmin && (
              <Button size="sm"><Plus className="mr-2 h-3 w-3" /> Add Payment Method</Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {pmLoading ? (
            <div>Loading...</div>
          ) : paymentMethods?.length ? (
            <div className="space-y-2">
              {paymentMethods.map(pm => (
                <div key={pm.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5" />
                    <div>
                      <p className="font-medium">{pm.brand} •••• {pm.last4}</p>
                      <p className="text-sm text-muted-foreground">Expires {pm.expMonth}/{pm.expYear}</p>
                    </div>
                  </div>
                  {pm.isDefault && <Badge>Default</Badge>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">No payment methods added</p>
          )}
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices & Payment History</CardTitle>
          <CardDescription>Your billing history</CardDescription>
        </CardHeader>
        <CardContent>
          {invLoading ? (
            <div>Loading...</div>
          ) : invoices?.length ? (
            <div className="space-y-2">
              {invoices.map(invoice => (
                <div key={invoice.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">${(invoice.amount / 100).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(invoice.periodStart), "MMM d")} - {format(new Date(invoice.periodEnd), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>{invoice.status}</Badge>
                    {invoice.pdfUrl && (
                      <Button size="sm" variant="ghost" onClick={() => window.open(invoice.pdfUrl!, '_blank')}>
                        <Download className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">No invoices yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
