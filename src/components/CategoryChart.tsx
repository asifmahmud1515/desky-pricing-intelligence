"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney } from "@/lib/format";
import { retailerColor } from "./RetailerTag";

export interface CategoryChartDatum {
  category: string;
  desky: number | null;
  deskit: number | null;
  standesk: number | null;
}

const RETAILERS: { key: "desky" | "deskit" | "standesk"; name: string }[] = [
  { key: "desky", name: "Desky" },
  { key: "deskit", name: "Deskit" },
  { key: "standesk", name: "Standesk" },
];

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg border px-3 py-2 text-sm shadow-sm"
      style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}
    >
      <div className="mb-1 font-medium" style={{ color: "var(--text-primary)" }}>
        {label}
      </div>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
          <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
          <span>{entry.name}</span>
          <span className="ml-auto font-medium" style={{ color: "var(--text-primary)" }}>
            {formatMoney(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function CategoryChart({ data }: { data: CategoryChartDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={360}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }} barGap={2} barCategoryGap="20%">
        <CartesianGrid vertical={false} stroke="var(--gridline)" />
        <XAxis
          dataKey="category"
          tick={{ fill: "var(--text-muted)", fontSize: 12 }}
          axisLine={{ stroke: "var(--baseline)" }}
          tickLine={false}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={64}
        />
        <YAxis
          tick={{ fill: "var(--text-muted)", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => formatMoney(v).replace(".00", "")}
          width={72}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--gridline)", opacity: 0.4 }} />
        <Legend
          wrapperStyle={{ fontSize: 13, color: "var(--text-secondary)" }}
          iconType="circle"
          iconSize={8}
        />
        {RETAILERS.map((r) => (
          <Bar key={r.key} dataKey={r.key} name={r.name} fill={retailerColor(r.key)} radius={[4, 4, 0, 0]} maxBarSize={22} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
