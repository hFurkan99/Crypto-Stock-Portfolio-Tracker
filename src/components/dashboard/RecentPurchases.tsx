import type { Holding } from "@/types/holding.types";
import type { CoinPrice } from "@/types/coin.types";
import formatCurrency from "@/utils/formatCurrency";
import { useTranslation } from "@/lib/useTranslation";

export default function RecentPurchases({
  recentPurchases,
  pricesData,
  onViewAll,
}: {
  recentPurchases: Holding[];
  pricesData?: CoinPrice[];
  onViewAll?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="border border-border/50 rounded-2xl p-4 sm:p-6 bg-card/50 backdrop-blur-sm shadow-xl shadow-primary/5 hover:shadow-accent/10 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="font-semibold text-base sm:text-lg bg-linear-to-r from-foreground to-foreground/70 bg-clip-text flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
          {t("common.recentPurchases")}
        </div>
        <button
          onClick={() => onViewAll?.()}
          className="text-xs sm:text-sm text-primary hover:text-accent font-medium hover:underline transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/5"
        >
          {t("common.viewAll")}
        </button>
      </div>

      {recentPurchases.length === 0 ? (
        <div className="text-sm text-muted-foreground p-6 text-center border border-dashed border-border/50 rounded-lg">
          {t("common.noRecentPurchases")}
        </div>
      ) : (
        <div className="space-y-3">
          {recentPurchases.map((r) => {
            const p = pricesData?.find((pp) => pp.id === r.coinId);
            const current = p?.current_price ?? null;
            const value = current ? current * r.amount : r.buyPrice * r.amount;
            const pl = current ? value - r.buyPrice * r.amount : 0;
            const plPct = r.buyPrice ? (pl / (r.buyPrice * r.amount)) * 100 : 0;
            return (
              <div
                key={r.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-muted/20 hover:bg-muted/30 border border-border/30 transition-all group"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="font-semibold text-sm truncate">
                    {r.name} ({r.symbol.toUpperCase()})
                  </div>
                  <div className="text-xs text-muted-foreground truncate flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-primary/10 rounded text-primary font-medium">
                      {r.amount}
                    </span>
                    @{" "}
                    {formatCurrency(r.buyPrice, {
                      symbol: "$",
                      maximumFractionDigits: 10,
                    })}{" "}
                    • {t("common.now")}{" "}
                    {current
                      ? formatCurrency(current, {
                          symbol: "$",
                          maximumFractionDigits: 10,
                        })
                      : "—"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`text-sm font-bold shrink-0 px-3 py-1.5 rounded-lg ${
                      pl >= 0
                        ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                        : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                    }`}
                  >
                    {pl >= 0 ? "+" : ""}
                    {formatCurrency(pl, {
                      symbol: "$",
                      maximumFractionDigits: 10,
                    })}{" "}
                    <span className="text-xs">
                      ({plPct >= 0 ? "+" : ""}
                      {plPct.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
