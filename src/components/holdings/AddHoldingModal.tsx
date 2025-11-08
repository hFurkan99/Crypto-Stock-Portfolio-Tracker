import { useMemo, useState, useEffect } from "react";
import { useHoldingsStore } from "@/store/holdingsStore";
import { useBalanceStore } from "@/store/balanceStore";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCoinSearch, useCoinPrice } from "@/hooks/useCoins";
import formatCurrency from "@/utils/formatCurrency";
import { useTranslation } from "@/lib/useTranslation";
import { showError, showSuccess } from "@/lib/toast";
import ConfirmModal from "@/components/common/ConfirmModal";

// schema moved inside component so validation messages can be localized with t()

export default function AddHoldingModal({
  isOpen,
  onClose,
  initialCoin,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialCoin?: { id: string; name: string; symbol: string } | null;
}) {
  const addHolding = useHoldingsStore((s) => s.addHolding);

  const { t } = useTranslation();

  const schema = z.object({
    coinId: z.string().min(1, t("validation.selectCoin")),
    symbol: z.string().min(1),
    name: z.string().min(1),
    amount: z.number().int().gt(0, t("validation.amountPositive")),
  });

  const [search, setSearch] = useState("");
  const [results, setResults] = useState<
    Array<{ id: string; name: string; symbol: string }>
  >([]);
  const [selected, setSelected] = useState<{
    id: string;
    name: string;
    symbol: string;
  } | null>(null);
  const [unitPrice, setUnitPrice] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingData, setPendingData] = useState<z.infer<typeof schema> | null>(
    null
  );

  const [debouncedQuery, setDebouncedQuery] = useState<string>("");

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedQuery(search.trim()),
      300
    );
    return () => window.clearTimeout(timer);
  }, [search]);

  const searchQuery = useCoinSearch(debouncedQuery || null);

  useEffect(() => {
    if (!searchQuery.data) {
      setResults([]);
      return;
    }
    setResults(
      searchQuery.data.map((c) => ({
        id: c.id,
        name: c.name,
        symbol: c.symbol.toUpperCase(),
      }))
    );
  }, [searchQuery.data]);

  const priceQuery = useCoinPrice(selected?.id ?? null);

  useEffect(() => {
    setUnitPrice(priceQuery.data?.current_price ?? null);
  }, [priceQuery.data]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      coinId: "",
      symbol: "",
      name: "",
      amount: 1,
    },
  });

  const handleSelect = (c: { id: string; name: string; symbol: string }) => {
    setSelected(c);
    setValue("coinId", c.id, { shouldDirty: true });
    setValue("symbol", c.symbol, { shouldDirty: true });
    setValue("name", c.name, { shouldDirty: true });
    setResults([]);
    setSearch("");
  };

  // if modal opened with an initial coin, pre-select it
  useEffect(() => {
    if (isOpen && initialCoin) {
      handleSelect(initialCoin);
    }
    if (!isOpen) {
      // clear selection when closing
      setSelected(null);
      setUnitPrice(null);
      setSearch("");
      setResults([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialCoin]);

  const watchedAmount = (watch("amount") as number) || 0;

  const total = useMemo(
    () => (unitPrice || 0) * (Number(watchedAmount) || 0),
    [unitPrice, watchedAmount]
  );

  const onSubmit = (data: z.infer<typeof schema>) => {
    if (unitPrice == null) return;
    const cost = unitPrice * data.amount;

    // Check balance before opening confirmation
    if (useBalanceStore.getState().balance < cost) {
      showError(t("modals.addHolding.insufficientBalance"));
      return;
    }

    // Store data and open confirmation modal
    setPendingData(data);
    setConfirmOpen(true);
  };

  const confirmBuy = () => {
    if (!pendingData || unitPrice == null) return;

    const cost = unitPrice * pendingData.amount;
    const success = useBalanceStore.getState().withdraw(cost);
    if (!success) {
      showError(t("modals.addHolding.insufficientBalance"));
      return;
    }

    addHolding({
      coinId: pendingData.coinId,
      symbol: pendingData.symbol,
      name: pendingData.name,
      amount: pendingData.amount,
      buyPrice: unitPrice,
      buyDate: new Date().toISOString(),
      notes: undefined,
    });

    showSuccess(
      t("modals.addHolding.success") || "Holding added successfully!"
    );
    onClose();
  };

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
            {t("modals.addHolding.title")}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted/50 transition-all active:scale-95 text-muted-foreground hover:text-foreground shrink-0 ml-4"
          >
            <span className="text-xl font-light">✕</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="relative z-10 overflow-y-auto flex-1">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-6 sm:px-8 py-6 space-y-5"
          >
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground/90">
                {t("modals.addHolding.search")}
              </label>
              <input
                className="w-full border border-border/50 rounded-xl px-4 py-3 text-base bg-card/50 backdrop-blur-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder={t("modals.addHolding.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {results.length > 0 && (
                <ul className="max-h-48 overflow-auto mt-3 border border-border/50 rounded-xl bg-card/50 backdrop-blur-sm shadow-lg">
                  {results.map((c) => (
                    <li
                      key={c.id}
                      className={`px-4 py-3 cursor-pointer hover:bg-primary/10 transition-all flex justify-between items-center border-b border-border/30 last:border-0 ${
                        selected?.id === c.id ? "bg-primary/10" : ""
                      }`}
                      onClick={() => handleSelect(c)}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm truncate">
                          {c.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {c.symbol}
                        </div>
                      </div>
                      <div className="text-xs font-medium text-primary shrink-0 px-3 py-1 bg-primary/10 rounded-lg">
                        {t("common.select")}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <div className="text-sm font-semibold mb-2 text-foreground/90">
                {t("common.selected")}
              </div>
              <div className="px-4 py-3 border border-border/50 rounded-xl text-sm bg-muted/30 font-medium">
                {selected
                  ? `${selected.name} (${selected.symbol})`
                  : t("common.none")}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground/90">
                {t("common.amount")}
              </label>
              <input
                type="number"
                step={1}
                min={1}
                className="w-full border border-border/50 rounded-xl px-4 py-3 text-base bg-card/50 backdrop-blur-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-2 font-medium">
                  {String(errors.amount.message)}
                </p>
              )}
            </div>

            <div>
              <div className="text-sm font-semibold mb-3 text-foreground/90">
                {t("common.price")}
              </div>
              <div className="border border-border/50 rounded-xl p-4 bg-linear-to-br from-primary/5 to-accent/5 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("modals.addHolding.unit")}:
                  </span>
                  <span className="font-bold text-foreground">
                    {priceQuery?.isLoading
                      ? "..."
                      : unitPrice != null
                      ? formatCurrency(unitPrice, {
                          symbol: "$",
                          maximumFractionDigits: 10,
                        })
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-base pt-2 border-t border-border/30">
                  <span className="font-semibold">{t("common.total")}:</span>
                  <span className="font-bold text-lg bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                    {formatCurrency(total, {
                      symbol: "$",
                      maximumFractionDigits: 10,
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer moved inside form for proper submission */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border/30">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl border border-border/50 text-base font-semibold hover:bg-muted/50 transition-all duration-300 active:scale-95"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || unitPrice == null || !selected}
                className="px-6 py-3 rounded-xl bg-linear-to-br from-primary to-accent text-primary-foreground text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 active:scale-95 border border-primary/20"
              >
                {t("modals.addHolding.add")}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmBuy}
        title={t("modals.addHolding.buy")}
        message={`${pendingData?.amount} ${
          pendingData?.symbol
        } satın almak istediğinizden emin misiniz? (${formatCurrency(total, {
          symbol: "$",
          maximumFractionDigits: 2,
        })})`}
        confirmText={t("modals.addHolding.buy")}
        variant="success"
      />
    </div>
  );
}
