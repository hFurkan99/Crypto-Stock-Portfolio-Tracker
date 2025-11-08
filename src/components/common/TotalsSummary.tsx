import formatCurrency from "@/utils/formatCurrency";
import { useTranslation } from "@/lib/useTranslation";

export default function TotalsSummary({
  totalHoldings,
  currentValue,
  profitLoss,
  profitLossPct,
  loading = false,
  locale,
  currency = "USD",
  className = "",
}: {
  totalHoldings: number;
  currentValue: number;
  profitLoss: number;
  profitLossPct: number;
  loading?: boolean;
  locale?: string;
  currency?: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const currencySymbolMap: Record<string, string> = {
    USD: "$",
    EUR: "€",
    TRY: "₺",
  };

  const symbol = currencySymbolMap[currency] ?? "";

  const fmt = (n: number) =>
    formatCurrency(n, { locale, symbol, maximumFractionDigits: 2 });

  const fmtNumber = (n: number) =>
    formatCurrency(n, { locale, maximumFractionDigits: 0 });

  return (
    <div className={`mb-4 p-4 border rounded bg-white ${className}`}>
      <div className="flex gap-6 text-sm items-baseline">
        <div>
          <div className="text-xs text-gray-500">
            {t("totals.totalHoldings")}
          </div>
          <div className="font-medium">
            {loading ? "..." : fmtNumber(totalHoldings)}
          </div>
        </div>

        <div>
          <div className="text-xs text-gray-500">{t("totals.totalValue")}</div>
          <div className="font-medium">
            {loading ? "..." : fmt(currentValue)}
          </div>
        </div>

        <div>
          <div className="text-xs text-gray-500">{t("totals.totalPL")}</div>
          <div
            className={`font-medium ${
              profitLoss >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {loading
              ? "..."
              : `${profitLoss >= 0 ? "+" : "-"}${fmt(Math.abs(profitLoss))} (${
                  profitLossPct >= 0 ? "+" : "-"
                }${Math.abs(profitLossPct).toFixed(2)}%)`}
          </div>
        </div>
      </div>
    </div>
  );
}
