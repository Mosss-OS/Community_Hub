"use client";

import { useState } from "react";
import { Receipt, Download, Mail, Printer, Calendar, CreditCard, Heart, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DonationReceipt {
  id: string;
  date: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: "completed" | "pending" | "failed";
  donorName: string;
  donorEmail: string;
  recipientChurch: string;
  referenceNumber: string;
}

interface DonationReceiptCardProps {
  receipt: DonationReceipt;
}

export function DonationReceiptCard({ receipt }: DonationReceiptCardProps) {
  const [showEmailForm, setShowEmailForm] = useState(false);

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert("Receipt download functionality - would generate PDF");
  };

  const handleEmailReceipt = () => {
    setShowEmailForm(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "failed": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <Card className="max-w-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Donation Receipt
        </CardTitle>
        <Badge className={getStatusColor(receipt.status)}>
          {receipt.status.charAt(0).toUpperCase() + receipt.status.slice(1)}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-4 border-b">
          <p className="text-3xl font-bold">{formatAmount(receipt.amount, receipt.currency)}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Thank you for your generosity!
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date
            </span>
            <span className="font-medium">{new Date(receipt.date).toLocaleDateString()}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment Method
            </span>
            <span className="font-medium">{receipt.paymentMethod}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Recipient
            </span>
            <span className="font-medium">{receipt.recipientChurch}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Reference</span>
            <span className="font-mono text-sm">{receipt.referenceNumber}</span>
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground text-center">
            Donor: {receipt.donorName}
          </p>
          <p className="text-xs text-muted-foreground text-center">
            {receipt.donorEmail}
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={handleDownload}>
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={handleEmailReceipt}>
            <Mail className="h-4 w-4" />
            Email
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface DonationHistoryProps {
  receipts: DonationReceipt[];
}

export function DonationHistory({ receipts }: DonationHistoryProps) {
  const totalDonated = receipts.reduce((sum, r) => sum + r.amount, 0);
  const totalCount = receipts.length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Heart className="h-4 w-4" />
              <span className="text-xs">Total Donated</span>
            </div>
            <p className="text-2xl font-bold">
              ${totalDonated.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Receipt className="h-4 w-4" />
              <span className="text-xs">Total Donations</span>
            </div>
            <p className="text-2xl font-bold">{totalCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Recent Donations</h3>
        {receipts.map((receipt) => (
          <Card key={receipt.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{receipt.recipientChurch}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(receipt.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">${receipt.amount}</p>
                <Badge className={`text-xs ${receipt.status === "completed" ? "bg-green-500" : "bg-yellow-500"}`}>
                  {receipt.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
