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
    <div
      className={`p-4 sm:p-6 border border-border/50 rounded-2xl bg-linear-to-br from-card/80 to-card/40 backdrop-blur-sm shadow-2xl shadow-primary/10 hover:shadow-primary/20 transition-all duration-300 relative overflow-hidden ${className}`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-primary/10 to-accent/10 rounded-full blur-3xl"></div>
      <div className="relative z-10 flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm">
        <div className="flex-1 space-y-2">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
            {t("totals.totalHoldings")}
          </div>
          <div className="font-bold text-xl sm:text-2xl bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
            {loading ? "..." : fmtNumber(totalHoldings)}
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"
              style={{ animationDelay: "0.2s" }}
            ></div>
            {t("totals.totalValue")}
          </div>
          <div className="font-bold text-xl sm:text-2xl bg-linear-to-r from-accent to-primary bg-clip-text text-transparent">
            {loading ? "..." : fmt(currentValue)}
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <div
              className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                profitLoss >= 0 ? "bg-green-500" : "bg-red-500"
              }`}
              style={{ animationDelay: "0.4s" }}
            ></div>
            {t("totals.totalPL")}
          </div>
          <div
            className={`font-bold text-xl sm:text-2xl ${
              profitLoss >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {loading ? (
              "..."
            ) : (
              <div className="flex flex-col gap-1">
                <span>
                  {profitLoss >= 0 ? "+" : ""}
                  {fmt(profitLoss)}
                </span>
                <span className="text-sm font-medium opacity-80">
                  ({profitLossPct >= 0 ? "+" : ""}
                  {profitLossPct.toFixed(2)}%)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
