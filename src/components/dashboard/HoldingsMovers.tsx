import type { Holding } from "@/types/holding.types";
import type { CoinPrice } from "@/types/coin.types";
import formatCurrency from "@/utils/formatCurrency";
import { useTranslation } from "@/lib/useTranslation";

export default function HoldingsMovers({
  period,
  setPeriod,
  holdings,
  pricesData,
}: {
  period: "1d" | "7d" | "30d";
  setPeriod: (p: "1d" | "7d" | "30d") => void;
  holdings: Holding[];
  pricesData?: CoinPrice[] | null;
}) {
  const { t } = useTranslation();
  // aggregate holdings by coinId and compute user-level totals (amount, totalCost, avgBuyPrice)
  const agg = new Map<
    string,
    {
      coinId: string;
      name: string;
      symbol: string;
      amount: number;
      totalCost: number;
      avgBuyPrice: number;
    }
  >();

  for (const h of holdings) {
    const existing = agg.get(h.coinId);
    if (existing) {
      existing.amount += h.amount;
      existing.totalCost += h.amount * h.buyPrice;
      existing.avgBuyPrice = existing.totalCost / existing.amount;
    } else {
      agg.set(h.coinId, {
        coinId: h.coinId,
        name: h.name,
        symbol: h.symbol,
        amount: h.amount,
        totalCost: h.amount * h.buyPrice,
        avgBuyPrice: h.buyPrice,
      });
    }
  }

  // Build rows with user-level P/L (like HoldingRow): profit relative to user's avg buy price
  const rows = Array.from(agg.values()).map((a) => {
    const p = pricesData?.find((x) => x.id === a.coinId);
    const current = p?.current_price ?? 0;

    const currentValue = current * a.amount;
    const profitUSD = currentValue - a.totalCost;
    const profitPct =
      a.totalCost > 0 ? (profitUSD / a.totalCost) * 100 : undefined;

    return {
      ...a,
      current,
      totalCost: a.totalCost,
      avgBuyPrice: a.avgBuyPrice,
      profitUSD,
      profitPct,
    };
  });

  // Filter by user-level USD profit/loss and sort by USD amount (descending for gainers,
  // ascending for losers) so we show how much you gained/lost in USD over the period.
  const gainers = [...rows]
    .filter((r) => r.profitUSD !== undefined && r.profitUSD > 0)
    .sort((a, b) => (b.profitUSD ?? 0) - (a.profitUSD ?? 0))
    .slice(0, 5);
  const losers = [...rows]
    .filter((r) => r.profitUSD !== undefined && r.profitUSD < 0)
    .sort((a, b) => (a.profitUSD ?? 0) - (b.profitUSD ?? 0))
    .slice(0, 5);

  return (
    <div className="border border-border/50 rounded-2xl p-4 sm:p-6 bg-card/50 backdrop-blur-sm shadow-xl shadow-primary/5 hover:shadow-accent/10 transition-all duration-300">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-linear-to-r from-primary/10 to-accent/10 border border-primary/20">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          <span className="font-semibold text-sm sm:text-base bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
            {t("dashboard.holdingsMovers")}
          </span>
        </div>
        <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-lg border border-border/50">
          <button
            onClick={() => setPeriod("1d")}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
              period === "1d"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                : "hover:bg-muted/50"
            }`}
          >
            1d
          </button>
          <button
            onClick={() => setPeriod("7d")}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
              period === "7d"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                : "hover:bg-muted/50"
            }`}
          >
            7d
          </button>
          <button
            onClick={() => setPeriod("30d")}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
              period === "30d"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                : "hover:bg-muted/50"
            }`}
          >
            30d
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-3">
          <div className="font-medium text-sm flex items-center gap-2 text-green-600 dark:text-green-400">
            <div className="w-3 h-3 rounded-full bg-green-500/20 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            </div>
            {t("dashboard.holdingsMoversTopProfit")}
          </div>
          {gainers.length === 0 ? (
            <div className="text-sm text-muted-foreground p-4 text-center border border-dashed border-border/50 rounded-lg">
              {t("dashboard.holdingsMoversNoProfitable")}
            </div>
          ) : (
            <ul className="space-y-2">
              {gainers.map((g) => (
                <li
                  key={g.coinId}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/20 hover:bg-green-500/5 border border-border/30 hover:border-green-500/30 transition-all group"
                >
                  <div className="text-sm min-w-0 flex-1">
                    <div className="truncate font-medium">
                      {g.name}{" "}
                      <span className="text-xs text-muted-foreground">
                        ({g.symbol.toUpperCase()})
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {g.amount} {t("common.units")}
                    </div>
                  </div>
                  <div className="text-sm shrink-0">
                    <div className="text-green-600 dark:text-green-400 font-bold">
                      {g.profitUSD != null
                        ? `+${formatCurrency(g.profitUSD, {
                            symbol: "$",
                            maximumFractionDigits: 10,
                          })}`
                        : "—"}
                    </div>
                    {g.profitPct != null ? (
                      <div className="text-xs text-muted-foreground text-right">
                        +{g.profitPct.toFixed(2)}%
                      </div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-3">
          <div className="font-medium text-sm flex items-center gap-2 text-red-600 dark:text-red-400">
            <div className="w-3 h-3 rounded-full bg-red-500/20 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
            </div>
            {t("dashboard.holdingsMoversTopLoss")}
          </div>
          {losers.length === 0 ? (
            <div className="text-sm text-muted-foreground p-4 text-center border border-dashed border-border/50 rounded-lg">
              {t("dashboard.holdingsMoversNoLosing")}
            </div>
          ) : (
            <ul className="space-y-2">
              {losers.map((g) => (
                <li
                  key={g.coinId}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/20 hover:bg-red-500/5 border border-border/30 hover:border-red-500/30 transition-all group"
                >
                  <div className="text-sm min-w-0 flex-1">
                    <div className="truncate font-medium">
                      {g.name}{" "}
                      <span className="text-xs text-muted-foreground">
                        ({g.symbol.toUpperCase()})
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {g.amount} {t("common.units")}
                    </div>
                  </div>
                  <div className="text-sm shrink-0">
                    <div className="text-red-600 dark:text-red-400 font-bold">
                      {g.profitUSD != null
                        ? `${formatCurrency(g.profitUSD, {
                            symbol: "$",
                            maximumFractionDigits: 10,
                          })}`
                        : "—"}
                    </div>
                    {g.profitPct != null ? (
                      <div className="text-xs text-muted-foreground text-right">
                        {g.profitPct.toFixed(2)}%
                      </div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
