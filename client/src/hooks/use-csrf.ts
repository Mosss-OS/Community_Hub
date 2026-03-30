import { useState, useEffect } from "react";
import { buildApiUrl } from "@/lib/api-config";

export function useCsrfToken() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getToken = async () => {
      // First try to get from cookie
      let token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrf_token="))
        ?.split("=")[1];

      // If not in cookie, fetch from server
      if (!token) {
        try {
          const response = await fetch(buildApiUrl("/api/csrf-token"), {
            credentials: "include",
          });
          const data = await response.json();
          token = data.csrfToken;
        } catch (err) {
          console.error("Failed to get CSRF token:", err);
        }
      }

      setCsrfToken(token || null);
      setIsLoading(false);
    };

    getToken();
  }, []);

  return { csrfToken, isLoading };
}
