import type { Holding } from "@/types/holding.types";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import formatCurrency from "@/utils/formatCurrency";
import { useTranslation } from "@/lib/useTranslation";

const COLORS = [
  "#8B5CF6", // Purple - crypto primary
  "#3B82F6", // Blue
  "#06B6D4", // Cyan
  "#10B981", // Green
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#EC4899", // Pink
  "#6366F1", // Indigo
  "#14B8A6", // Teal
  "#F97316", // Orange
  "#A855F7", // Purple variant
  "#0EA5E9", // Sky
  "#22C55E", // Green variant
  "#FB923C", // Orange variant
  "#F43F5E", // Rose
];
const OTHER_COLOR = "#64748B"; // Slate

export default function HoldingsCostPie({ holdings }: { holdings: Holding[] }) {
  const { t } = useTranslation();
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
      <div className="border border-border/50 rounded-2xl p-4 sm:p-6 h-64 sm:h-80 flex flex-col justify-center items-center bg-card/50 backdrop-blur-sm shadow-xl shadow-primary/5">
        <div className="font-semibold text-base sm:text-lg mb-2 bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
          {t("dashboard.costDistribution")}
        </div>
        <div className="text-sm text-muted-foreground">
          {t("holdings.noHoldings")}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border/50 rounded-2xl p-4 sm:p-6 h-auto sm:h-96 bg-card/50 sm:backdrop-blur-sm shadow-xl shadow-primary/5 sm:hover:shadow-primary/10 sm:transition-all sm:duration-300 flex flex-col">
      <div className="font-semibold text-base sm:text-lg mb-4 bg-linear-to-r from-foreground to-foreground/70 bg-clip-text flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
        {t("dashboard.costDistribution")}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 sm:gap-6 items-center">
        <div className="w-full lg:flex-1 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                dataKey="value"
                data={data}
                outerRadius={100}
                labelLine={false}
                label={false}
                stroke="none"
                animationDuration={300}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.coinId}
                    fill={
                      entry.coinId === "other"
                        ? OTHER_COLOR
                        : COLORS[index % COLORS.length]
                    }
                    style={{
                      filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
                    }}
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
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.75rem",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.3)",
                  padding: "8px 12px",
                }}
                labelStyle={{
                  color: "hsl(var(--popover-foreground))",
                  fontWeight: "600",
                  marginBottom: "4px",
                }}
                itemStyle={{
                  color: "hsl(var(--popover-foreground))",
                  fontWeight: "500",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full lg:w-56 xl:w-64 overflow-auto max-h-64 sm:max-h-80 scrollbar-thin">
          <ul className="space-y-2.5 pr-2">
            {data.map((d, i) => {
              const pct = total > 0 ? (Number(d.value) / total) * 100 : 0;
              return (
                <li
                  key={d.coinId}
                  className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span
                      className="inline-block w-3 h-3 rounded-full shrink-0 ring-2 ring-white/20 group-hover:ring-white/40 transition-all"
                      style={{
                        background:
                          d.coinId === "other"
                            ? OTHER_COLOR
                            : COLORS[i % COLORS.length],
                      }}
                    />
                    <div className="text-xs sm:text-sm font-medium truncate">
                      {d.name}
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm text-right shrink-0">
                    <div className="font-bold text-foreground">
                      {formatCurrency(Number(d.value), {
                        symbol: "$",
                        maximumFractionDigits: 10,
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">
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
