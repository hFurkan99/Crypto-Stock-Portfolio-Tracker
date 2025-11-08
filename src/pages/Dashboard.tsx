import { useMemo, useState } from "react";
import { useTranslation } from "@/lib/useTranslation";
// Recharts chart removed per user request
import { useHoldingsStore } from "@/store/holdingsStore";
import { useBalanceStore } from "@/store/balanceStore";
import { useCoinsPrices, useTopMarkets } from "@/hooks/useCoins";
import TotalsSummary from "@/components/common/TotalsSummary";
import AccountSnapshot from "@/components/dashboard/AccountSnapshot";
import formatCurrency from "@/utils/formatCurrency";
import TopMovers from "@/components/dashboard/TopMovers";
import RecentPurchases from "@/components/dashboard/RecentPurchases";
import HoldingsHistoryModal from "@/components/holdings/HoldingsHistoryModal";
import HoldingsMovers from "@/components/dashboard/HoldingsMovers";
import HoldingsAmountPie from "@/components/dashboard/HoldingsAmountPie";
import HoldingsCostPie from "@/components/dashboard/HoldingsCostPie";

type Period = "1d" | "7d" | "30d";

export default function Dashboard() {
  const { t } = useTranslation();
  const holdings = useHoldingsStore((s) => s.holdings);
  const balance = useBalanceStore((s) => s.balance);

  const coinIds = useMemo(() => {
    const s = new Set<string>();
    for (const h of holdings) s.add(h.coinId);
    return Array.from(s);
  }, [holdings]);

  const pricesQuery = useCoinsPrices(coinIds);
  const marketsQuery = useTopMarkets(100);

  // totals (reuse logic similar to holdings page)
  const totals = useMemo(() => {
    const costBasis = holdings.reduce(
      (sum, h) => sum + h.amount * h.buyPrice,
      0
    );
    const priceMap = new Map<string, number>();
    if (pricesQuery.data)
      for (const p of pricesQuery.data)
        priceMap.set(p.id, p.current_price ?? 0);
    const currentValue = holdings.reduce(
      (sum, h) => sum + h.amount * (priceMap.get(h.coinId) ?? 0),
      0
    );
    const profitLoss = currentValue - costBasis;
    const profitLossPct = costBasis === 0 ? 0 : (profitLoss / costBasis) * 100;
    return {
      totalHoldings: holdings.reduce((s, h) => s + h.amount, 0),
      currentValue,
      costBasis,
      profitLoss,
      profitLossPct,
    };
  }, [holdings, pricesQuery.data]);

  // recent purchases (last 2)
  const recentPurchases = useMemo(() => {
    return [...holdings]
      .sort(
        (a, b) => new Date(b.buyDate).getTime() - new Date(a.buyDate).getTime()
      )
      .slice(0, 2);
  }, [holdings]);

  const [period, setPeriod] = useState<Period>("7d");
  const [historyOpen, setHistoryOpen] = useState(false);

  // chart removed: xTickFormatter no longer required

  // top losers based on period
  const topLosers = useMemo(() => {
    const markets = marketsQuery.data ?? pricesQuery.data ?? [];
    if (!markets)
      return [] as Array<{
        id: string;
        name: string;
        symbol: string;
        change: number;
      }>;
    const items: Array<{
      id: string;
      name: string;
      symbol: string;
      change: number;
    }> = [];
    for (const p of markets) {
      let change = 0;
      if (period === "1d") {
        change = p.price_change_percentage_24h ?? 0;
      } else if (period === "7d") {
        // Prefer the API-provided 7d percentage (if available), otherwise fall back to sparkline calculation
        change =
          p.price_change_percentage_7d_in_currency ??
          (() => {
            const arr = p.sparkline_in_7d?.price;
            if (arr && arr.length >= 2) {
              const first = arr[0];
              const last = arr[arr.length - 1];
              return first ? ((last - first) / first) * 100 : 0;
            }
            return 0;
          })();
      } else {
        // 30d: prefer API-provided 30d percentage if present; otherwise fall back to 7d/sparkline logic
        change =
          p.price_change_percentage_30d_in_currency ??
          p.price_change_percentage_7d_in_currency ??
          (() => {
            const arr = p.sparkline_in_7d?.price;
            if (arr && arr.length >= 2) {
              const first = arr[0];
              const last = arr[arr.length - 1];
              return first ? ((last - first) / first) * 100 : 0;
            }
            return p.price_change_percentage_24h ?? 0;
          })();
      }
      items.push({ id: p.id, name: p.name, symbol: p.symbol, change });
    }
    // sort ascending to get losers first
    items.sort((a, b) => a.change - b.change);
    return items.slice(0, 5);
  }, [pricesQuery.data, marketsQuery.data, period]);

  // top gainers (mirror of losers, highest positive change)
  const topGainers = useMemo(() => {
    const markets = marketsQuery.data ?? pricesQuery.data ?? [];
    if (!markets)
      return [] as Array<{
        id: string;
        name: string;
        symbol: string;
        change: number;
      }>;
    const items: Array<{
      id: string;
      name: string;
      symbol: string;
      change: number;
    }> = [];
    for (const p of markets) {
      let change = 0;
      if (period === "1d") {
        change = p.price_change_percentage_24h ?? 0;
      } else if (period === "7d") {
        // Prefer API-provided 7d percentage (if available), otherwise fall back to sparkline calculation
        change =
          p.price_change_percentage_7d_in_currency ??
          (() => {
            const arr = p.sparkline_in_7d?.price;
            if (arr && arr.length >= 2) {
              const first = arr[0];
              const last = arr[arr.length - 1];
              return first ? ((last - first) / first) * 100 : 0;
            }
            return 0;
          })();
      } else {
        // 30d: prefer API-provided 30d percentage if present; otherwise fall back to 7d/sparkline logic
        change =
          p.price_change_percentage_30d_in_currency ??
          p.price_change_percentage_7d_in_currency ??
          (() => {
            const arr = p.sparkline_in_7d?.price;
            if (arr && arr.length >= 2) {
              const first = arr[0];
              const last = arr[arr.length - 1];
              return first ? ((last - first) / first) * 100 : 0;
            }
            return p.price_change_percentage_24h ?? 0;
          })();
      }
      items.push({ id: p.id, name: p.name, symbol: p.symbol, change });
    }
    // sort descending to get top gainers first
    items.sort((a, b) => b.change - a.change);
    return items.slice(0, 5);
  }, [pricesQuery.data, marketsQuery.data, period]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      <div className="mb-4 flex items-center justify-between gap-4">
        <TotalsSummary
          totalHoldings={totals.totalHoldings}
          currentValue={totals.currentValue}
          profitLoss={totals.profitLoss}
          profitLossPct={totals.profitLossPct}
          loading={pricesQuery.isLoading}
          className="flex-1"
        />

        <div className="w-56 p-4 border rounded bg-white text-center">
          <div className="text-xs text-gray-500">
            {t("dashboard.accountSnapshot.cashBalance")}
          </div>
          <div className="mt-1 text-xl font-semibold">
            {formatCurrency(balance, {
              symbol: "$",
              maximumFractionDigits: 10,
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <AccountSnapshot
          holdingsValue={totals.currentValue}
          cashBalance={balance}
        />

        <TopMovers
          period={period}
          setPeriod={setPeriod}
          topGainers={topGainers}
          topLosers={topLosers}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentPurchases
          recentPurchases={recentPurchases}
          pricesData={pricesQuery.data}
          onViewAll={() => setHistoryOpen(true)}
        />
        <HoldingsMovers
          period={period}
          holdings={holdings}
          pricesData={pricesQuery.data}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="col-span-1">
          <HoldingsAmountPie holdings={holdings} />
        </div>
        <div className="col-span-1">
          <HoldingsCostPie holdings={holdings} />
        </div>
      </div>
      <HoldingsHistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />
    </div>
  );
}
