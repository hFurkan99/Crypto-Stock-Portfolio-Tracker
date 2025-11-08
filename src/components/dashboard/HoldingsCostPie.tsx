import type { Holding } from "@/types/holding.types";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import formatCurrency from "@/utils/formatCurrency";

const COLORS = [
  "#4CAF50",
  "#2196F3",
  "#FF9800",
  "#E91E63",
  "#9C27B0",
  "#00BCD4",
  "#FFC107",
  "#8BC34A",
  "#607D8B",
  "#795548",
];
const OTHER_COLOR = "#C0C0C0";

export default function HoldingsCostPie({ holdings }: { holdings: Holding[] }) {
  const map = new Map<
    string,
    { name: string; symbol: string; totalCost: number }
  >();
  for (const h of holdings) {
    const ex = map.get(h.coinId);
    const cost = h.amount * h.buyPrice;
    if (ex) ex.totalCost += cost;
    else map.set(h.coinId, { name: h.name, symbol: h.symbol, totalCost: cost });
  }

  let data = Array.from(map.entries()).map(([coinId, v]) => ({
    name: `${v.symbol.toUpperCase()} ${v.name}`,
    value: Number(v.totalCost.toFixed(2)),
    coinId,
  }));

  // Group small slices into "Other" to keep the legend readable
  const totalValue = data.reduce((s, d) => s + Number(d.value), 0);
  const MIN_PCT = 3; // items below 3% aggregated into Other
  if (totalValue > 0) {
    const major: typeof data = [];
    let otherSum = 0;
    data.forEach((d) => {
      const pct = (Number(d.value) / totalValue) * 100;
      if (pct >= MIN_PCT) major.push(d);
      else otherSum += Number(d.value);
    });
    if (otherSum > 0) {
      major.push({
        name: "Other",
        value: Number(otherSum.toFixed(2)),
        coinId: "other",
      });
    }
    data = major;
  }

  // Sort descending by value, but keep 'Other' last if present
  data.sort((a, b) => {
    if (a.coinId === "other") return 1;
    if (b.coinId === "other") return -1;
    return Number(b.value) - Number(a.value);
  });

  const total = data.reduce((s, d) => s + Number(d.value), 0);

  if (data.length === 0) {
    return (
      <div className="border dark:border-gray-700 rounded p-3 sm:p-6 h-64 sm:h-96 flex flex-col justify-center items-center dark:bg-gray-800">
        <div className="font-medium text-base sm:text-lg mb-2">
          Maliyet Dağılımı
        </div>
        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          No holdings
        </div>
      </div>
    );
  }

  return (
    <div className="border dark:border-gray-700 rounded p-3 sm:p-6 h-auto sm:h-96 bg-white dark:bg-gray-800 flex flex-col">
      <div className="font-medium text-base sm:text-lg mb-3 sm:mb-4">
        Maliyet Dağılımı
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-3 sm:gap-4 items-center">
        <div className="w-full lg:flex-1" style={{ minHeight: 280 }}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                dataKey="value"
                data={data}
                outerRadius={100}
                labelLine={false}
                label={false}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.coinId}
                    fill={
                      entry.coinId === "other"
                        ? OTHER_COLOR
                        : COLORS[index % COLORS.length]
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) =>
                  formatCurrency(Number(value), {
                    symbol: "$",
                    maximumFractionDigits: 10,
                  })
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full lg:w-56 xl:w-64 overflow-auto max-h-64 sm:max-h-80">
          <ul className="space-y-2 pr-2">
            {data.map((d, i) => {
              const pct = total > 0 ? (Number(d.value) / total) * 100 : 0;
              return (
                <li
                  key={d.coinId}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span
                      className="inline-block w-3 h-3 rounded shrink-0"
                      style={{
                        background:
                          d.coinId === "other"
                            ? OTHER_COLOR
                            : COLORS[i % COLORS.length],
                      }}
                    />
                    <div className="text-xs sm:text-sm truncate">{d.name}</div>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-right shrink-0">
                    <div>
                      {formatCurrency(Number(d.value), {
                        symbol: "$",
                        maximumFractionDigits: 10,
                      })}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {pct.toFixed(2)}%
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
