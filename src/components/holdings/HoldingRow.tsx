import type { Holding } from "@/types/holding.types";
import formatCurrency from "@/utils/formatCurrency";
import { useTranslation } from "@/lib/useTranslation";

type Grouped = {
  coinId: string;
  symbol: string;
  name: string;
  totalAmount: number;
  avgBuyPrice: number;
  holdings: Holding[];
};

export default function HoldingRow({
  grouped,
  onBuy,
  onSell,
  onShowHistory,
  currentPrice,
  priceChange24h,
  profitLoss,
  profitLossPct,
  coinImage,
}: {
  grouped: Grouped;
  onBuy: () => void;
  onSell: () => void;
  onShowHistory?: (coinId: string) => void;
  currentPrice?: number;
  priceChange24h?: number;
  profitLoss?: number;
  profitLossPct?: number;
  coinImage?: string;
}) {
  const { name, symbol, totalAmount, avgBuyPrice } = grouped;
  const { t } = useTranslation();
  return (
    <div className="border border-border/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card/50 backdrop-blur-sm shadow-lg shadow-primary/5 hover:shadow-primary/10 hover:border-primary/30 transition-all duration-300 group">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {coinImage && (
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-md group-hover:blur-lg transition-all"></div>
            <img
              src={coinImage}
              alt={name}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shrink-0 relative z-10 ring-2 ring-border/50 group-hover:ring-primary/50 transition-all"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}

        <div className="flex-1 min-w-0 space-y-2">
          <div className="font-bold text-base sm:text-lg truncate">
            <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
              {totalAmount}
            </span>{" "}
            <span className="text-foreground/90">{symbol.toUpperCase()}</span>
            {" — "}
            <span className="text-muted-foreground font-medium text-sm">
              {name}
            </span>
          </div>

          <div className="text-xs sm:text-sm text-muted-foreground truncate flex items-center gap-2">
            <span className="px-2 py-0.5 bg-muted/50 rounded-md border border-border/30">
              {t("holdings.buyPriceAvg")}{" "}
              {formatCurrency(avgBuyPrice, {
                symbol: "$",
                maximumFractionDigits: 10,
              })}
            </span>
            <span>•</span>
            <span className="font-medium">
              {t("common.total")}{" "}
              {currentPrice != null
                ? formatCurrency(currentPrice * totalAmount, {
                    symbol: "$",
                    maximumFractionDigits: 2,
                  })
                : "—"}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
            <div className="px-2 py-1 bg-muted/30 rounded-md border border-border/30">
              {t("common.current")}{" "}
              <span className="font-semibold text-foreground">
                {currentPrice != null
                  ? formatCurrency(currentPrice, {
                      symbol: "$",
                      maximumFractionDigits: 10,
                    })
                  : "—"}
              </span>
            </div>

            <div
              className={`px-2 py-1 rounded-md border font-semibold ${
                priceChange24h != null && priceChange24h >= 0
                  ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                  : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
              }`}
            >
              {t("common.change24h")}{" "}
              {priceChange24h != null
                ? `${priceChange24h >= 0 ? "+" : ""}${priceChange24h.toFixed(
                    2
                  )}%`
                : "—"}
            </div>

            <div
              className={`px-2 py-1 rounded-md border font-bold ${
                profitLoss != null && profitLoss >= 0
                  ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                  : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
              }`}
            >
              {t("common.pl")}{" "}
              {profitLoss != null
                ? `${profitLoss >= 0 ? "+" : ""}${formatCurrency(profitLoss, {
                    symbol: "$",
                    maximumFractionDigits: 10,
                  })}`
                : "—"}{" "}
              {profitLossPct != null
                ? `(${profitLossPct >= 0 ? "+" : ""}${profitLossPct.toFixed(
                    2
                  )}%)`
                : ""}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:shrink-0">
        <button
          onClick={onBuy}
          className="flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-linear-to-br from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-600/30 hover:shadow-green-600/50 transition-all duration-300 active:scale-95 border border-green-500/20"
        >
          {t("common.buy")}
        </button>

        <button
          onClick={onSell}
          className="flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-linear-to-br from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-600/30 hover:shadow-red-600/50 transition-all duration-300 active:scale-95 border border-red-500/20"
        >
          {t("common.sell")}
        </button>

        <button
          onClick={() => onShowHistory && onShowHistory(grouped.coinId)}
          className="flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-card/80 backdrop-blur-sm hover:bg-muted/50 border border-border/50 hover:border-primary/30 shadow-lg shadow-primary/5 hover:shadow-primary/10 transition-all duration-300 active:scale-95"
        >
          <span className="hidden sm:inline">{t("common.history")}</span>
          <span className="sm:hidden">📊</span>
        </button>
      </div>
    </div>
  );
}
