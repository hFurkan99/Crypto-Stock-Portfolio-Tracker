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
    <div className="border rounded p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
        <div className="font-medium text-sm sm:text-base">
          {t("dashboard.topMovers")} ({period})
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setPeriod("1d")}
            className={`px-2 py-1 rounded text-xs sm:text-sm ${
              period === "1d" ? "bg-gray-200" : ""
            }`}
          >
            1d
          </button>
          <button
            onClick={() => setPeriod("7d")}
            className={`px-2 py-1 rounded text-xs sm:text-sm ${
              period === "7d" ? "bg-gray-200" : ""
            }`}
          >
            7d
          </button>
          <button
            onClick={() => setPeriod("30d")}
            className={`px-2 py-1 rounded text-xs sm:text-sm ${
              period === "30d" ? "bg-gray-200" : ""
            }`}
          >
            30d
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <div className="font-medium text-xs sm:text-sm mb-2">
            {t("dashboard.topGainers")}
          </div>
          {topGainers.length === 0 ? (
            <div className="text-xs sm:text-sm text-gray-500">
              {t("common.noData")}
            </div>
          ) : (
            <ul className="space-y-2">
              {topGainers.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="text-xs sm:text-sm truncate min-w-0">
                    {t.name}{" "}
                    <span className="text-xs text-gray-500">
                      ({t.symbol.toUpperCase()})
                    </span>
                  </div>
                  <div
                    className={`text-xs sm:text-sm shrink-0 ${
                      t.change >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {t.change.toFixed(2)}%
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <div className="font-medium text-xs sm:text-sm mb-2">
            {t("dashboard.topLosers")}
          </div>
          {topLosers.length === 0 ? (
            <div className="text-xs sm:text-sm text-gray-500">
              {t("common.noData")}
            </div>
          ) : (
            <ul className="space-y-2">
              {topLosers.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="text-xs sm:text-sm truncate min-w-0">
                    {t.name}{" "}
                    <span className="text-xs text-gray-500">
                      ({t.symbol.toUpperCase()})
                    </span>
                  </div>
                  <div
                    className={`text-xs sm:text-sm shrink-0 ${
                      t.change >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {t.change.toFixed(2)}%
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
