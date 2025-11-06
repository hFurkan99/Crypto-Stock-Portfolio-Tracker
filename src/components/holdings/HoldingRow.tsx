import type { Holding } from "@/types/holding.types";

export default function HoldingRow({ holding }: { holding: Holding }) {
  return (
    <div className="border rounded p-3 flex justify-between items-start">
      <div>
        <div className="font-medium">
          {holding.amount} {holding.symbol} — {holding.name}
        </div>
        <div className="text-sm text-gray-600">
          Bought at ${holding.buyPrice} on{" "}
          {new Date(holding.buyDate).toLocaleDateString()}
        </div>
        {holding.notes && (
          <div className="text-sm text-gray-700 mt-1">{holding.notes}</div>
        )}
      </div>
    </div>
  );
}
