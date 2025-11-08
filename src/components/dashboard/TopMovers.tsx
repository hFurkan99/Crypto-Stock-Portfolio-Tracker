import { useTranslation } from "@/lib/useTranslation";

export default function TopMovers({
  period,
  setPeriod,
  topGainers,
  topLosers,
}: {
  period: "1d" | "7d" | "30d";
  setPeriod: (p: "1d" | "7d" | "30d") => void;
  topGainers: Array<{
    id: string;
    name: string;
    symbol: string;
    change: number;
  }>;
  topLosers: Array<{
    id: string;
    name: string;
    symbol: string;
    change: number;
  }>;
}) {
  const { t } = useTranslation();

  return (
    <div className="border border-border/50 rounded-2xl p-4 sm:p-6 bg-card/50 backdrop-blur-sm shadow-xl shadow-primary/5 hover:shadow-accent/10 transition-all duration-300">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-linear-to-r from-primary/10 to-accent/10 border border-primary/20">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
          <span className="font-semibold text-sm sm:text-base bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
            {t("dashboard.topMovers")}
          </span>
        </div>
        <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-lg border border-border/50">
          <button
            onClick={() => setPeriod("1d")}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
              period === "1d"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                : "hover:bg-muted/50"
            }`}
          >
            1d
          </button>
          <button
            onClick={() => setPeriod("7d")}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
              period === "7d"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                : "hover:bg-muted/50"
            }`}
          >
            7d
          </button>
          <button
            onClick={() => setPeriod("30d")}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
              period === "30d"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                : "hover:bg-muted/50"
            }`}
          >
            30d
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-3">
          <div className="font-medium text-sm flex items-center gap-2 text-green-600 dark:text-green-400">
            <div className="w-3 h-3 rounded-full bg-green-500/20 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            </div>
            {t("dashboard.topGainers")}
          </div>
          {topGainers.length === 0 ? (
            <div className="text-sm text-muted-foreground p-4 text-center border border-dashed border-border/50 rounded-lg">
              {t("common.noData")}
            </div>
          ) : (
            <ul className="space-y-2">
              {topGainers.map((coin) => (
                <li
                  key={coin.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/20 hover:bg-green-500/5 border border-border/30 hover:border-green-500/30 transition-all group"
                >
                  <div className="text-sm truncate min-w-0 flex-1">
                    <span className="font-medium">{coin.name}</span>{" "}
                    <span className="text-xs text-muted-foreground">
                      ({coin.symbol.toUpperCase()})
                    </span>
                  </div>
                  <div className="text-sm font-bold shrink-0 px-2 py-1 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                    +{coin.change.toFixed(2)}%
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-3">
          <div className="font-medium text-sm flex items-center gap-2 text-red-600 dark:text-red-400">
            <div className="w-3 h-3 rounded-full bg-red-500/20 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
            </div>
            {t("dashboard.topLosers")}
          </div>
          {topLosers.length === 0 ? (
            <div className="text-sm text-muted-foreground p-4 text-center border border-dashed border-border/50 rounded-lg">
              {t("common.noData")}
            </div>
          ) : (
            <ul className="space-y-2">
              {topLosers.map((coin) => (
                <li
                  key={coin.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/20 hover:bg-red-500/5 border border-border/30 hover:border-red-500/30 transition-all group"
                >
                  <div className="text-sm truncate min-w-0 flex-1">
                    <span className="font-medium">{coin.name}</span>{" "}
                    <span className="text-xs text-muted-foreground">
                      ({coin.symbol.toUpperCase()})
                    </span>
                  </div>
                  <div className="text-sm font-bold shrink-0 px-2 py-1 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                    {coin.change.toFixed(2)}%
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
