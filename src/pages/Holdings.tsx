import { useMemo, useState } from "react";
import AddHoldingModal from "@/components/holdings/AddHoldingModal";
import HoldingsTable from "@/components/holdings/HoldingsTable";
import SellHoldingModal from "@/components/holdings/SellHoldingModal";
import { useHoldingsStore } from "@/store/holdingsStore";
import { useCoinsPrices } from "@/hooks/useCoins";
import TotalsSummary from "@/components/common/TotalsSummary";
import formatCurrency from "@/utils/formatCurrency";
import HoldingsHistoryModal from "@/components/holdings/HoldingsHistoryModal";
import CreditModal from "@/components/common/CreditModal";
import ConfirmModal from "@/components/common/ConfirmModal";
import { useBalanceStore } from "@/store/balanceStore";
import { useTranslation } from "@/lib/useTranslation";
import { showSuccess } from "@/lib/toast";

type Grouped = {
  coinId: string;
  symbol: string;
  name: string;
  totalAmount: number;
  avgBuyPrice: number;
};

export default function Holdings() {
  const [addOpen, setAddOpen] = useState(false);
  const [creditOpen, setCreditOpen] = useState(false);
  const [withdrawConfirmOpen, setWithdrawConfirmOpen] = useState(false);
  const [selectedInitialCoin, setSelectedInitialCoin] = useState<{
    id: string;
    name: string;
    symbol: string;
  } | null>(null);

  const [sellOpen, setSellOpen] = useState(false);
  const [sellTarget, setSellTarget] = useState<Grouped | null>(null);

  const holdings = useHoldingsStore((s) => s.holdings);
  const balance = useBalanceStore((s) => s.balance);
  const resetBalance = useBalanceStore((s) => s.reset);
  // delete/update hooks were used by a previous "Sell All" implementation
  // that moved into the sell modal. Keep store access only where needed.

  const coinIds = useMemo(() => {
    const set = new Set<string>();
    for (const h of holdings) set.add(h.coinId);
    return Array.from(set);
  }, [holdings]);

  const pricesQuery = useCoinsPrices(coinIds);

  const totals = useMemo(() => {
    // totals derived from holdings + prices
    const totalHoldings = holdings.reduce((sum, h) => sum + h.amount, 0);
    const costBasis = holdings.reduce(
      (sum, h) => sum + h.amount * h.buyPrice,
      0
    );

    const priceMap = new Map<string, number>();
    if (pricesQuery.data) {
      for (const p of pricesQuery.data)
        priceMap.set(p.id, p.current_price ?? 0);
    }

    const currentValue = holdings.reduce((sum, h) => {
      const price = priceMap.get(h.coinId) ?? 0;
      return sum + h.amount * price;
    }, 0);

    const profitLoss = currentValue - costBasis;
    const profitLossPct = costBasis === 0 ? 0 : (profitLoss / costBasis) * 100;

    return {
      totalHoldings,
      currentValue,
      costBasis,
      profitLoss,
      profitLossPct,
    };
  }, [holdings, pricesQuery.data]);

  const handleBuy = (g: Grouped) => {
    setSelectedInitialCoin({ id: g.coinId, name: g.name, symbol: g.symbol });
    setAddOpen(true);
  };

  const handleSell = (g: Grouped) => {
    setSellTarget(g);
    setSellOpen(true);
  };

  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyFilterCoin, setHistoryFilterCoin] = useState<string | null>(
    null
  );

  const handleShowHistory = (coinId?: string | null) => {
    setHistoryFilterCoin(coinId ?? null);
    setHistoryOpen(true);
  };

  const { t } = useTranslation();

  return (
    <div className="p-2 sm:p-4 md:p-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
          {t("holdings.title")}
        </h1>

        {/* Balance Display */}
        <div className="px-4 py-3 border border-border/50 rounded-xl bg-linear-to-br from-card/80 to-primary/5 backdrop-blur-sm shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/20 rounded-full blur-2xl group-hover:w-24 group-hover:h-24 transition-all duration-500"></div>
          <div className="relative z-10 space-y-1">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
              {t("common.balance")}
            </div>
            <div className="font-bold text-lg sm:text-xl bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
              {formatCurrency(balance, {
                symbol: "$",
                maximumFractionDigits: 10,
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Modern Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <button
          className="px-4 py-3 text-sm font-semibold bg-linear-to-br from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-600/30 hover:shadow-red-600/50 transition-all duration-300 active:scale-95 border border-red-500/20"
          onClick={() => setWithdrawConfirmOpen(true)}
        >
          <span className="hidden sm:inline">{t("holdings.withdrawAll")}</span>
          <span className="sm:hidden">{t("holdings.withdrawAll")}</span>
        </button>
        <button
          className="px-4 py-3 text-sm font-semibold bg-linear-to-br from-yellow-600 to-yellow-700 text-white rounded-xl hover:from-yellow-700 hover:to-yellow-800 shadow-lg shadow-yellow-600/30 hover:shadow-yellow-600/50 transition-all duration-300 active:scale-95 border border-yellow-500/20"
          onClick={() => setCreditOpen(true)}
        >
          {t("modals.credit.title")}
        </button>

        <button
          className="px-4 py-3 text-sm font-semibold bg-card/80 backdrop-blur-sm rounded-xl hover:bg-muted/50 border border-border/50 hover:border-primary/30 shadow-lg shadow-primary/5 hover:shadow-primary/10 transition-all duration-300 active:scale-95"
          onClick={() => handleShowHistory(null)}
        >
          {t("common.history")}
        </button>

        <button
          className="px-4 py-3 text-sm font-semibold bg-linear-to-br from-primary to-accent text-primary-foreground rounded-xl hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 active:scale-95 border border-primary/20"
          onClick={() => {
            setSelectedInitialCoin(null);
            setAddOpen(true);
          }}
        >
          {t("modals.addHolding.add")}
        </button>
      </div>

      {/* Totals summary */}
      {holdings.length > 0 && (
        <TotalsSummary
          totalHoldings={totals.totalHoldings}
          currentValue={totals.currentValue}
          profitLoss={totals.profitLoss}
          profitLossPct={totals.profitLossPct}
          loading={pricesQuery.isLoading}
          className="mb-6"
        />
      )}

      {holdings.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border/50 rounded-2xl bg-card/30">
          <div className="text-4xl mb-4">📊</div>
          <div className="text-lg font-medium text-muted-foreground">
            {t("holdings.noHoldings")}
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
      ) : (
        <HoldingsTable
          holdings={holdings}
          onBuy={handleBuy}
          onSell={handleSell}
          onShowHistory={handleShowHistory}
          pricesData={pricesQuery.data ?? []}
        />
      )}

      <AddHoldingModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        initialCoin={selectedInitialCoin ?? undefined}
      />

      <SellHoldingModal
        isOpen={sellOpen}
        onClose={() => setSellOpen(false)}
        target={sellTarget}
      />

      <HoldingsHistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        filterCoinId={historyFilterCoin ?? undefined}
      />

      <CreditModal isOpen={creditOpen} onClose={() => setCreditOpen(false)} />

      <ConfirmModal
        isOpen={withdrawConfirmOpen}
        onClose={() => setWithdrawConfirmOpen(false)}
        onConfirm={() => {
          resetBalance();
          showSuccess(
            t("holdings.resetSuccess") || "Balance reset successfully!"
          );
        }}
        title={t("holdings.withdrawAll")}
        message={t("holdings.resetConfirm")}
        confirmText={t("holdings.withdrawAll")}
        variant="danger"
      />
    </div>
  );
}
