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
    const success = useBalanceStore.getState().withdraw(cost);
    if (!success) {
      showError(t("modals.addHolding.insufficientBalance"));
      return;
    }

    addHolding({
      coinId: data.coinId,
      symbol: data.symbol,
      name: data.name,
      amount: data.amount,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">
            {t("modals.addHolding.title")}
          </h3>
          <button onClick={onClose} className="text-gray-500">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("modals.addHolding.search")}
            </label>
            <input
              className="w-full border rounded px-3 py-2"
              placeholder={t("modals.addHolding.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {results.length > 0 && (
              <ul className="max-h-40 overflow-auto mt-2 border rounded">
                {results.map((c) => (
                  <li
                    key={c.id}
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-100 flex justify-between items-center ${
                      selected?.id === c.id ? "bg-gray-100" : ""
                    }`}
                    onClick={() => handleSelect(c)}
                  >
                    <div>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {c.symbol}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {t("common.select")}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <div className="text-sm text-gray-700 mb-1">
              {t("common.selected")}
            </div>
            <div className="px-3 py-2 border rounded">
              {selected
                ? `${selected.name} (${selected.symbol})`
                : t("common.none")}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t("common.amount")}
            </label>
            <input
              type="number"
              step={1}
              min={1}
              className="w-full border rounded px-3 py-2"
              {...register("amount", { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-red-600 text-sm">
                {String(errors.amount.message)}
              </p>
            )}
          </div>

          <div>
            <div className="text-sm font-medium mb-2">{t("common.price")}</div>
            <div className="border rounded p-3">
              <div className="text-sm">
                {t("modals.addHolding.unit")}:{" "}
                {priceQuery?.isLoading
                  ? "..."
                  : unitPrice != null
                  ? formatCurrency(unitPrice, {
                      symbol: "$",
                      maximumFractionDigits: 10,
                    })
                  : "—"}
              </div>
              <div className="font-medium">
                {t("common.total")}:
                {formatCurrency(total, {
                  symbol: "$",
                  maximumFractionDigits: 10,
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || unitPrice == null || !selected}
              className="px-4 py-2 rounded bg-blue-600 text-white"
            >
              {t("modals.addHolding.add")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
