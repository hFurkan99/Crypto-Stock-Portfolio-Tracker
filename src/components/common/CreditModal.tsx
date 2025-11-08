import { useState } from "react";
import { useBalanceStore } from "@/store/balanceStore";
import { useTranslation } from "@/lib/useTranslation";
import { showSuccess, showError } from "@/lib/toast";

export default function CreditModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const deposit = useBalanceStore((s) => s.deposit);
  // keep the input as a string so the user can clear/edit the field freely
  const [amount, setAmount] = useState<string>("");
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative w-full max-w-md bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl shadow-primary/20 overflow-hidden max-h-[90vh] flex flex-col animate-fadeIn">
        {/* Decorative gradient */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-primary/20 to-accent/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Fixed Header */}
        <div className="relative z-10 flex items-center justify-between px-6 sm:px-8 py-4 border-b border-border/30 bg-card/95 backdrop-blur-xl shrink-0">
          <h3 className="text-xl sm:text-2xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
            {t("modals.credit.title")}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted/50 transition-all active:scale-95 text-muted-foreground hover:text-foreground shrink-0 ml-4"
          >
            <span className="text-xl font-light">✕</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="relative z-10 overflow-y-auto flex-1 px-6 sm:px-8 py-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-3 text-foreground/90">
                {t("modals.credit.amountLabel")}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-primary">
                  $
                </span>
                <input
                  type="number"
                  step="any"
                  min={0}
                  className="w-full border border-border/50 rounded-xl pl-10 pr-4 py-3 text-base font-medium bg-card/50 backdrop-blur-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="relative z-10 flex flex-col sm:flex-row justify-end gap-3 px-6 sm:px-8 py-4 border-t border-border/30 bg-card/95 backdrop-blur-xl shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-xl border border-border/50 text-base font-semibold hover:bg-muted/50 transition-all duration-300 active:scale-95"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            onClick={() => {
              const v = parseFloat(amount);
              if (!Number.isNaN(v) && v > 0) {
                deposit(v);
                showSuccess(
                  t("modals.credit.success") || "Balance added successfully!"
                );
                onClose();
                setAmount("");
              } else {
                showError(
                  t("modals.credit.invalidAmount") ||
                    "Please enter a valid amount"
                );
              }
            }}
            className="px-6 py-3 rounded-xl bg-linear-to-br from-green-600 to-green-700 text-white text-base font-semibold hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-600/30 hover:shadow-green-600/50 transition-all duration-300 active:scale-95 border border-green-500/20"
          >
            {t("modals.credit.add")}
          </button>
        </div>
      </div>
    </div>
  );
}
