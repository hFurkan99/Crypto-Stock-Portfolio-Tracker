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
    <div className="lg:col-span-2 border dark:border-gray-700 rounded p-3 sm:p-4 dark:bg-gray-800/50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
        <div className="font-medium text-sm sm:text-base">
          {t("dashboard.accountSnapshot.title")}
        </div>
        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          {t("dashboard.accountSnapshot.currentSnapshot")}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-3 sm:p-4 border dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t("dashboard.accountSnapshot.holdingsValue")}
          </div>
          <div className="mt-1 text-base sm:text-lg font-semibold">
            {formatCurrency(holdingsValue, {
              symbol: "$",
              maximumFractionDigits: 10,
            })}
          </div>
        </div>

        <div className="p-3 sm:p-4 border dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t("dashboard.accountSnapshot.cashBalance")}
          </div>
          <div className="mt-1 text-base sm:text-lg font-semibold">
            {formatCurrency(cashBalance, {
              symbol: "$",
              maximumFractionDigits: 10,
            })}
          </div>
        </div>

        <div className="p-3 sm:p-4 border dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t("dashboard.accountSnapshot.totalAccount")}
          </div>
          <div className="mt-1 text-base sm:text-lg font-semibold">
            {formatCurrency(holdingsValue + cashBalance, {
              symbol: "$",
              maximumFractionDigits: 10,
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
