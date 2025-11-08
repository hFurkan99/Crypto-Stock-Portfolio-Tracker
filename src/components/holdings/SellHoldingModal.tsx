import { useState, useEffect } from "react";
import { useHoldingsStore } from "@/store/holdingsStore";
import { useBalanceStore } from "@/store/balanceStore";
import { useCoinPrice } from "@/hooks/useCoins";
import { useTranslation } from "@/lib/useTranslation";
import { showSuccess } from "@/lib/toast";

export default function SellHoldingModal({
  isOpen,
  onClose,
  target,
}: {
  isOpen: boolean;
  onClose: () => void;
  target: {
    coinId: string;
    symbol: string;
    name: string;
    totalAmount: number;
    avgBuyPrice: number;
  } | null;
}) {
  const deleteHolding = useHoldingsStore((s) => s.deleteHolding);
  const updateHolding = useHoldingsStore((s) => s.updateHolding);
  const getHoldings = useHoldingsStore((s) => s.holdings);
  const { t } = useTranslation();

  const [amountStr, setAmountStr] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const priceQuery = useCoinPrice(target?.coinId ?? null);
  const currentPrice = priceQuery.data?.current_price ?? null;

  useEffect(() => {
    if (isOpen && target) {
      // default to 1 unit if user has >=1, otherwise default to the full amount they own
      const defaultAmount = target.totalAmount >= 1 ? 1 : target.totalAmount;
      setAmountStr(String(defaultAmount));
      setError(null);
    } else {
      setAmountStr("");
      setError(null);
    }
  }, [isOpen, target]);

  const handleSell = () => {
    if (!target) return;
    const parsed = Number(amountStr);
    if (!amountStr || !isFinite(parsed) || parsed <= 0) {
      setError(t("validation.enterAmount"));
      return;
    }
    if (parsed > target.totalAmount) {
      setError(t("validation.amountExceeds"));
      return;
    }

    // perform FIFO sell: reduce earliest holdings first
    let remaining = parsed;
    const holdingsForCoin = getHoldings
      .filter((h) => h.coinId === target.coinId)
      .sort(
        (a, b) => new Date(a.buyDate).getTime() - new Date(b.buyDate).getTime()
      );

    for (const h of holdingsForCoin) {
      if (remaining <= 0) break;
      if (h.amount <= remaining + Number.EPSILON) {
        // remove entire holding
        deleteHolding(h.id);
        remaining -= h.amount;
      } else {
        // reduce holding amount
        updateHolding(h.id, { amount: +(h.amount - remaining) });
        remaining = 0;
      }
    }

    // add proceeds to balance (use current price if available, otherwise fallback to avgBuyPrice)
    const sellPrice = currentPrice ?? target.avgBuyPrice;
    const proceeds = sellPrice * parsed;
    useBalanceStore.getState().deposit(proceeds);

    showSuccess(
      t("modals.sellHolding.success") || "Holding sold successfully!"
    );
    onClose();
  };

  if (!isOpen || !target) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 dark:border dark:border-gray-700 rounded shadow-lg p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-medium truncate">
            {t("modals.sellHolding.title", `${target.name}`)}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 text-xl sm:text-2xl ml-2 shrink-0 hover:text-gray-700 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-1">
              {t("modals.sellHolding.totalOwned")}
            </div>
            <div className="px-3 py-2 border dark:border-gray-600 rounded text-sm sm:text-base dark:bg-gray-700">
              {target.totalAmount} {target.symbol.toUpperCase()}
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1 dark:text-gray-300">
              {t("modals.sellHolding.amountToSell")}
            </label>
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
              <input
                type="number"
                inputMode="decimal"
                className="flex-1 border dark:border-gray-600 rounded px-3 py-2 text-sm sm:text-base dark:bg-gray-700 dark:text-white"
                value={amountStr}
                min={1}
                step={1}
                onChange={(e) => {
                  let v = e.target.value.replace(",", ".");
                  // remove any chars except digits and dot
                  v = v.replace(/[^0-9.]/g, "");
                  // collapse multiple dots to first
                  const parts = v.split(".");
                  if (parts.length > 2)
                    v = parts.shift() + "." + parts.join("");
                  // remove leading zeros unless it's "0." or just "0"
                  if (/^0+[0-9]+/.test(v)) {
                    v = v.replace(/^0+/, "");
                  }
                  setAmountStr(v);
                  setError(null);
                }}
                onBlur={() => {
                  // normalize leading dot to 0.x
                  if (amountStr.startsWith(".")) setAmountStr("0" + amountStr);
                  // if empty, reset to sensible default
                  if (amountStr.trim() === "") {
                    const defaultAmount =
                      target && target.totalAmount >= 1
                        ? 1
                        : target?.totalAmount ?? "";
                    setAmountStr(String(defaultAmount));
                  }
                }}
              />
              <button
                type="button"
                className="px-3 py-2 rounded bg-red-800 text-white text-xs sm:text-sm whitespace-nowrap hover:bg-red-900"
                onClick={() => setAmountStr(String(target.totalAmount))}
                title={t("modals.sellHolding.setToTotalTitle")}
              >
                {t("modals.sellHolding.setToTotal")}
              </button>
            </div>
            {error && (
              <p className="text-red-600 dark:text-red-400 text-xs sm:text-sm">
                {error}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border dark:border-gray-600 text-sm sm:text-base hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              onClick={handleSell}
              className="px-4 py-2 rounded bg-red-600 text-white text-sm sm:text-base hover:bg-red-700"
            >
              {t("modals.sellHolding.confirm")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
