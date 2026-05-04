import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Donation, DonationStatement } from "@/types/api";

export function useDonationHistory(year?: number) {
  return useQuery<Donation[]>({
    queryKey: ["/api/donations/history", year],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/donations/history${year ? `?year=${year}` : ""}`);
      return response.json();
    },
  });
}

export function useDonationStatement(year: number) {
  return useQuery<DonationStatement>({
    queryKey: ["/api/donations/statement", year],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/donations/statement/${year}`);
      return response.json();
    },
    enabled: !!year,
  });
}
