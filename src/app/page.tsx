import Link from "next/link";
import { StatTile } from "@/components/StatTile";
import { RetailerTag, retailerColor } from "@/components/RetailerTag";
import { CategoryChart, type CategoryChartDatum } from "@/components/CategoryChart";
import { getCategoryComparison, getRetailerSummaries } from "@/lib/queries";
import { formatDate, formatMoney, formatRelativeTime } from "@/lib/format";

export default function Home() {
  const retailers = getRetailerSummaries();
  const categories = getCategoryComparison();

  const desky = retailers.find((r) => r.isDesky);
  const competitors = retailers.filter((r) => !r.isDesky);
  const lastScrapedAt = retailers.reduce<string | null>((latest, r) => {
    if (!r.lastScrapedAt) return latest;
    if (!latest || r.lastScrapedAt > latest) return r.lastScrapedAt;
    return latest;
  }, null);

  const totalProducts = retailers.reduce((sum, r) => sum + r.productCount, 0);

  const comparableCategories = categories.filter((c) => c.deskyVsCompetitorPct != null);
  const avgPositionPct =
    comparableCategories.length > 0
      ? comparableCategories.reduce((sum, c) => sum + (c.deskyVsCompetitorPct ?? 0), 0) /
        comparableCategories.length
      : null;

  const chartData: CategoryChartDatum[] = categories.slice(0, 7).map((c) => ({
    category: c.category,
    desky: c.byRetailer["desky"]?.avgPrice ?? null,
    deskit: c.byRetailer["deskit"]?.avgPrice ?? null,
    standesk: c.byRetailer["standesk"]?.avgPrice ?? null,
  }));

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pricing overview</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Desky vs. {competitors.map((c) => c.name).join(" & ")} — live from each store&apos;s public catalog.
          </p>
        </div>
        <div className="text-sm" style={{ color: "var(--text-muted)" }}>
          Last scraped {formatRelativeTime(lastScrapedAt)}
          <span className="hidden sm:inline"> · {formatDate(lastScrapedAt)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Products tracked"
          value={totalProducts.toLocaleString()}
          sub={`across ${retailers.length} retailers`}
        />
        <StatTile
          label="Desky catalog size"
          value={(desky?.productCount ?? 0).toLocaleString()}
          sub={`avg ${formatMoney(desky?.avgPrice ?? null)}`}
        />
        <StatTile
          label="Desky price position"
          value={avgPositionPct == null ? "—" : `${avgPositionPct > 0 ? "+" : ""}${avgPositionPct.toFixed(1)}%`}
          delta={avgPositionPct == null ? undefined : avgPositionPct > 0 ? "above market" : "below market"}
          deltaGoodDirection="down"
          sub="vs. competitor avg, shared categories"
        />
        <StatTile
          label="Categories compared"
          value={comparableCategories.length.toString()}
          sub={`of ${categories.length} tracked`}
        />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {retailers.map((r) => (
          <div
            key={r.slug}
            className="rounded-xl border p-5"
            style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
          >
            <div className="flex items-center justify-between">
              <RetailerTag slug={r.slug} name={r.name} />
              {r.isDesky && (
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{ background: "color-mix(in srgb, var(--series-desky) 15%, transparent)", color: retailerColor("desky") }}
                >
                  your brand
                </span>
              )}
            </div>
            <div className="mt-3 text-2xl font-semibold">{r.productCount.toLocaleString()} products</div>
            <div className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              avg {formatMoney(r.avgPrice)} · {r.domain}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Average price by category</h2>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Top {chartData.length} categories by number of products tracked.
            </p>
          </div>
        </div>
        <div
          className="rounded-xl border p-4"
          style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
        >
          <CategoryChart data={chartData} />
        </div>
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-lg font-semibold tracking-tight">All categories</h2>
          <Link href="/products" className="text-sm underline" style={{ color: retailerColor("desky") }}>
            Browse every product →
          </Link>
        </div>
        <div
          className="overflow-x-auto rounded-xl border"
          style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left" style={{ color: "var(--text-muted)", borderBottom: "1px solid var(--gridline)" }}>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Desky avg</th>
                <th className="px-4 py-3 font-medium">Deskit avg</th>
                <th className="px-4 py-3 font-medium">Standesk avg</th>
                <th className="px-4 py-3 font-medium">Desky vs. market</th>
                <th className="px-4 py-3 font-medium">Products</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.category} style={{ borderBottom: "1px solid var(--gridline)" }}>
                  <td className="px-4 py-3 font-medium">{c.category}</td>
                  <td className="px-4 py-3 tabular-nums">{formatMoney(c.byRetailer["desky"]?.avgPrice ?? null)}</td>
                  <td className="px-4 py-3 tabular-nums" style={{ color: "var(--text-secondary)" }}>
                    {formatMoney(c.byRetailer["deskit"]?.avgPrice ?? null)}
                  </td>
                  <td className="px-4 py-3 tabular-nums" style={{ color: "var(--text-secondary)" }}>
                    {formatMoney(c.byRetailer["standesk"]?.avgPrice ?? null)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {c.deskyVsCompetitorPct == null ? (
                      <span style={{ color: "var(--text-muted)" }}>n/a</span>
                    ) : (
                      <span style={{ color: c.deskyVsCompetitorPct > 0 ? "var(--text-secondary)" : "var(--success)" }}>
                        {c.deskyVsCompetitorPct > 0 ? "+" : ""}
                        {c.deskyVsCompetitorPct.toFixed(1)}%
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 tabular-nums" style={{ color: "var(--text-secondary)" }}>
                    {c.totalProducts}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
