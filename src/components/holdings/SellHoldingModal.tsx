import { useState, useEffect } from "react";
import { useHoldingsStore } from "@/store/holdingsStore";
import { useBalanceStore } from "@/store/balanceStore";
import { useCoinPrice } from "@/hooks/useCoins";
import { useTranslation } from "@/lib/useTranslation";
import { showSuccess } from "@/lib/toast";
import ConfirmModal from "@/components/common/ConfirmModal";

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
  const [confirmOpen, setConfirmOpen] = useState(false);
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

    // Open confirmation modal
    setConfirmOpen(true);
  };

  const confirmSell = () => {
    if (!target) return;
    const parsed = Number(amountStr);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl shadow-primary/20 overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        {/* Decorative gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Fixed Header */}
        <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-border/30 bg-card/95 backdrop-blur-xl shrink-0">
          <h3 className="text-lg sm:text-xl font-bold bg-linear-to-r from-red-500 to-red-600 bg-clip-text text-transparent flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            {t("modals.sellHolding.title", `${target.name}`)}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted/50 transition-all active:scale-95 text-muted-foreground hover:text-foreground shrink-0 ml-4"
          >
            <span className="text-xl font-light">✕</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="relative z-10 overflow-y-auto flex-1 px-6 py-6">
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
              <div className="text-xs sm:text-sm text-muted-foreground mb-2 font-medium uppercase tracking-wide">
                {t("modals.sellHolding.totalOwned")}
              </div>
              <div className="text-base sm:text-lg font-bold text-foreground">
                {target.totalAmount} {target.symbol.toUpperCase()}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2.5">
                {t("modals.sellHolding.amountToSell")}
              </label>
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <input
                  type="number"
                  inputMode="decimal"
                  className="flex-1 border border-border/50 rounded-xl px-4 py-2.5 text-sm sm:text-base bg-card/50 backdrop-blur-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 outline-none transition-all"
                  value={amountStr}
                  min={1}
                  step={1}
                  onChange={(e) => {
                    let v = e.target.value.replace(",", ".");
                    v = v.replace(/[^0-9.]/g, "");
                    const parts = v.split(".");
                    if (parts.length > 2)
                      v = parts.shift() + "." + parts.join("");
                    if (/^0+[0-9]+/.test(v)) {
                      v = v.replace(/^0+/, "");
                    }
                    setAmountStr(v);
                    setError(null);
                  }}
                  onBlur={() => {
                    if (amountStr.startsWith("."))
                      setAmountStr("0" + amountStr);
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
                  className="px-4 py-2.5 rounded-xl bg-linear-to-br from-red-600 to-red-700 text-white text-xs sm:text-sm font-semibold whitespace-nowrap hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-600/30 transition-all active:scale-95 border border-red-500/20"
                  onClick={() => setAmountStr(String(target.totalAmount))}
                  title={t("modals.sellHolding.setToTotalTitle")}
                >
                  {t("modals.sellHolding.setToTotal")}
                </button>
              </div>
              {error && (
                <p className="text-red-500 text-xs sm:text-sm mt-2 font-medium flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-red-500"></span>
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="relative z-10 flex flex-col sm:flex-row justify-end gap-3 px-6 py-4 border-t border-border/30 bg-card/95 backdrop-blur-xl shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-border/50 text-sm sm:text-base font-semibold hover:bg-muted/50 transition-all active:scale-95"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            onClick={handleSell}
            className="px-5 py-2.5 rounded-xl bg-linear-to-br from-red-600 to-red-700 text-white text-sm sm:text-base font-semibold hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-600/30 hover:shadow-red-600/50 transition-all active:scale-95 border border-red-500/20"
          >
            {t("modals.sellHolding.confirm")}
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmSell}
        title={t("modals.sellHolding.confirm")}
        message={`${amountStr} ${target?.symbol.toUpperCase()} satmak istediğinizden emin misiniz?`}
        confirmText={t("modals.sellHolding.confirm")}
        variant="danger"
      />
    </div>
  );
}
