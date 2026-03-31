import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function LogoutPage() {
  const [, navigate] = useLocation();
  const { logout, isLoggingOut } = useAuth();

  useEffect(() => {
    if (!isLoggingOut) {
      logout();
    }
  }, [logout, isLoggingOut]);

  useEffect(() => {
    if (!isLoggingOut) {
      navigate("/login");
    }
  }, [isLoggingOut, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Logging out...</p>
      </div>
    </div>
  );
}
