import { useMemo } from "react";
import { useHoldingsStore } from "@/store/holdingsStore";
import type { Holding } from "@/types/holding.types";
import formatCurrency from "@/utils/formatCurrency";
import { useTranslation } from "@/lib/useTranslation";

export default function HoldingsHistoryModal({
  isOpen,
  onClose,
  filterCoinId,
}: {
  isOpen: boolean;
  onClose: () => void;
  filterCoinId?: string | null;
}) {
  const holdings = useHoldingsStore((s) => s.holdings);
  const { t } = useTranslation();

  const items: Holding[] = useMemo(() => {
    const list = filterCoinId
      ? holdings.filter((h) => h.coinId === filterCoinId)
      : holdings.slice();
    // sort newest first (by buyDate or createdAt)
    list.sort(
      (a, b) =>
        new Date(b.buyDate || b.createdAt).getTime() -
        new Date(a.buyDate || a.createdAt).getTime()
    );
    return list;
  }, [holdings, filterCoinId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded shadow-lg p-6 overflow-auto max-h-[80vh]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">
            {filterCoinId ? t("modals.history.title") : t("modals.history.all")}
          </h3>
          <button onClick={onClose} className="text-gray-500">
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className="text-sm text-gray-600">
            {t("modals.history.none")}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((h) => (
              <div key={h.id} className="border rounded p-3">
                <div className="flex justify-between items-center">
                  <div className="font-medium">
                    {h.amount} {h.symbol.toUpperCase()} - {h.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(h.buyDate).toLocaleString()}
                  </div>
                </div>
                <div className="text-sm text-gray-700">
                  {t("common.price")}{" "}
                  {formatCurrency(h.buyPrice, {
                    symbol: "$",
                    maximumFractionDigits: 10,
                  })}
                </div>
                {h.notes && (
                  <div className="text-sm text-gray-600 mt-1">{h.notes}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
