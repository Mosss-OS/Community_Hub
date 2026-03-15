// API configuration for different environments

// Get environment variables
const env = (import.meta as any).env || {};

// Use VITE_API_URL if set (full URL), otherwise fall back to relative path
const API_URL = env.VITE_API_URL || env.VITE_API_BASE_URL || '';

// Determine if we're in development mode
const isDev = env.DEV || env.VITE_DEV_MODE === 'true' || window.location.hostname === 'localhost';

// For development, always use localhost:3000
const DEV_API_URL = 'http://localhost:3000';

// Helper function to build API URLs
export function buildApiUrl(path: string): string {
  // If path already starts with http, return as is
  if (path.startsWith('http')) {
    return path;
  }
  
  // In development, use localhost:3000
  if (isDev) {
    return `${DEV_API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  }
  
  // If no base URL is set (same domain deployment), return path as is
  if (!API_URL) {
    return path;
  }
  
  // Combine base URL with path
  const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const apiPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${apiPath}`;
}