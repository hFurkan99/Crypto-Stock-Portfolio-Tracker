import type { Holding } from "@/types/holding.types";
import type { CoinPrice } from "@/types/coin.types";
import HoldingRow from "./HoldingRow";

type Grouped = {
  coinId: string;
  symbol: string;
  name: string;
  totalAmount: number;
  avgBuyPrice: number;
  holdings: Holding[];
};

export default function HoldingsTable({
  holdings,
  onBuy,
  onSell,
  onShowHistory,
  pricesData = [],
}: {
  holdings: Holding[];
  onBuy: (g: Grouped) => void;
  onSell: (g: Grouped) => void;
  onShowHistory?: (coinId: string) => void;
  pricesData?: CoinPrice[];
}) {
  // group holdings by coinId and compute total amount & weighted average buy price
  const map = new Map<string, Grouped>();

  for (const h of holdings) {
    const existing = map.get(h.coinId);
    if (!existing) {
      map.set(h.coinId, {
        coinId: h.coinId,
        symbol: h.symbol,
        name: h.name,
        totalAmount: h.amount,
        avgBuyPrice: h.buyPrice,
        holdings: [h],
      });
    } else {
      const totalCost =
        existing.avgBuyPrice * existing.totalAmount + h.buyPrice * h.amount;
      const totalAmount = existing.totalAmount + h.amount;
      existing.totalAmount = totalAmount;
      existing.avgBuyPrice = totalCost / totalAmount;
      existing.holdings.push(h);
    }
  }

  const groups = Array.from(map.values());

  return (
    <div className="space-y-3">
      {groups.map((g) => {
        // compute coin-specific metrics
        const priceObj = pricesData.find((p) => p.id === g.coinId);
        const currentPrice = priceObj?.current_price ?? null;
        const priceChange24h = priceObj?.price_change_percentage_24h ?? null;
        const costBasis = g.holdings.reduce(
          (s, h) => s + h.amount * h.buyPrice,
          0
        );
        const currentValue = (currentPrice ?? g.avgBuyPrice) * g.totalAmount;
        const profitLoss = currentValue - costBasis;
        const profitLossPct =
          costBasis === 0 ? 0 : (profitLoss / costBasis) * 100;

        return (
          <HoldingRow
            key={g.coinId}
            grouped={g}
            onBuy={() => onBuy(g)}
            onSell={() => onSell(g)}
            onShowHistory={(coinId) => onShowHistory && onShowHistory(coinId)}
            currentPrice={currentPrice ?? undefined}
            priceChange24h={priceChange24h ?? undefined}
            profitLoss={profitLoss}
            profitLossPct={profitLossPct}
            coinImage={priceObj?.image}
          />
        );
      })}
    </div>
  );
}
