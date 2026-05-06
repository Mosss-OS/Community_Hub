import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { LuLoader2, LuCheckCircle2, LuGlobe, LuClock, LuDollarSign, LuSave } from 'react-icons/lu';
import { toast } from "sonner";

export default function LanguageSettingsPage() {
  const { 
    language, 
    setLanguage, 
    languages, 
    preferences, 
    updatePreferences,
    supportedTimezones,
    supportedCurrencies,
  } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [selectedTimezone, setSelectedTimezone] = useState(preferences.timezone);
  const [selectedCurrency, setSelectedCurrency] = useState(preferences.currency);

  useEffect(() => {
    setSelectedLanguage(language);
    setSelectedTimezone(preferences.timezone);
    setSelectedCurrency(preferences.currency);
  }, [language, preferences]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);
    
    try {
      await updatePreferences({
        preferredLanguage: selectedLanguage,
        timezone: selectedTimezone,
        currency: selectedCurrency,
      });
      setLanguage(selectedLanguage);
      setSaved(true);
      toast.success("Settings saved successfully!");
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Please log in to manage your settings.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Language & Localization</h1>
        <p className="text-muted-foreground mt-2">
          Customize your language, timezone, and currency preferences
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Language
            </CardTitle>
            <CardDescription>
              Select your preferred language for the interface
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select 
              value={selectedLanguage} 
              onValueChange={(value) => setSelectedLanguage(value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name} ({lang.nativeName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Timezone
            </CardTitle>
            <CardDescription>
              Set your timezone for accurate scheduling and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select 
              value={selectedTimezone} 
              onValueChange={setSelectedTimezone}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {supportedTimezones.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Currency
            </CardTitle>
            <CardDescription>
              Select your preferred currency for donations and payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select 
              value={selectedCurrency} 
              onValueChange={setSelectedCurrency}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {supportedCurrencies.map((curr) => (
                  <SelectItem key={curr} value={curr}>
                    {curr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="w-full"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
