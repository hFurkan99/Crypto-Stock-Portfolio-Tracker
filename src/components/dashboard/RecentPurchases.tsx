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
    <div className="border dark:border-gray-700 rounded p-3 sm:p-4 dark:bg-gray-800/50">
      <div className="flex items-center justify-between mb-3">
        <div className="font-medium text-sm sm:text-base">
          {t("common.recentPurchases")}
        </div>
        <button
          onClick={() => onViewAll?.()}
          className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          {t("common.viewAll")}
        </button>
      </div>

      {recentPurchases.length === 0 ? (
        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
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
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">
                    {r.name} ({r.symbol.toUpperCase()})
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                    {r.amount} @{" "}
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
                <div
                  className={`text-xs sm:text-sm shrink-0 ${
                    pl >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {pl >= 0 ? "+" : "-"}
                  {formatCurrency(Math.abs(pl), {
                    symbol: "$",
                    maximumFractionDigits: 10,
                  })}{" "}
                  ({plPct >= 0 ? "+" : ""}
                  {plPct.toFixed(2)}%)
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
