export interface Coin {
  id: string; // "bitcoin"
  symbol: string; // "btc"
  name: string; // "Bitcoin"
  image?: string;
}

export interface CoinPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  price_change_percentage_30d_in_currency?: number;
  market_cap: number;
  total_volume: number;
  image: string;
  sparkline_in_7d?: {
    price: number[];
  };
}

export interface CoinSearchResult {
  id: string;
  name: string;
  symbol: string;
  thumb: string; // small image
  large: string; // large image
}
