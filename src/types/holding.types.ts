export interface Holding {
  id: string; // unique ID (uuid)
  coinId: string; // "bitcoin"
  symbol: string; // "btc"
  name: string; // "Bitcoin"
  amount: number; // 0.5
  buyPrice: number; // 45000
  buyDate: string; // ISO date string
  notes?: string;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}

export interface HoldingWithPrice extends Holding {
  currentPrice: number;
  currentValue: number; // amount * currentPrice
  profitLoss: number; // currentValue - (amount * buyPrice)
  profitLossPercentage: number; // (profitLoss / (amount * buyPrice)) * 100
  priceChange24h: number; // percentage
}
