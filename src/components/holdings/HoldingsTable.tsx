import type { Holding } from "@/types/holding.types";
import HoldingRow from "./HoldingRow";

export default function HoldingsTable({ holdings }: { holdings: Holding[] }) {
  return (
    <div className="space-y-3">
      {holdings.map((h) => (
        <HoldingRow key={h.id} holding={h} />
      ))}
    </div>
  );
}
