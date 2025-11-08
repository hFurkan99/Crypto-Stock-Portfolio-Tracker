import { useQuery } from "@tanstack/react-query";
import { coingeckoApi } from "@/services/coingecko";
import type { CoinPrice } from "@/types/coin.types";

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
    staleTime: 1000 * 60, // 1 dakika - modal'larda kullanılıyor
    refetchOnWindowFocus: false,
  });
}

/**
 * Get prices for multiple coins in one request. More efficient than many single queries.
 */
export function useCoinsPrices(coinIds: string[]) {
  return useQuery<CoinPrice[]>({
    queryKey: ["coinsPrices", ...coinIds.sort()],
    queryFn: async () => {
      if (!coinIds || coinIds.length === 0) return [] as CoinPrice[];
      const data = await coingeckoApi.getCoinsPrices(coinIds);
      return data;
    },
    enabled: coinIds.length > 0,
    staleTime: 1000 * 60 * 2, // 2 dakika - daha az API çağrısı
    gcTime: 1000 * 60 * 5, // Cache'i 5 dakika tut
    refetchOnWindowFocus: false, // Mobilde gereksiz refetch'i engelle
  });
}

/**
 * Get top markets (global coins) by market cap. Useful to compute top gainers/losers across all coins.
 */
export function useTopMarkets(limit = 100, page = 1) {
  return useQuery<CoinPrice[]>({
    queryKey: ["topMarkets", limit, page],
    queryFn: async () => {
      const data = await coingeckoApi.getTopMarkets(limit, page);
      return data;
    },
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5 dakika - top markets sık değişmez
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
}

/**
 * Build an aggregated portfolio series by fetching market_chart for each unique coin in holdings
 * and summing their USD values per timestamp. Returns array of { x: number, y: number } points.
 */
export function usePortfolioSeries(
  holdings: { coinId: string; amount: number }[],
  period: "1d" | "7d" | "30d"
) {
  const coinIds = Array.from(new Set(holdings.map((h) => h.coinId))).sort();
  const days = period === "1d" ? 1 : period === "7d" ? 7 : 30;

  return useQuery({
    queryKey: ["portfolioSeries", ...coinIds, period],
    queryFn: async () => {
      if (coinIds.length === 0) return [] as Array<{ x: number; y: number }>;

      const charts = await Promise.all(
        coinIds.map((id) =>
          coingeckoApi.getMarketChart(id, days).catch(() => ({ prices: [] }))
        )
      );

      const agg = new Map<number, number>();

      for (let i = 0; i < coinIds.length; i++) {
        const id = coinIds[i];
        const amount = holdings
          .filter((h) => h.coinId === id)
          .reduce((s, h) => s + h.amount, 0);
        const chart = charts[i];
        for (const [ts, price] of chart.prices ?? []) {
          const t = Math.floor(ts); // timestamp in ms
          const prev = agg.get(t) ?? 0;
          agg.set(t, prev + price * amount);
        }
      }

      const series = Array.from(agg.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([x, y]) => ({ x, y }));

      return series;
    },
    enabled: coinIds.length > 0,
    staleTime: 1000 * 30,
  });
}
