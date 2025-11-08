import { useEffect, useMemo, useState } from "react";
import { useCoinSearch, useCoinsPrices } from "@/hooks/useCoins";
import { useWatchlistStore } from "@/store/watchlistStore";
import AddHoldingModal from "@/components/holdings/AddHoldingModal";
import formatCurrency from "@/utils/formatCurrency";
import { useTranslation } from "@/lib/useTranslation";

export default function Watchlist() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [selectedToAdd, setSelectedToAdd] = useState<{
    id: string;
    name: string;
    symbol: string;
  } | null>(null);
  const [openAddModal, setOpenAddModal] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query.trim()), 300);
    return () => window.clearTimeout(t);
  }, [query]);

  const searchQuery = useCoinSearch(debounced || null);

  const watchlist = useWatchlistStore((s) => s.watchlist);
  const addToWatchlist = useWatchlistStore((s) => s.addToWatchlist);
  const removeFromWatchlist = useWatchlistStore((s) => s.removeFromWatchlist);
  const isInWatchlist = useWatchlistStore((s) => s.isInWatchlist);

  const coinIds = useMemo(() => watchlist.map((w) => w.coinId), [watchlist]);
  const pricesQuery = useCoinsPrices(coinIds);

  const handleSelectAdd = (c: { id: string; name: string; symbol: string }) => {
    if (isInWatchlist(c.id)) return;
    addToWatchlist({
      coinId: c.id,
      name: c.name,
      symbol: c.symbol.toUpperCase(),
    });
    setQuery("");
    setDebounced("");
  };

  const openBuyModal = (w: { id: string; name: string; symbol: string }) => {
    setSelectedToAdd({ id: w.id, name: w.name, symbol: w.symbol });
    setOpenAddModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t("nav.watchlist")}</h1>
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-700 mb-2">
          {t("modals.addHolding.search")}
        </label>
        <input
          className="w-full border rounded px-3 py-2"
          placeholder={t("modals.addHolding.searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {searchQuery.data && searchQuery.data.length > 0 && (
          <ul className="mt-2 border rounded max-h-48 overflow-auto">
            {searchQuery.data.map((c) => (
              <li
                key={c.id}
                className="px-3 py-2 flex justify-between items-center hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelectAdd(c)}
              >
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-gray-500">
                    {c.symbol.toUpperCase()}
                  </div>
                </div>
                <div className="text-sm text-blue-600">
                  {t("modals.addHolding.add")}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-3">
        {watchlist.length === 0 ? (
          <div className="text-sm text-gray-600">{t("watchlist.noCoins")}</div>
        ) : pricesQuery.data && pricesQuery.data.length > 0 ? (
          pricesQuery.data.map((p) => {
            const item = watchlist.find((w) => w.coinId === p.id)!;
            return (
              <div
                key={item.id}
                className="border rounded p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {p.image && (
                    <img
                      src={p.image}
                      alt={item.name}
                      className="w-8 h-8 rounded"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display =
                          "none";
                      }}
                    />
                  )}

                  <div>
                    <div className="font-medium">
                      {item.name} ({item.symbol.toUpperCase()})
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {t("common.price")}{" "}
                      {formatCurrency(p.current_price, {
                        symbol: "$",
                        maximumFractionDigits: 10,
                      })}
                    </div>
                    <div className="text-sm mt-1">
                      {t("common.change24h")}{" "}
                      {p.price_change_percentage_24h != null
                        ? `${
                            p.price_change_percentage_24h >= 0 ? "+" : ""
                          }${p.price_change_percentage_24h.toFixed(2)}%`
                        : "—"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1 rounded bg-green-600 text-white text-sm"
                    onClick={() =>
                      openBuyModal({ id: p.id, name: p.name, symbol: p.symbol })
                    }
                  >
                    {t("common.buy")}
                  </button>
                  <button
                    className="px-3 py-1 rounded border text-sm"
                    onClick={() => removeFromWatchlist(item.id)}
                  >
                    {t("common.remove")}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          // prices not yet loaded: show simple list
          watchlist.map((w) => (
            <div
              key={w.id}
              className="border rounded p-3 flex items-center justify-between"
            >
              <div>
                <div className="font-medium">
                  {w.name} ({w.symbol.toUpperCase()})
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {t("common.price")} ...
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1 rounded bg-green-600 text-white text-sm"
                  onClick={() =>
                    openBuyModal({
                      id: w.coinId,
                      name: w.name,
                      symbol: w.symbol,
                    })
                  }
                >
                  {t("common.buy")}
                </button>
                <button
                  className="px-3 py-1 rounded border text-sm"
                  onClick={() => removeFromWatchlist(w.id)}
                >
                  {t("common.remove")}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <AddHoldingModal
        isOpen={openAddModal}
        onClose={() => setOpenAddModal(false)}
        initialCoin={selectedToAdd ?? undefined}
      />
    </div>
  );
}
