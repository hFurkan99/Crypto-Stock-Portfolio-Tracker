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
    <div className="border rounded p-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {coinImage && (
          <img
            src={coinImage}
            alt={name}
            className="w-8 h-8 rounded"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        )}

        <div>
          <div className="font-medium">
            {totalAmount} {symbol.toUpperCase()} — {name}
          </div>

          <div className="text-sm text-gray-600">
            {t("holdings.buyPriceAvg")}{" "}
            {formatCurrency(avgBuyPrice, {
              symbol: "$",
              maximumFractionDigits: 10,
            })}
          </div>

          <div className="text-sm text-gray-600 mt-1 flex gap-4">
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
                  ? "text-green-600"
                  : "text-red-600"
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

      <div className="flex items-center gap-2">
        <button
          onClick={onBuy}
          className="px-3 py-1 rounded border text-sm bg-green-600 text-white"
        >
          {t("common.buy")}
        </button>

        <button
          onClick={onSell}
          className="px-3 py-1 rounded border text-sm bg-red-600 text-white"
        >
          {t("common.sell")}
        </button>

        <button
          onClick={() => onShowHistory && onShowHistory(grouped.coinId)}
          className="px-3 py-1 rounded border text-sm bg-gray-200"
        >
          {t("common.history")}
        </button>
      </div>
    </div>
  );
}
