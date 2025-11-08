import formatCurrency from "@/utils/formatCurrency";
import { useTranslation } from "@/lib/useTranslation";

export default function AccountSnapshot({
  holdingsValue,
  cashBalance,
}: {
  holdingsValue: number;
  cashBalance: number;
}) {
  const { t } = useTranslation();
  return (
    <div className="lg:col-span-2 border border-border/50 rounded-2xl p-4 sm:p-6 bg-card/50 backdrop-blur-sm shadow-xl shadow-primary/5 hover:shadow-primary/10 transition-all duration-300 group">
      <div className="flex items-center gap-3 mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-linear-to-r from-primary/10 to-accent/10 border border-primary/20">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          <span className="font-semibold text-sm sm:text-base bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
            {t("dashboard.accountSnapshot.title")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative p-4 sm:p-5 border border-border/50 rounded-xl bg-linear-to-br from-card to-card/50 hover:border-primary/30 transition-all duration-300 overflow-hidden group/card">
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              {t("dashboard.accountSnapshot.holdingsValue")}
            </div>
            <div className="mt-2 text-lg sm:text-2xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
              {formatCurrency(holdingsValue, {
                symbol: "$",
                maximumFractionDigits: 10,
              })}
            </div>
          </div>
        </div>

        <div className="relative p-4 sm:p-5 border border-border/50 rounded-xl bg-linear-to-br from-card to-card/50 hover:border-accent/30 transition-all duration-300 overflow-hidden group/card">
          <div className="absolute inset-0 bg-linear-to-br from-accent/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full bg-accent animate-pulse"
                style={{ animationDelay: "0.2s" }}
              ></div>
              {t("dashboard.accountSnapshot.cashBalance")}
            </div>
            <div className="mt-2 text-lg sm:text-2xl font-bold bg-linear-to-r from-accent to-primary bg-clip-text text-transparent">
              {formatCurrency(cashBalance, {
                symbol: "$",
                maximumFractionDigits: 10,
              })}
            </div>
          </div>
        </div>

        <div className="relative p-4 sm:p-5 border border-border/50 rounded-xl bg-linear-to-br from-card to-card/50 hover:border-primary/30 transition-all duration-300 overflow-hidden group/card">
          <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-accent/5 opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full bg-primary animate-pulse"
                style={{ animationDelay: "0.4s" }}
              ></div>
              {t("dashboard.accountSnapshot.totalAccount")}
            </div>
            <div className="mt-2 text-lg sm:text-2xl font-bold bg-linear-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {formatCurrency(holdingsValue + cashBalance, {
                symbol: "$",
                maximumFractionDigits: 10,
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
