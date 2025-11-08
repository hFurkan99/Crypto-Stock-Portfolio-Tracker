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

  try {
    const response = await fetch(url);

    if (!response.ok) {
      let errorMessage = `CoinGecko API Error (${response.status})`;

      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = `CoinGecko API: ${errorData.error}`;
        } else if (errorData.status?.error_message) {
          errorMessage = `CoinGecko API: ${errorData.status.error_message}`;
        }
      } catch {
        // If JSON parsing fails, use text
        const errorText = await response.text();
        if (errorText) {
          errorMessage = `CoinGecko API: ${errorText}`;
        }
      }

      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error: Failed to fetch data from CoinGecko");
  }
};

export const coingeckoApi = {
  /**
   * Search coins by query
   */
  searchCoins: async (query: string): Promise<CoinSearchResult[]> => {
    const data = await fetchApi<{ coins: CoinSearchResult[] }>(
      `/search?query=${encodeURIComponent(query)}`
    );
    return data.coins;
  },

  /**
   * Get prices for multiple coins
   */
  getCoinsPrices: async (coinIds: string[]): Promise<CoinPrice[]> => {
    if (coinIds.length === 0) return [];

    const ids = coinIds.join(",");
    // Request additional percentage change fields (7d and 30d) where available
    return fetchApi<CoinPrice[]>(
      `/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=true&price_change_percentage=24h,7d,30d`
    );
  },

  /**
   * Get top markets (by market cap). Pass limit (per_page) and page.
   */
  getTopMarkets: async (limit = 100, page = 1): Promise<CoinPrice[]> => {
    // Request 7d and 30d percentage change values in addition to 24h
    return fetchApi<CoinPrice[]>(
      `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=${page}&sparkline=true&price_change_percentage=24h,7d,30d`
    );
  },

  /**
   * Get single coin price
   */
  getCoinPrice: async (coinId: string): Promise<CoinPrice> => {
    const data = await fetchApi<CoinPrice[]>(
      `/coins/markets?vs_currency=usd&ids=${coinId}&sparkline=true&price_change_percentage=24h,7d,30d`
    );
    return data[0];
  },

  /**
   * Get market chart for a single coin. Returns the raw market_chart JSON.
   * days: 1,7,30 etc.
   */
  getMarketChart: async (coinId: string, days = 7) => {
    return fetchApi<{ prices: [number, number][] }>(
      `/coins/${encodeURIComponent(
        coinId
      )}/market_chart?vs_currency=usd&days=${days}`
    );
  },
};
