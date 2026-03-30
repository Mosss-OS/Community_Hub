import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
// @ts-ignore
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateDonation } from "@/hooks/use-donations";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Heart, CreditCard, ShieldCheck, Target, Loader2, Calendar, TrendingUp } from "lucide-react";
import { buildApiUrl } from "@/lib/api-config";
import { useLanguage } from "@/hooks/use-language";

const donationFormSchema = z.object({
  amount: z.coerce.number().min(1, "Minimum donation is $1"),
});

interface FundraisingCampaign {
  id: number; title: string; description: string | null; goalAmount: number;
  currentAmount: number; imageUrl: string | null; startDate: string | null;
  endDate: string | null; isActive: boolean;
}

interface Donation {
  id: number; amount: number; status: string; createdAt: string; isRecurring?: boolean;
  recurringFrequency?: string; recurringActive?: boolean; nextDonationDate?: string;
}

const formatCurrency = (cents: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return 'Ongoing';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getRecurringImpact = (amount: number, frequency: string) => {
  const yearly = frequency === 'weekly' ? amount * 52 : frequency === 'biweekly' ? amount * 26 : amount * 12;
  return { monthly: amount, yearly };
};

export default function GivePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { mutate: donate, isPending } = useCreateDonation();
  const [givingType, setGivingType] = useState("one-time");
  const [recurringFrequency, setRecurringFrequency] = useState<"weekly" | "biweekly" | "monthly">("monthly");
  const [campaigns, setCampaigns] = useState<FundraisingCampaign[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [loadingDonations, setLoadingDonations] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const res = await fetch(buildApiUrl("/api/fundraising?active=true"), { credentials: "include" });
        if (res.ok) setCampaigns(await res.json());
      } catch (err) { console.error("Error fetching campaigns:", err); }
      finally { setLoadingCampaigns(false); }
    }
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (!user) return;
    async function fetchDonations() {
      setLoadingDonations(true);
      try {
        const res = await fetch(buildApiUrl("/api/donations/history"), { credentials: "include" });
        if (res.ok) setDonations(await res.json());
      } catch (err) { console.error("Error fetching donations:", err); }
      finally { setLoadingDonations(false); }
    }
    fetchDonations();
  }, [user]);

  const form = useForm<{ amount: number }>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: { amount: 50 },
  });

  const onSubmit = (data: { amount: number }) => {
    const payload: any = {
      amount: Math.round(data.amount * 100), currency: "usd", status: "succeeded",
      userId: user?.id || null, campaignId: selectedCampaign,
    };
    
    if (givingType === "recurring") {
      payload.isRecurring = true;
      payload.recurringFrequency = recurringFrequency;
      const nextDate = new Date();
      if (recurringFrequency === "weekly") nextDate.setDate(nextDate.getDate() + 7);
      else if (recurringFrequency === "biweekly") nextDate.setDate(nextDate.getDate() + 14);
      else nextDate.setMonth(nextDate.getMonth() + 1);
      payload.nextDonationDate = nextDate.toISOString();
      payload.recurringActive = true;
    }
    
    donate(payload, {
      onSuccess: () => {
        toast({ title: t("thankYou"), description: givingType === "recurring" ? "Your recurring donation has been set up!" : t("donationSuccess") });
        form.reset();
        if (selectedCampaign) {
          setCampaigns(prev => prev.map(c =>
            c.id === selectedCampaign ? { ...c, currentAmount: c.currentAmount + Math.round(data.amount * 100) } : c
          ));
        }
      },
      onError: () => {
        toast({ title: t("error"), description: t("donationError"), variant: "destructive" });
      },
    });
  };

  const predefinedAmounts = [25, 50, 100, 250, 500];

  return (
    <div className="min-h-screen bg-background pb-10 sm:pb-16 md:pb-24">
      {/* Hero */}
      <div className="relative py-12 sm:py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0">
          <img src="/card-verticle.avif" alt="Background" className="w-full h-full object-cover opacity-10" />
        </div>
        <div className="orb orb-gold w-48 sm:w-80 h-48 sm:h-80 top-0 right-0 animate-float" />
        <div className="orb orb-purple w-32 sm:w-56 h-32 sm:h-56 bottom-10 left-10" style={{ animationDelay: '2s' }} />
        <div className="container px-4 sm:px-6 md:px-8 text-center relative z-10">
          <span className="text-accent font-bold text-xs sm:text-sm uppercase tracking-wider mb-2 sm:mb-4 block">{t("generosity")}</span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-6 text-white font-[--font-display] tracking-tight">
            {t("giveGenerously")} <span className="text-gradient-gold">{t("generouslyHighlight")}</span>
          </h1>
          <p className="text-xs sm:text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-2 sm:mb-4">
            {t("giveVerse")}
          </p>
          <p className="text-white/25 text-[10px] sm:text-sm font-medium">{t("giveVerseRef")}</p>
        </div>
      </div>

      <div className="container px-4 sm:px-6 md:px-10 mt-6 sm:mt-12 md:mt-20 relative z-10">
        <Tabs defaultValue="give" className="space-y-5 sm:space-y-8">
          <TabsList className="grid w-full grid-cols-3 glass-card-strong rounded-xl sm:rounded-2xl p-1 sm:p-1.5 h-auto">
            <TabsTrigger value="give" className="rounded-lg sm:rounded-xl font-semibold py-1.5 sm:py-2.5 text-xs sm:text-sm data-[state=active]:shadow-lg">{t("give")}</TabsTrigger>
            <TabsTrigger value="campaigns" className="rounded-lg sm:rounded-xl font-semibold py-1.5 sm:py-2.5 text-xs sm:text-sm data-[state=active]:shadow-lg">
              <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> {t("campaigns")}
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg sm:rounded-xl font-semibold py-1.5 sm:py-2.5 text-xs sm:text-sm data-[state=active]:shadow-lg">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> {t("history")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="give" className="space-y-5 sm:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 md:gap-10">
              <div className="lg:col-span-7">
                <div className="glass-card-strong rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
                  <div className="p-4 sm:p-8">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-[--font-display] mb-1 sm:mb-2">{t("makeADonation")}</h2>
                    <p className="text-muted-foreground text-xs sm:text-base mb-4 sm:mb-6">{t("secureSimple")}</p>

                    <Tabs defaultValue="one-time" onValueChange={setGivingType}>
                      <TabsList className="grid w-full grid-cols-2 mb-5 sm:mb-8 rounded-xl sm:rounded-2xl bg-muted/50 p-1">
                        <TabsTrigger value="one-time" className="rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm">{t("oneTime")}</TabsTrigger>
                        <TabsTrigger value="recurring" className="rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm">{t("recurring")}</TabsTrigger>
                      </TabsList>
                      {givingType === "recurring" && (
                        <div className="mb-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
                          <div className="flex flex-wrap gap-2 mb-4">
                            {(["weekly", "biweekly", "monthly"] as const).map((freq) => (
                              <Button key={freq} type="button" variant={recurringFrequency === freq ? "default" : "outline"} size="sm" onClick={() => setRecurringFrequency(freq)} className="rounded-lg">
                                {freq === "weekly" ? "Weekly" : freq === "biweekly" ? "Bi-weekly" : "Monthly"}
                              </Button>
                            ))}
                          </div>
                          {form.watch("amount") > 0 && (() => {
                            const impact = getRecurringImpact(form.watch("amount"), recurringFrequency);
                            return (
                              <div className="text-sm text-muted-foreground">
                                <p className="font-medium text-foreground mb-2">Impact of your recurring gift:</p>
                                <p>Monthly: <span className="font-bold text-foreground">{formatCurrency(impact.monthly * 100)}</span></p>
                                <p>Yearly: <span className="font-bold text-foreground">{formatCurrency(impact.yearly * 100)}</span></p>
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2 md:gap-3 mb-4 sm:mb-6">
                            {predefinedAmounts.map((amt) => (
                              <Button
                                key={amt}
                                type="button"
                                variant={form.watch("amount") === amt ? "default" : "outline"}
                                onClick={() => form.setValue("amount", amt)}
                                className={`h-9 sm:h-12 text-xs sm:text-base rounded-xl sm:rounded-2xl font-bold ${form.watch("amount") === amt ? "gradient-accent text-primary-foreground shadow-lg shadow-primary/20" : "border-border/50 bg-card/50"}`}
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
                                <FormLabel className="font-semibold text-foreground/70">{t("customAmount")}</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                                    <Input type="number" className="pl-9 text-lg h-12 rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm" {...field} />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button
                            type="submit"
                            size="lg"
                            className="w-full text-base h-14 rounded-2xl gradient-accent text-primary-foreground font-bold shadow-xl shadow-primary/20 hover:shadow-2xl hover:-translate-y-0.5 transition-all"
                            disabled={isPending}
                          >
                            {isPending ? t("processing") : `${t("give")} $${form.watch("amount") || 0} ${givingType === "recurring" ? t("monthly") : t("giveNow")}`}
                          </Button>
                        </form>
                      </Form>

                      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        <span>{t("secureEncryption")}</span>
                      </div>
                    </Tabs>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-6">
                <div className="glass-card rounded-3xl p-6 shimmer-border">
                  <h3 className="text-base font-bold mb-3 flex items-center gap-2 font-[--font-display]">
                    <Heart className="w-5 h-5 text-primary" /> {t("whyWeGive")}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {t("whyWeGiveDesc")}
                  </p>
                </div>

                <div className="glass-card rounded-3xl p-6 shimmer-border">
                  <h3 className="text-base font-bold mb-3 flex items-center gap-2 font-[--font-display]">
                    <CreditCard className="w-5 h-5 text-accent" /> {t("otherWaysToGive")}
                  </h3>
                  <ul className="space-y-2.5 text-muted-foreground text-sm">
                    <li>• {t("textToGive") || 'Text "GIVE" to 555-1234'}</li>
                    <li>• {t("mailChecks") || "Mail checks to 123 Faith Ave"}</li>
                    <li>• {t("sundayOffering") || "Drop in offering buckets on Sunday"}</li>
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
              <div className="glass-card rounded-3xl p-12 text-center">
                <Target className="h-12 w-12 mx-auto text-muted-foreground/20 mb-4" />
                <p className="text-muted-foreground">{t("noCampaigns")}</p>
                <p className="text-sm text-muted-foreground mt-2">{t("checkBackSoon")}</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {campaigns.map((campaign) => {
                  const progress = campaign.goalAmount > 0 ? Math.min((campaign.currentAmount / campaign.goalAmount) * 100, 100) : 0;
                  return (
                    <div key={campaign.id} className="glass-card-strong rounded-3xl overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-1">
                      {campaign.imageUrl && (
                        <div className="h-48 overflow-hidden">
                          <img src={campaign.imageUrl} alt={campaign.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="p-6 space-y-4">
                        <h3 className="text-lg font-bold font-[--font-display]">{campaign.title}</h3>
                        {campaign.description && <p className="text-sm text-muted-foreground">{campaign.description}</p>}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t("raised")}</span>
                            <span className="font-bold text-primary">{formatCurrency(campaign.currentAmount)}</span>
                          </div>
                          <div className="h-3 bg-muted/50 rounded-full overflow-hidden">
                            <div className="h-full gradient-accent rounded-full transition-all" style={{ width: `${progress}%` }} />
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t("goal")}</span>
                            <span className="font-bold">{formatCurrency(campaign.goalAmount)}</span>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-1.5" />
                          <span>{t("ends")} {formatDate(campaign.endDate)}</span>
                        </div>
                        <Button
                          className={`w-full rounded-2xl font-bold ${selectedCampaign === campaign.id ? "gradient-accent text-primary-foreground shadow-lg" : "border-border/50"}`}
                          variant={selectedCampaign === campaign.id ? "default" : "outline"}
                          onClick={() => setSelectedCampaign(campaign.id)}
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          {selectedCampaign === campaign.id ? t("selected") : t("giveToCampaign")}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            {!user ? (
              <div className="glass-card rounded-3xl p-12 text-center"><p className="text-muted-foreground">{t("loginToViewHistory")}</p></div>
            ) : loadingDonations ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
              <>
                {donations.filter(d => d.isRecurring && d.recurringActive).length > 0 && (
                  <div className="glass-card-strong rounded-3xl overflow-hidden border-l-4 border-l-green-500">
                    <div className="p-6 border-b border-border/20 bg-green-500/5">
                      <h3 className="text-xl font-bold font-[--font-display] flex items-center gap-2"><TrendingUp className="h-5 w-5 text-green-600" /> Active Recurring Donations</h3>
                      <p className="text-muted-foreground text-sm mt-1">Manage your scheduled giving</p>
                    </div>
                    <div className="p-4 space-y-3">
                      {donations.filter(d => d.isRecurring && d.recurringActive).map((donation) => (
                        <div key={donation.id} className="flex items-center justify-between p-4 glass-card rounded-2xl">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-foreground">{formatCurrency(donation.amount)}</p>
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium capitalize">
                                {donation.recurringFrequency?.replace("_", " ")}
                              </span>
                            </div>
                            {donation.nextDonationDate && (
                              <p className="text-sm text-muted-foreground">
                                Next: {new Date(donation.nextDonationDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <Button variant="outline" size="sm" className="text-destructive border-destructive/50 hover:bg-destructive/10" onClick={async () => {
                            if (confirm("Are you sure you want to cancel this recurring donation?")) {
                              await fetch(buildApiUrl(`/api/donations/${donation.id}/cancel`), { method: "POST", credentials: "include" });
                              toast({ title: "Recurring donation cancelled" });
                              window.location.reload();
                            }
                          }}>
                            Cancel
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {donations.filter(d => !d.isRecurring).length > 0 ? (
                  <div className="glass-card-strong rounded-3xl overflow-hidden">
                    <div className="p-6 border-b border-border/20">
                      <h3 className="text-xl font-bold font-[--font-display]">{t("donationHistory")}</h3>
                      <p className="text-muted-foreground text-sm mt-1">{t("thankYouGenerosity")}</p>
                    </div>
                    <div className="p-4 space-y-3">
                      {donations.filter(d => !d.isRecurring).map((donation) => (
                        <div key={donation.id} className="flex items-center justify-between p-4 glass-card rounded-2xl hover:shadow-md transition-all">
                          <div>
                            <p className="font-bold text-foreground">{formatCurrency(donation.amount)}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(donation.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            donation.status === 'succeeded' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                          }`}>
                            {donation.status === 'succeeded' ? t("completed") : donation.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : donations.filter(d => d.isRecurring && d.recurringActive).length === 0 ? (
                  <div className="glass-card rounded-3xl p-12 text-center"><Heart className="h-12 w-12 mx-auto text-muted-foreground/20 mb-4" /><p className="text-muted-foreground">{t("noDonations")}</p></div>
                ) : null}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
