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
    <div className="p-2 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">{t("holdings.title")}</h1>

        {/* Balance Display - Always visible on mobile */}
        <div className="px-3 py-2 sm:px-4 sm:py-2 border rounded bg-white dark:bg-gray-800">
          <div className="text-xs text-gray-500">{t("common.balance")}</div>
          <div className="font-medium text-sm sm:text-base">
            {formatCurrency(balance, {
              symbol: "$",
              maximumFractionDigits: 10,
            })}
          </div>
        </div>
      </div>

      {/* Action Buttons - Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap gap-2 mb-6">
        <button
          className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
          onClick={() => {
            if (window.confirm(t("holdings.resetConfirm"))) {
              resetBalance();
              showSuccess(
                t("holdings.resetSuccess") || "Balance reset successfully!"
              );
            }
          }}
        >
          <span className="hidden sm:inline">{t("holdings.withdrawAll")}</span>
          <span className="sm:hidden">{t("holdings.withdrawAll")}</span>
        </button>
        <button
          className="px-3 py-2 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
          onClick={() => setCreditOpen(true)}
        >
          {t("modals.credit.title")}
        </button>

        <button
          className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 col-span-2 sm:col-span-1"
          onClick={() => handleShowHistory(null)}
        >
          {t("common.history")}
        </button>

        <button
          className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 col-span-2 sm:col-span-1"
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
        />
      )}

      {holdings.length === 0 ? (
        <div className="text-sm text-gray-600">No holdings yet.</div>
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
    </div>
  );
}
