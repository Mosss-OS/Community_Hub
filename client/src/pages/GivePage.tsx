import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateDonation } from "@/hooks/use-donations";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Heart, CreditCard, ShieldCheck, Target, Loader2, Calendar, TrendingUp } from "lucide-react";
import { buildApiUrl } from "@/lib/api-config";

const donationFormSchema = z.object({
  amount: z.coerce.number().min(1, "Minimum donation is $1"),
});

interface FundraisingCampaign {
  id: number;
  title: string;
  description: string | null;
  goalAmount: number;
  currentAmount: number;
  imageUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
}

interface Donation {
  id: number;
  amount: number;
  status: string;
  createdAt: string;
}

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return 'Ongoing';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function GivePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { mutate: donate, isPending } = useCreateDonation();
  const [givingType, setGivingType] = useState("one-time");
  const [campaigns, setCampaigns] = useState<FundraisingCampaign[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [loadingDonations, setLoadingDonations] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const res = await fetch(buildApiUrl("/api/fundraising?active=true"), { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setCampaigns(data);
        }
      } catch (err) {
        console.error("Error fetching campaigns:", err);
      } finally {
        setLoadingCampaigns(false);
      }
    }
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    async function fetchDonations() {
      setLoadingDonations(true);
      try {
        const res = await fetch(buildApiUrl("/api/donations/history"), { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setDonations(data);
        }
      } catch (err) {
        console.error("Error fetching donations:", err);
      } finally {
        setLoadingDonations(false);
      }
    }
    fetchDonations();
  }, [user]);

  const form = useForm<{ amount: number }>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: {
      amount: 50,
    },
  });

  const onSubmit = (data: { amount: number }) => {
    const payload = {
      amount: Math.round(data.amount * 100),
      currency: "usd",
      status: "succeeded",
      userId: user?.id || null,
      campaignId: selectedCampaign,
    };

    donate(payload, {
      onSuccess: () => {
        toast({
          title: "Thank You!",
          description: "Your generosity makes a difference.",
        });
        form.reset();
        if (selectedCampaign) {
          setCampaigns(prev => prev.map(c => 
            c.id === selectedCampaign 
              ? { ...c, currentAmount: c.currentAmount + Math.round(data.amount * 100) }
              : c
          ));
        }
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Could not process donation. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  const predefinedAmounts = [25, 50, 100, 250, 500];

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-24">
      <div className="relative py-16 md:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/card-verticle.avif" 
            alt="Background" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-white/40" />
        <div className="container px-6 md:px-8 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-5 md:mb-8 text-gray-900">
            Generosity
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto mb-5">
            "Each of you should give what you have decided in your heart to
            give, not reluctantly or under compulsion, for God loves a cheerful
            giver."
          </p>
          <p className="mt-4 text-gray-600 text-base md:text-lg">2 Corinthians 9:7</p>
        </div>
      </div>

      <div className="container px-6 md:px-8 mt-12 md:mt-20 relative z-10">
        <Tabs defaultValue="give" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="give">Give</TabsTrigger>
            <TabsTrigger value="campaigns">
              <Target className="w-5 h-5 mr-2" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="history">
              <Calendar className="w-5 h-5 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="give" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
              <div className="lg:col-span-7">
                <Card className="shadow-xl border-none">
                  <CardHeader className="pb-5">
                    <CardTitle className="text-2xl md:text-3xl">Make a Donation</CardTitle>
                    <CardDescription className="text-base md:text-lg">
                      Secure, simple, and impactful.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="one-time" onValueChange={setGivingType}>
                      <TabsList className="grid w-full grid-cols-2 mb-8">
                        <TabsTrigger value="one-time" className="text-base md:text-lg">One-Time</TabsTrigger>
                        <TabsTrigger value="recurring" className="text-base md:text-lg">Recurring</TabsTrigger>
                      </TabsList>

                      <Form {...form}>
                        <form
                          onSubmit={form.handleSubmit(onSubmit)}
                          className="space-y-5 md:space-y-6"
                        >
                          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 md:gap-3 mb-4 md:mb-6">
                            {predefinedAmounts.map((amt) => (
                              <Button
                                key={amt}
                                type="button"
                                variant={
                                  form.watch("amount") === amt
                                    ? "default"
                                    : "outline"
                                }
                                onClick={() => form.setValue("amount", amt)}
                                className="h-10 md:h-12 text-sm md:text-lg"
                              >
                                ${amt}
                              </Button>
                            ))}
                          </div>

                          <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm md:text-base">Custom Amount ($)</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                      $
                                    </span>
                                    <Input
                                      type="number"
                                      className="pl-7 md:pl-8 text-base md:text-lg h-10 md:h-12"
                                      {...field}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button
                            type="submit"
                            size="lg"
                            className="w-full text-base md:text-lg h-12 md:h-14"
                            disabled={isPending}
                          >
                            {isPending
                              ? "Processing..."
                              : `Give $${form.watch("amount") || 0} ${givingType === "recurring" ? "Monthly" : "Now"}`}
                          </Button>
                        </form>
                      </Form>

                      <div className="mt-4 md:mt-6 flex items-center justify-center gap-2 text-xs md:text-sm text-muted-foreground">
                        <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span>Secure 256-bit SSL Encryption</span>
                      </div>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-5 space-y-4 md:space-y-6">
                <div className="bg-secondary/50 p-4 md:p-6 rounded-xl border border-border">
                  <h3 className="text-base md:text-xl font-bold mb-2 md:mb-4 flex items-center gap-2">
                    <Heart className="w-4 h-4 md:w-5 md:h-5 text-primary" /> Why We Give
                  </h3>
                  <p className="text-muted-foreground text-sm md:text-base mb-3 md:mb-4">
                    Giving is an act of worship. It's a way to show God that He is
                    first in our lives and to support the work He is doing through
                    our church.
                  </p>
                </div>

                <div className="bg-secondary/50 p-4 md:p-6 rounded-xl border border-border">
                  <h3 className="text-base md:text-xl font-bold mb-2 md:mb-4 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-primary" /> Other Ways to Give
                  </h3>
                  <ul className="space-y-2 md:space-y-3 text-muted-foreground text-sm md:text-base">
                    <li>• Text "GIVE" to 555-1234</li>
                    <li>• Mail checks to 123 Faith Ave</li>
                    <li>• Drop in offering buckets on Sunday</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            {loadingCampaigns ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : campaigns.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No active campaigns at the moment.</p>
                  <p className="text-sm text-muted-foreground mt-2">Check back soon!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {campaigns.map((campaign) => {
                  const progress = campaign.goalAmount > 0 
                    ? Math.min((campaign.currentAmount / campaign.goalAmount) * 100, 100) 
                    : 0;
                  
                  return (
                    <Card key={campaign.id} className="overflow-hidden">
                      {campaign.imageUrl && (
                        <div className="h-48 overflow-hidden">
                          <img 
                            src={campaign.imageUrl} 
                            alt={campaign.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="text-lg">{campaign.title}</CardTitle>
                        {campaign.description && (
                          <CardDescription>{campaign.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Raised</span>
                            <span className="font-medium">{formatCurrency(campaign.currentAmount)}</span>
                          </div>
                          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Goal</span>
                            <span className="font-medium">{formatCurrency(campaign.goalAmount)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Ends {formatDate(campaign.endDate)}</span>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full" 
                          variant={selectedCampaign === campaign.id ? "default" : "outline"}
                          onClick={() => setSelectedCampaign(campaign.id)}
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          {selectedCampaign === campaign.id ? "Selected" : "Give to Campaign"}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            {!user ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">Please log in to view your donation history.</p>
                </CardContent>
              </Card>
            ) : loadingDonations ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : donations.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">You haven't made any donations yet.</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Your Donation History</CardTitle>
                  <CardDescription>Thank you for your generosity!</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {donations.map((donation) => (
                      <div key={donation.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{formatCurrency(donation.amount)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(donation.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          donation.status === 'succeeded' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {donation.status === 'succeeded' ? 'Completed' : donation.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
