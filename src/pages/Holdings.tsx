import { useState } from "react";
import AddHoldingModal from "@/components/holdings/AddHoldingModal";
import HoldingsTable from "@/components/holdings/HoldingsTable";
import { useHoldingsStore } from "@/store/holdingsStore";

export default function Holdings() {
  const [open, setOpen] = useState(false);
  const holdings = useHoldingsStore((s) => s.holdings);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Holdings</h1>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => setOpen(true)}
        >
          Add Holding
        </button>
      </div>

      {holdings.length === 0 ? (
        <div className="text-sm text-gray-600">No holdings yet.</div>
      ) : (
        <HoldingsTable holdings={holdings} />
      )}

      <AddHoldingModal isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
}
