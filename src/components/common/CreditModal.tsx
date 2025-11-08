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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded shadow-lg p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-medium">
            {t("modals.credit.title")}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 text-xl sm:text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1">
              {t("modals.credit.amountLabel")}
            </label>
            <input
              type="number"
              step="any"
              min={0}
              className="w-full border rounded px-3 py-2 text-sm sm:text-base"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border text-sm sm:text-base"
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
              className="px-4 py-2 rounded bg-green-600 text-white text-sm sm:text-base"
            >
              {t("modals.credit.add")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
