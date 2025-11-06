import { useQuery } from "@tanstack/react-query";
import { coingeckoApi } from "@/services/coingecko";

/**
 * Search coins by text. Use an empty query to disable.
 */
export function useCoinSearch(query: string | null) {
  return useQuery({
    queryKey: ["coinSearch", query],
    queryFn: async () => {
      if (!query)
        return [] as Array<{ id: string; name: string; symbol: string }>;
      const coins = await coingeckoApi.searchCoins(query);
      return coins.map((c) => ({ id: c.id, name: c.name, symbol: c.symbol }));
    },
    enabled: !!query,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Get single coin market data (including current_price) by coin id.
 */
export function useCoinPrice(coinId: string | null) {
  return useQuery({
    queryKey: ["coinPrice", coinId],
    queryFn: async () => {
      if (!coinId) return null;
      const p = await coingeckoApi.getCoinPrice(coinId);
      return p;
    },
    enabled: !!coinId,
    staleTime: 1000 * 15, // short-lived price
  });
}
