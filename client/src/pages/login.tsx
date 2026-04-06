import { useState } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { apiRoutes } from "@/lib/api-routes";
import { buildApiUrl } from "@/lib/api-config";
import { Helmet } from "react-helmet";
import { useLanguage } from "@/hooks/use-language";
import { setAuthToken } from "@/hooks/use-auth";

type AuthMode = "login" | "signup";

interface AuthFormData {
  email: string;
  password: string;
  name?: string;
}

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<AuthFormData>({
    email: "",
    password: "",
    name: "",
  });
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const endpoint = mode === "login" ? apiRoutes.auth.login : "/api/auth/signup";
      const requestData = mode === "login"
        ? { email: formData.email, password: formData.password }
        : {
            email: formData.email,
            password: formData.password,
            firstName: formData.name?.split(' ')[0] || '',
            lastName: formData.name?.split(' ').slice(1).join(' ') || ''
          };

       const response = await fetch(buildApiUrl(endpoint), {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(requestData),
         credentials: "include",
       });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t("authError"));
      }

      toast({
        title: mode === "login" ? t("welcomeBackTitle") : t("accountCreated"),
        description: mode === "login"
          ? t("signInSuccess")
          : t("accountCreatedSuccess"),
      });

      // Store token for cross-origin auth
      if (data.token) {
        setAuthToken(data.token);
      }
      
      queryClient.setQueryData(["auth", "user"], data);
      navigate("/");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t("authError");
      setError(errorMessage);
      toast({
        title: t("error"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{mode === "login" ? t("signIn") : t("createAccount")} | CHub</title>
      </Helmet>
      <div className="flex min-h-screen">
        {/* Left panel - decorative gradient */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center bg-primary">
          <div className="absolute inset-0 bg-primary" />
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1200&auto=format&fit=crop&q=80"
              alt="Worship"
              className="w-full h-full object-cover opacity-20"
            />
          </div>

          <div className="relative z-10 max-w-md text-center px-8">
            <div className="flex justify-center mb-8">
              <img src="/church_logo.jpeg" alt="CHub" className="h-20 w-auto rounded-3xl ring-4 ring-white/20 shadow-2xl" />
            </div>
            <h2 className="text-4xl font-bold text-white tracking-tight mb-4">
              {t("welcome").split("CHub")[0]}<span className="text-white">CHub</span>
            </h2>
            <p className="text-white/80 text-base leading-relaxed">
              {t("joinCommunityDesc")}
            </p>

            <div className="mt-12 grid grid-cols-3 gap-4">
              {[
                { value: "5000+", label: t("membersCount") },
                { value: "15+", label: t("yearsActive") },
                { value: "50+", label: t("ministries") },
              ].map(({ value, label }) => (
                <div key={label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="text-2xl font-bold text-white">{value}</div>
                  <div className="text-xs text-white/70 font-medium mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel - form */}
        <div className="flex-1 flex flex-col items-center justify-center bg-background px-6 py-10 relative overflow-hidden">

          <div className="w-full max-w-md relative z-10">
            {/* Mobile logo */}
            <div className="lg:hidden flex justify-center mb-8">
              <img src="/church_logo.jpeg" alt="CHub" className="h-14 w-auto rounded-2xl ring-2 ring-primary/10 shadow-lg" />
            </div>

            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground font-[--font-display]">
                {mode === "login" ? t("welcomeBack") : t("createYourAccount")}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {mode === "login"
                  ? t("signInToAccount")
                  : t("joinOurCommunity")}
              </p>
            </div>

            {error && (
              <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-4 mb-6">
                <p className="text-sm font-medium text-destructive">{error}</p>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              {mode === "signup" && (
                <div>
                  <Label htmlFor="name" className="text-sm font-semibold text-foreground/70">{t("fullName")}</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1.5 h-12 rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="John Doe"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="email" className="text-sm font-semibold text-foreground/70">{t("emailAddress")}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1.5 h-12 rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-semibold text-foreground/70">{t("password")}</Label>
                  {mode === "login" && (
                    <a href="#" className="text-sm font-semibold text-primary hover:text-primary/80">
                      {t("forgotPassword")}
                    </a>
                  )}
                </div>
                <div className="mt-1.5 relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={handleChange}
                    className="h-12 rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm pr-10 focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {mode === "signup" && (
                  <p className="mt-1.5 text-xs text-muted-foreground">{t("passwordMinLength")}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-2xl gradient-accent text-primary-foreground font-bold text-base shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === "login" ? t("signingIn") : t("creatingAccount")}
                  </>
                ) : (
                  <>
                    {mode === "login" ? t("signIn") : t("createAccount")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                {mode === "login" ? t("dontHaveAccount") : t("alreadyHaveAccount")}{" "}
                <button
                  type="button"
                  onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); }}
                  className="font-bold text-primary hover:text-primary/80"
                >
                  {mode === "login" ? t("signUp") : t("signIn")}
                </button>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-center text-muted-foreground mb-3">
                Is your church not on our platform yet?
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-2xl font-bold"
                onClick={() => navigate("/register-church")}
              >
                Register Your Church
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
