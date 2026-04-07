import { useState } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
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
        throw new Error(data.message || "Authentication failed");
      }

      toast({
        title: mode === "login" ? "Welcome back!" : "Account created!",
        description: mode === "login" ? "You've signed in successfully." : "Your account has been created.",
      });

      if (data.token) {
        setAuthToken(data.token);
      }
      
      queryClient.setQueryData(["auth", "user"], data);
      navigate("/");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast({
        title: "Error",
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
        <title>{mode === "login" ? "Sign in" : "Sign up"} | CHub</title>
      </Helmet>
      <div className="flex min-h-screen w-full">
        {/* Left panel - Locus Style */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center bg-primary">
          <div className="absolute inset-0 bg-[#4101f6]" />
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1200&auto=format&fit=crop&q=80"
              alt="Worship"
              className="w-full h-full object-cover opacity-20"
            />
          </div>

          <div className="relative z-10 max-w-md text-center px-8">
            <div className="flex justify-center mb-8">
              <img src="/church_logo.jpeg" alt="CHub" className="h-20 w-auto" />
            </div>
            <h2 className="text-4xl font-light text-white tracking-[-0.02em] mb-4">
              CHub
            </h2>
            <p className="text-white/80 text-base leading-relaxed">
              Join our church community. Connect, grow, and serve together.
            </p>

            <div className="mt-12 grid grid-cols-3 gap-4">
              {[
                { value: "5000+", label: "Members" },
                { value: "15+", label: "Years" },
                { value: "50+", label: "Ministries" },
              ].map(({ value, label }) => (
                <div key={label} className="bg-white/10 p-4">
                  <div className="text-2xl font-light text-white">{value}</div>
                  <div className="text-xs text-white/70 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel - form - Locus Style */}
        <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-10">

          <div className="w-full max-w-sm">
            {/* Mobile logo */}
            <div className="lg:hidden flex justify-center mb-8">
              <img src="/church_logo.jpeg" alt="CHub" className="h-14 w-auto" />
            </div>

            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-light tracking-tight text-[#1b1b1c]">
                {mode === "login" ? "Welcome back" : "Create account"}
              </h2>
              <p className="mt-2 text-sm text-[#505153]">
                {mode === "login" 
                  ? "Enter your details to sign in" 
                  : "Enter your details to get started"}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 p-4 mb-6">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              {mode === "signup" && (
                <div>
                  <Label htmlFor="name" className="text-sm text-[#505153]">Full name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1.5 h-10 border border-[#e5e5e5] focus:border-primary focus:ring-0"
                    placeholder="John Doe"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="email" className="text-sm text-[#505153]">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1.5 h-10 border border-[#e5e5e5] focus:border-primary focus:ring-0"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm text-[#505153]">Password</Label>
                  {mode === "login" && (
                    <a href="#" className="text-xs text-primary hover:underline">
                      Forgot password?
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
                    className="h-10 border border-[#e5e5e5] focus:border-primary focus:ring-0 pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#a0a0a0]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {mode === "signup" && (
                  <p className="mt-1.5 text-xs text-[#a0a0a0]">Minimum 6 characters</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 md:py-3 bg-primary text-white text-[13px] md:text-[14px] font-light hover:bg-[#3400c8] transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === "login" ? "Signing in..." : "Creating account..."}
                  </>
                ) : (
                  <>
                    {mode === "login" ? "Sign in" : "Create account"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-[#505153]">
                {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); }}
                  className="text-primary hover:underline"
                >
                  {mode === "login" ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-[#e5e5e5]">
              <p className="text-sm text-center text-[#a0a0a0] mb-3">
                Is your church not on our platform yet?
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full border border-primary text-primary hover:bg-[#f8f6ff]"
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
