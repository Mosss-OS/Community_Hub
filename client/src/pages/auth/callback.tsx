import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { apiRoutes } from "@/lib/api-routes";
import { buildApiUrl } from "@/lib/api-config";
import { Helmet } from "react-helmet";

export default function AuthCallbackPage() {
  const [location, navigate] = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const completeAuth = async () => {
      try {
        const response = await fetch(buildApiUrl(apiRoutes.auth.user), {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Authentication failed");
        }

        navigate("/");
      } catch (err) {
        console.error("Authentication error:", err);
        setError("Failed to authenticate. Please try signing in again.");
      }
    };

    completeAuth();
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Helmet>
        <title>Signing in... | Winners Chapel Lagos</title>
      </Helmet>
      <div className="flex flex-col items-center space-y-4">
        {error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Completing sign in...</p>
          </>
        )}
      </div>
    </div>
  );
}