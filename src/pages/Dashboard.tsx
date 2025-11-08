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
  const marketsQuery = useTopMarkets(50); // 100'den 50'ye düşürdük - mobilde daha hızlı

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

  const [topMoversPeriod, setTopMoversPeriod] = useState<Period>("1d"); // 7d yerine 1d - daha hızlı
  const [holdingsMoversPeriod, setHoldingsMoversPeriod] =
    useState<Period>("1d"); // 7d yerine 1d - daha hızlı
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
      if (topMoversPeriod === "1d") {
        change = p.price_change_percentage_24h ?? 0;
      } else if (topMoversPeriod === "7d") {
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
  }, [pricesQuery.data, marketsQuery.data, topMoversPeriod]);

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
      if (topMoversPeriod === "1d") {
        change = p.price_change_percentage_24h ?? 0;
      } else if (topMoversPeriod === "7d") {
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
  }, [pricesQuery.data, marketsQuery.data, topMoversPeriod]);

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
          Dashboard
        </h1>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <TotalsSummary
          totalHoldings={totals.totalHoldings}
          currentValue={totals.currentValue}
          profitLoss={totals.profitLoss}
          profitLossPct={totals.profitLossPct}
          loading={pricesQuery.isLoading}
          className="flex-1"
        />

        <div className="w-full sm:w-64 p-4 sm:p-6 border border-border/50 rounded-2xl bg-linear-to-br from-card/80 to-accent/5 backdrop-blur-sm shadow-xl shadow-accent/10 hover:shadow-accent/20 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/20 rounded-full blur-2xl group-hover:w-32 group-hover:h-32 transition-all duration-500"></div>
          <div className="relative z-10 space-y-2">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
              {t("dashboard.accountSnapshot.cashBalance")}
            </div>
            <div className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-accent to-primary bg-clip-text text-transparent">
              {formatCurrency(balance, {
                symbol: "$",
                maximumFractionDigits: 10,
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <AccountSnapshot
          holdingsValue={totals.currentValue}
          cashBalance={balance}
        />

        <RecentPurchases
          recentPurchases={recentPurchases}
          pricesData={pricesQuery.data}
          onViewAll={() => setHistoryOpen(true)}
        />
      </div>

      <div className="mt-4 sm:mt-6 grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <TopMovers
          period={topMoversPeriod}
          setPeriod={setTopMoversPeriod}
          topGainers={topGainers}
          topLosers={topLosers}
        />
        <HoldingsMovers
          period={holdingsMoversPeriod}
          setPeriod={setHoldingsMoversPeriod}
          holdings={holdings}
          pricesData={pricesQuery.data}
        />
      </div>

      <div className="mt-4 sm:mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
