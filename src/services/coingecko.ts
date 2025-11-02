import type { CoinPrice, CoinSearchResult } from "@/types/coin.types";

// Environment variables
const BASE_URL =
  import.meta.env.VITE_COINGECKO_BASE_URL || "https://api.coingecko.com/api/v3";
const DEMO_API_KEY = import.meta.env.VITE_COINGECKO_DEMO_API_KEY || "";
const PRO_API_KEY = import.meta.env.VITE_COINGECKO_PRO_API_KEY || "";

const API_KEY = PRO_API_KEY || DEMO_API_KEY;
const API_KEY_PARAM = PRO_API_KEY ? "x_cg_pro_api_key" : "x_cg_demo_api_key";

if (import.meta.env.DEV) {
  if (PRO_API_KEY) {
    console.log("🚀 CoinGecko: Using Pro API (500 calls/min)");
  } else if (DEMO_API_KEY) {
    console.log("✅ CoinGecko: Using Demo API (50 calls/min)");
  } else {
    console.log("⚠️ CoinGecko: Using Free tier (10-30 calls/min)");
  }
}

const buildUrl = (endpoint: string): string => {
  const url = `${BASE_URL}${endpoint}`;

  if (API_KEY) {
    const separator = endpoint.includes("?") ? "&" : "?";
    return `${url}${separator}${API_KEY_PARAM}=${API_KEY}`;
  }

  return url;
};

const fetchApi = async <T = unknown>(endpoint: string): Promise<T> => {
  const url = buildUrl(endpoint);
  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`CoinGecko API Error (${response.status}): ${errorText}`);
  }

  return response.json();
};

export const coingeckoApi = {
  /**
   * Search coins by query
   */
  searchCoins: async (query: string): Promise<CoinSearchResult[]> => {
    const data = await fetchApi<{ coins: CoinSearchResult[] }>(
      `/search?query=${encodeURIComponent(query)}`
    );
    return data.coins.slice(0, 10); // Limit to 10 results
  },

  /**
   * Get prices for multiple coins
   */
  getCoinsPrices: async (coinIds: string[]): Promise<CoinPrice[]> => {
    if (coinIds.length === 0) return [];

    const ids = coinIds.join(",");
    return fetchApi<CoinPrice[]>(
      `/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=true&price_change_percentage=24h`
    );
  },

  /**
   * Get single coin price
   */
  getCoinPrice: async (coinId: string): Promise<CoinPrice> => {
    const data = await fetchApi<CoinPrice[]>(
      `/coins/markets?vs_currency=usd&ids=${coinId}&sparkline=true&price_change_percentage=24h`
    );
    return data[0];
  },
};
