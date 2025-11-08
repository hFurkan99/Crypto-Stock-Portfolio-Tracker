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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl shadow-primary/20 overflow-hidden max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        {/* Decorative gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Fixed Header */}
        <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-border/30 bg-card/95 backdrop-blur-xl shrink-0">
          <h3 className="text-lg sm:text-xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            {filterCoinId ? t("modals.history.title") : t("modals.history.all")}
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
          {items.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border/50 rounded-2xl bg-card/30">
              <div className="text-4xl mb-4">📜</div>
              <div className="text-base font-medium text-muted-foreground">
                {t("modals.history.none")}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((h) => (
                <div
                  key={h.id}
                  className="border border-border/50 rounded-xl p-4 bg-card/50 backdrop-blur-sm hover:bg-muted/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="font-semibold text-base flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary group-hover:bg-accent transition-colors"></div>
                      {h.amount} {h.symbol.toUpperCase()} - {h.name}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground font-medium bg-muted/50 px-2.5 py-1 rounded-lg">
                      {new Date(h.buyDate).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-foreground/80 mb-2">
                    {t("common.price")}{" "}
                    <span className="font-bold text-foreground">
                      {formatCurrency(h.buyPrice, {
                        symbol: "$",
                        maximumFractionDigits: 10,
                      })}
                    </span>
                  </div>
                  {h.notes && (
                    <div className="text-sm text-muted-foreground mt-2 p-2.5 rounded-lg bg-muted/30 border border-border/30 italic">
                      {h.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
