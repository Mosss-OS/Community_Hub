import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { buildApiUrl } from "@/lib/api-config";
import { authFetch } from "@/lib/auth-fetch";

interface BrandingColors {
  primary: string;
  secondary: string;
  accent: string;
}

interface BrandingFonts {
  heading: string;
  body: string;
}

export interface Branding {
  id: number;
  colors: BrandingColors;
  logoUrl: string | null;
  faviconUrl: string | null;
  fonts: BrandingFonts;
  churchName: string | null;
  churchAddress: string | null;
  churchCity: string | null;
  churchState: string | null;
  churchCountry: string | null;
  churchZipCode: string | null;
  churchPhone: string | null;
  churchEmail: string | null;
  churchLatitude: string | null;
  churchLongitude: string | null;
  serviceTimes: { sunday: string; wednesday: string; friday: string } | null;
  youtubeUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
}

export function useBranding() {
  return useQuery({
    queryKey: ["/api/branding"],
    queryFn: async (): Promise<Branding> => {
      const res = await authFetch(buildApiUrl("/api/branding"), { skipAuth: true });
      if (res.status === 404) {
        // Return default branding if not found
        return {
          id: 0,
          colors: { primary: "#3b82f6", secondary: "#ffffff", accent: "#10b981" },
          logoUrl: null,
          faviconUrl: null,
          fonts: { heading: "Inter", body: "Inter" },
          churchName: null,
          churchAddress: null,
          churchCity: null,
          churchState: null,
          churchCountry: null,
          churchZipCode: null,
          churchPhone: null,
          churchEmail: null,
          churchLatitude: null,
          churchLongitude: null,
          serviceTimes: null,
          youtubeUrl: null,
          instagramUrl: null,
          facebookUrl: null,
          twitterUrl: null,
        };
      }
      if (!res.ok) throw new Error("Failed to fetch branding");
      return res.json();
    },
  });
}

export function useUpdateBranding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Branding>): Promise<Branding> => {
      const res = await authFetch(buildApiUrl("/api/branding"), {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update branding");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/branding"] });
    },
  });
}
