import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@/types/api";
import { buildApiUrl } from "@/lib/api-config";
import { apiRoutes } from "@/lib/api-routes";

const TOKEN_KEY = 'auth_token';

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

function setStoredToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function setAuthToken(token: string | null) {
  setStoredToken(token);
}

export function getAuthHeader(): string | null {
  const token = getStoredToken();
  return token ? `Bearer ${token}` : null;
}

async function fetchUser(): Promise<User | null> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const response = await fetch(buildApiUrl(apiRoutes.auth.user), {
    credentials: "include",
    headers,
  });

  if (response.status === 401) {
    setStoredToken(null);
    return null;
  }

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["auth", "user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      queryClient.setQueryData(["auth", "user"], null);
      setStoredToken(null);
      try {
        await fetch(buildApiUrl(apiRoutes.auth.logout), {
          method: "POST",
          credentials: "include",
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
      queryClient.clear();
    },
    retry: false,
    onSuccess: () => {
      window.location.href = "/login";
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
    refetch: () => queryClient.invalidateQueries({ queryKey: ["auth", "user"] }),
  };
}
