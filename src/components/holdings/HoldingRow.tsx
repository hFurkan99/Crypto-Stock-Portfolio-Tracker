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
    <div className="border dark:border-gray-700 rounded p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 dark:bg-gray-800/30">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {coinImage && (
          <img
            src={coinImage}
            alt={name}
            className="w-8 h-8 rounded shrink-0"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        )}

        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm sm:text-base truncate">
            {totalAmount} {symbol.toUpperCase()} — {name}
          </div>

          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
            {t("holdings.buyPriceAvg")}{" "}
            {formatCurrency(avgBuyPrice, {
              symbol: "$",
              maximumFractionDigits: 10,
            })}
            {" • "}
            {t("common.total")}{" "}
            {currentPrice != null
              ? formatCurrency(currentPrice * totalAmount, {
                  symbol: "$",
                  maximumFractionDigits: 2,
                })
              : "—"}
          </div>

          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 flex flex-wrap gap-2 sm:gap-4">
            <div>
              {t("common.current")}{" "}
              {currentPrice != null
                ? formatCurrency(currentPrice, {
                    symbol: "$",
                    maximumFractionDigits: 10,
                  })
                : "—"}
            </div>

            <div>
              {t("common.change24h")}{" "}
              {priceChange24h != null
                ? `${priceChange24h >= 0 ? "+" : ""}${priceChange24h.toFixed(
                    2
                  )}%`
                : "—"}
            </div>

            <div
              className={`${
                profitLoss != null && profitLoss >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {t("common.pl")}{" "}
              {profitLoss != null
                ? `${profitLoss >= 0 ? "+" : "-"}${formatCurrency(
                    Math.abs(profitLoss),
                    { symbol: "$", maximumFractionDigits: 10 }
                  )}`
                : "—"}{" "}
              {profitLossPct != null
                ? `(${profitLossPct >= 0 ? "+" : ""}${Math.abs(
                    profitLossPct
                  ).toFixed(2)}%)`
                : ""}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:shrink-0">
        <button
          onClick={onBuy}
          className="flex-1 sm:flex-initial px-3 py-1 rounded border dark:border-green-600 text-xs sm:text-sm bg-green-600 text-white hover:bg-green-700"
        >
          {t("common.buy")}
        </button>

        <button
          onClick={onSell}
          className="flex-1 sm:flex-initial px-3 py-1 rounded border dark:border-red-600 text-xs sm:text-sm bg-red-600 text-white hover:bg-red-700"
        >
          {t("common.sell")}
        </button>

        <button
          onClick={() => onShowHistory && onShowHistory(grouped.coinId)}
          className="flex-1 sm:flex-initial px-3 py-1 rounded border dark:border-gray-600 text-xs sm:text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          <span className="hidden sm:inline">{t("common.history")}</span>
          <span className="sm:hidden">📊</span>
        </button>
      </div>
    </div>
  );
}
