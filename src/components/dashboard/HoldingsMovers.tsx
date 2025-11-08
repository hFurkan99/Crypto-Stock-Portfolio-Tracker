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
    <div className="border rounded p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
        <div className="font-medium text-sm sm:text-base">
          {t("dashboard.holdingsMovers")} ({period})
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setPeriod("1d")}
            className={`px-2 py-1 rounded text-xs sm:text-sm ${
              period === "1d" ? "bg-gray-200" : ""
            }`}
          >
            1d
          </button>
          <button
            onClick={() => setPeriod("7d")}
            className={`px-2 py-1 rounded text-xs sm:text-sm ${
              period === "7d" ? "bg-gray-200" : ""
            }`}
          >
            7d
          </button>
          <button
            onClick={() => setPeriod("30d")}
            className={`px-2 py-1 rounded text-xs sm:text-sm ${
              period === "30d" ? "bg-gray-200" : ""
            }`}
          >
            30d
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <div className="font-medium text-xs sm:text-sm mb-2">
            {t("dashboard.holdingsMoversTopProfit")}
          </div>
          {gainers.length === 0 ? (
            <div className="text-xs sm:text-sm text-gray-500">
              {t("dashboard.holdingsMoversNoProfitable")}
            </div>
          ) : (
            <ul className="space-y-2">
              {gainers.map((g) => (
                <li
                  key={g.coinId}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="text-xs sm:text-sm min-w-0 flex-1">
                    <div className="truncate">
                      {g.name}{" "}
                      <span className="text-xs text-gray-500">
                        ({g.symbol.toUpperCase()})
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {g.amount} {t("common.units")}
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm text-green-600 shrink-0">
                    {g.profitUSD != null
                      ? `${g.profitUSD >= 0 ? "+" : "-"}${formatCurrency(
                          Math.abs(g.profitUSD),
                          { symbol: "$", maximumFractionDigits: 10 }
                        )}`
                      : "—"}
                    {g.profitPct != null ? (
                      <span className="text-xs text-gray-500">
                        {" "}
                        ({g.profitPct >= 0 ? "+" : ""}
                        {g.profitPct.toFixed(2)}%)
                      </span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <div className="font-medium text-xs sm:text-sm mb-2">
            {t("dashboard.holdingsMoversTopLoss")}
          </div>
          {losers.length === 0 ? (
            <div className="text-xs sm:text-sm text-gray-500">
              {t("dashboard.holdingsMoversNoLosing")}
            </div>
          ) : (
            <ul className="space-y-2">
              {losers.map((g) => (
                <li
                  key={g.coinId}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="text-xs sm:text-sm min-w-0 flex-1">
                    <div className="truncate">
                      {g.name}{" "}
                      <span className="text-xs text-gray-500">
                        ({g.symbol.toUpperCase()})
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {g.amount} {t("common.units")}
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm text-red-600 shrink-0">
                    {g.profitUSD != null
                      ? `${g.profitUSD >= 0 ? "+" : "-"}${formatCurrency(
                          Math.abs(g.profitUSD),
                          { symbol: "$", maximumFractionDigits: 10 }
                        )}`
                      : "—"}
                    {g.profitPct != null ? (
                      <span className="text-xs text-gray-500">
                        {" "}
                        ({g.profitPct >= 0 ? "+" : ""}
                        {g.profitPct.toFixed(2)}%)
                      </span>
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
