// API configuration for different environments

// Get environment variables
const env = (import.meta as any).env || {};

// Use VITE_API_URL if set (full URL), otherwise fall back to relative path
const API_URL = env.VITE_API_URL || env.VITE_API_BASE_URL || '';

// Determine if we're in development mode
const isDev = env.DEV || env.VITE_DEV_MODE === 'true' || window.location.hostname === 'localhost' || window.location.hostname.endsWith('.local');

// For development, use relative paths so that it targets the same origin
const DEV_API_URL = '';

// Base domain for multi-tenant subdomains
const BASE_DOMAIN = isDev ? 'chub.local' : 'chub.app';

// Store current organization info
const ORG_INFO_KEY = 'chub_org_info';

// Get current subdomain (e.g., 'grace-chapel' from 'grace-chapel.chub.local')
export function getCurrentSubdomain(): string | null {
  if (typeof window === 'undefined') return null;
  
  const hostname = window.location.hostname;
  
  // Skip if it's localhost or the base domain itself
  if (hostname === 'localhost' || hostname === BASE_DOMAIN || hostname === `localhost:${window.location.port}`) {
    return null;
  }
  
  // Extract subdomain (first part before base domain)
  const parts = hostname.split('.');
  if (parts.length >= 2 && (parts[parts.length - 1] === 'local' || parts[parts.length - 1] === BASE_DOMAIN)) {
    return parts[0];
  }
  
  // For development with .local TLD
  if (hostname.endsWith('.local') && parts.length >= 3) {
    return parts[0];
  }
  
  return null;
}

// Get current organization info from storage
export function getStoredOrgInfo(): { slug: string; name: string; id: string } | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(ORG_INFO_KEY);
  return stored ? JSON.parse(stored) : null;
}

// Store organization info
export function setStoredOrgInfo(org: { slug: string; name: string; id: string } | null): void {
  if (typeof window === 'undefined') return;
  if (org) {
    localStorage.setItem(ORG_INFO_KEY, JSON.stringify(org));
  } else {
    localStorage.removeItem(ORG_INFO_KEY);
  }
}

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