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
    <div className="lg:col-span-2 border rounded p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="font-medium">
          {t("dashboard.accountSnapshot.title")}
        </div>
        <div className="text-sm text-gray-500">
          {t("dashboard.accountSnapshot.currentSnapshot")}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 border rounded bg-white text-center">
          <div className="text-xs text-gray-500">
            {t("dashboard.accountSnapshot.holdingsValue")}
          </div>
          <div className="mt-1 text-lg font-semibold">
            {formatCurrency(holdingsValue, {
              symbol: "$",
              maximumFractionDigits: 10,
            })}
          </div>
        </div>

        <div className="p-4 border rounded bg-white text-center">
          <div className="text-xs text-gray-500">
            {t("dashboard.accountSnapshot.cashBalance")}
          </div>
          <div className="mt-1 text-lg font-semibold">
            {formatCurrency(cashBalance, {
              symbol: "$",
              maximumFractionDigits: 10,
            })}
          </div>
        </div>

        <div className="p-4 border rounded bg-white text-center">
          <div className="text-xs text-gray-500">
            {t("dashboard.accountSnapshot.totalAccount")}
          </div>
          <div className="mt-1 text-lg font-semibold">
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
