const TOKEN_KEY = 'auth_token';

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function authFetch(url: string, options: FetchOptions = {}): Promise<Response> {
  const { skipAuth, ...fetchOptions } = options;
  
  const headers: Record<string, string> = {
    ...(fetchOptions.headers as Record<string, string> || {}),
  };
  
  // Add Content-Type for POST/PUT/PATCH if not explicitly set
  if (!skipAuth && !headers["Content-Type"] && ["POST", "PUT", "PATCH"].includes(fetchOptions.method || "")) {
    headers["Content-Type"] = "application/json";
  }
  
  // Add auth header if not skipped
  if (!skipAuth) {
    const token = getStoredToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  
  return fetch(url, {
    ...fetchOptions,
    headers,
    credentials: "include",
  });
}
