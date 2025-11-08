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
    <div className="p-2 sm:p-4 md:p-6 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
          {t("nav.watchlist")}
        </h1>
      </div>

      <div className="mb-6 p-6 border border-border/50 rounded-2xl bg-card/50 backdrop-blur-sm shadow-xl shadow-primary/5">
        <label className="block text-sm font-semibold mb-3 text-foreground/90">
          {t("modals.addHolding.search")}
        </label>
        <input
          className="w-full border border-border/50 rounded-xl px-4 py-3 text-base bg-card/50 backdrop-blur-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          placeholder={t("modals.addHolding.searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {searchQuery.data && searchQuery.data.length > 0 && (
          <ul className="mt-3 border border-border/50 rounded-xl max-h-60 overflow-auto bg-card/50 backdrop-blur-sm shadow-lg">
            {searchQuery.data.map((c) => (
              <li
                key={c.id}
                className="px-4 py-3 flex justify-between items-center hover:bg-primary/10 cursor-pointer transition-all border-b border-border/30 last:border-0"
                onClick={() => handleSelectAdd(c)}
              >
                <div>
                  <div className="font-semibold text-sm sm:text-base">
                    {c.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {c.symbol.toUpperCase()}
                  </div>
                </div>
                <div className="text-xs font-medium text-primary px-3 py-1 bg-primary/10 rounded-lg">
                  {t("modals.addHolding.add")}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-4">
        {watchlist.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border/50 rounded-2xl bg-card/30">
            <div className="text-4xl mb-4">👁️</div>
            <div className="text-lg font-medium text-muted-foreground">
              {t("watchlist.noCoins")}
            </div>
          </div>
        ) : pricesQuery.isLoading ? (
          <div className="text-center py-12 border border-border/50 rounded-2xl bg-card/50 backdrop-blur-sm">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-primary/10 border border-primary/20">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium text-foreground">
                {t("common.loading") || "Yükleniyor..."}
              </span>
            </div>
          </div>
        ) : pricesQuery.data && pricesQuery.data.length > 0 ? (
          pricesQuery.data.map((p) => {
            const item = watchlist.find((w) => w.coinId === p.id)!;
            return (
              <div
                key={item.id}
                className="border border-border/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card/50 backdrop-blur-sm shadow-lg shadow-primary/5 hover:shadow-primary/10 hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {p.image && (
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-md group-hover:blur-lg transition-all"></div>
                      <img
                        src={p.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-full shrink-0 relative z-10 ring-2 ring-border/50 group-hover:ring-primary/50 transition-all"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display =
                            "none";
                        }}
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="font-bold text-base sm:text-lg truncate">
                      {item.name}{" "}
                      <span className="text-muted-foreground font-medium text-sm">
                        ({item.symbol.toUpperCase()})
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="px-2 py-1 bg-muted/30 rounded-md border border-border/30">
                        {t("common.price")}{" "}
                        <span className="font-bold text-foreground">
                          {formatCurrency(p.current_price, {
                            symbol: "$",
                            maximumFractionDigits: 10,
                          })}
                        </span>
                      </div>
                      <div
                        className={`px-2 py-1 rounded-md border font-semibold ${
                          p.price_change_percentage_24h != null &&
                          p.price_change_percentage_24h >= 0
                            ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                            : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                        }`}
                      >
                        {t("common.change24h")}{" "}
                        {p.price_change_percentage_24h != null
                          ? `${
                              p.price_change_percentage_24h >= 0 ? "+" : ""
                            }${p.price_change_percentage_24h.toFixed(2)}%`
                          : "—"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:shrink-0">
                  <button
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-lg text-sm font-semibold bg-linear-to-br from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-600/30 hover:shadow-green-600/50 transition-all duration-300 active:scale-95 border border-green-500/20"
                    onClick={() =>
                      openBuyModal({ id: p.id, name: p.name, symbol: p.symbol })
                    }
                  >
                    {t("common.buy")}
                  </button>
                  <button
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-lg text-sm font-semibold bg-card/80 backdrop-blur-sm hover:bg-muted/50 border border-border/50 hover:border-red-500/30 hover:text-red-600 dark:hover:text-red-400 shadow-lg shadow-primary/5 hover:shadow-red-500/10 transition-all duration-300 active:scale-95"
                    onClick={() => removeFromWatchlist(item.id)}
                  >
                    {t("common.remove")}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          watchlist.map((w) => (
            <div
              key={w.id}
              className="border border-border/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card/50 backdrop-blur-sm shadow-lg shadow-primary/5"
            >
              <div className="flex-1 min-w-0 space-y-2">
                <div className="font-bold text-base truncate">
                  {w.name}{" "}
                  <span className="text-muted-foreground font-medium text-sm">
                    ({w.symbol.toUpperCase()})
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("common.price")} ...
                </div>
              </div>

              <div className="flex items-center gap-2 sm:shrink-0">
                <button
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-lg text-sm font-semibold bg-linear-to-br from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-600/30 hover:shadow-green-600/50 transition-all duration-300 active:scale-95 border border-green-500/20"
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
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-lg text-sm font-semibold bg-card/80 backdrop-blur-sm hover:bg-muted/50 border border-border/50 hover:border-red-500/30 hover:text-red-600 dark:hover:text-red-400 shadow-lg shadow-primary/5 hover:shadow-red-500/10 transition-all duration-300 active:scale-95"
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
