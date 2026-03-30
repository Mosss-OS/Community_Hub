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
  
  // Note: Authentication is handled via httpOnly cookies, so we don't add an Authorization header.
  // The cookie will be sent automatically because we are using credentials: "include".
  
  return fetch(url, {
    ...fetchOptions,
    headers,
    credentials: "include",
  });
}
