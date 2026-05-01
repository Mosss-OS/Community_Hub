import { useState } from "react";
import { useLocation } from "wouter";
import { Loader2, ArrowLeft, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { buildApiUrl } from "@/lib/api-config";
import { Helmet } from "react-helmet";

interface ChurchFormData {
  name: string;
  slug: string;
  description: string;
  churchName: string;
  churchEmail: string;
  churchPhone: string;
  churchAddress: string;
  churchCity: string;
  churchState: string;
  churchCountry: string;
}

export default function RegisterChurchPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ChurchFormData>({
    name: "",
    slug: "",
    description: "",
    churchName: "",
    churchEmail: "",
    churchPhone: "",
    churchAddress: "",
    churchCity: "",
    churchState: "",
    churchCountry: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Auto-generate slug from name
    if (name === "name") {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(buildApiUrl("/api/organizations/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to register church");
      }

      toast({
        title: "Registration Submitted!",
        description: "Your church registration has been submitted. We'll contact you shortly.",
      });
      
      setLocation("/");
    } catch (err: any) {
      toast({
        title: "Registration Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Register Your Church | Watchman Lagos</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/10 p-4">
        <div className="w-full max-w-2xl">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mb-6 rounded-xl"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <Card className="rounded-3xl shadow-xl border-0">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Register Your Church</CardTitle>
              <CardDescription className="text-base mt-2">
                Join our platform and manage your church community online
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="churchName">Church Name *</Label>
                    <Input
                      id="churchName"
                      name="churchName"
                      value={formData.churchName}
                      onChange={handleChange}
                      placeholder="e.g., Watchman"
                      required
                      className="rounded-xl h-11"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="name">Organization Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., Watchman Community"
                      required
                      className="rounded-xl h-11"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="slug">Your URL *</Label>
                    <div className="flex items-center rounded-xl border bg-muted/50 h-11">
                      <span className="pl-3 text-muted-foreground text-sm">churches.wccrm.com/</span>
                      <Input
                        id="slug"
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        placeholder="your-church"
                        required
                        className="border-0 bg-transparent rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      This will be your church's unique address on our platform
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Tell us about your church..."
                      className="rounded-xl"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="churchEmail">Email *</Label>
                    <Input
                      id="churchEmail"
                      name="churchEmail"
                      type="email"
                      value={formData.churchEmail}
                      onChange={handleChange}
                      placeholder="church@email.com"
                      required
                      className="rounded-xl h-11"
                    />
                  </div>

                  <div>
                    <Label htmlFor="churchPhone">Phone *</Label>
                    <Input
                      id="churchPhone"
                      name="churchPhone"
                      type="tel"
                      value={formData.churchPhone}
                      onChange={handleChange}
                      placeholder="+234 800 000 0000"
                      required
                      className="rounded-xl h-11"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="churchAddress">Address</Label>
                    <Input
                      id="churchAddress"
                      name="churchAddress"
                      value={formData.churchAddress}
                      onChange={handleChange}
                      placeholder="Church address"
                      className="rounded-xl h-11"
                    />
                  </div>

                  <div>
                    <Label htmlFor="churchCity">City</Label>
                    <Input
                      id="churchCity"
                      name="churchCity"
                      value={formData.churchCity}
                      onChange={handleChange}
                      placeholder="e.g., Lagos"
                      className="rounded-xl h-11"
                    />
                  </div>

                  <div>
                    <Label htmlFor="churchState">State/Region</Label>
                    <Input
                      id="churchState"
                      name="churchState"
                      value={formData.churchState}
                      onChange={handleChange}
                      placeholder="e.g., Lagos"
                      className="rounded-xl h-11"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-2xl gradient-accent text-primary-foreground font-bold text-base shadow-lg mt-6"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Registration"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
