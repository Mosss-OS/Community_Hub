import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
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
  
  const url = buildApiUrl(apiRoutes.auth.user);
  console.log('[Auth] Fetching user from:', url);
  
  try {
    const response = await fetch(url, {
      credentials: "include",
      headers,
    });

    console.log('[Auth] Response status:', response.status);

    if (response.status === 401) {
      console.log('[Auth] Got 401, returning null');
      setStoredToken(null);
      return null;
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('[Auth] Error response:', errorText);
      throw new Error(`${response.status}: ${response.statusText}`);
    }

    const user = await response.json();
    console.log('[Auth] Got user:', user);
    return user;
  } catch (error) {
    console.error('[Auth] Fetch error:', error);
    throw error;
  }
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["auth", "user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  console.log('[useAuth] Query result:', { user, isLoading, error });
  
  if (error) {
    console.error('[useAuth] Query error:', error);
  }
  
  if (!isLoading && !user && !error) {
    console.log('[useAuth] User is null, not authenticated');
  }
  
  // Add a timeout to help debug if query is stuck
  React.useEffect(() => {
    console.log('[useAuth] Effect running, isLoading:', isLoading);
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log('[useAuth] Still loading after 5 seconds - query might be stuck');
      }
    }, 5000);
    
    return () => {
      console.log('[useAuth] Cleaning up effect');
      clearTimeout(timeout);
    };
  }, [isLoading]);

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
