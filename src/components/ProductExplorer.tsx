"use client";

import { useMemo, useState } from "react";
import type { ProductRow } from "@/lib/queries";
import { formatMoney } from "@/lib/format";
import { RetailerTag, retailerColor } from "./RetailerTag";

type SortKey = "title" | "category" | "retailer" | "price";
type SortDir = "asc" | "desc";

export function ProductExplorer({ products }: { products: ProductRow[] }) {
  const [search, setSearch] = useState("");
  const [retailer, setRetailer] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("category");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const retailers = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of products) map.set(p.retailerSlug, p.retailerName);
    return Array.from(map, ([slug, name]) => ({ slug, name }));
  }, [products]);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort(),
    [products]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = products.filter((p) => {
      if (retailer !== "all" && p.retailerSlug !== retailer) return false;
      if (category !== "all" && p.category !== category) return false;
      if (q && !p.title.toLowerCase().includes(q)) return false;
      return true;
    });

    rows = rows.slice().sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "category":
          cmp = a.category.localeCompare(b.category);
          break;
        case "retailer":
          cmp = a.retailerName.localeCompare(b.retailerName);
          break;
        case "price":
          cmp = a.price - b.price;
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return rows;
  }, [products, search, retailer, category, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <div className="mt-6">
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="w-full max-w-xs rounded-lg border px-3 py-2 text-sm outline-none"
          style={{ borderColor: "var(--border)", background: "var(--surface-1)", color: "var(--text-primary)" }}
        />
        <select
          value={retailer}
          onChange={(e) => setRetailer(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm outline-none"
          style={{ borderColor: "var(--border)", background: "var(--surface-1)", color: "var(--text-primary)" }}
        >
          <option value="all">All retailers</option>
          {retailers.map((r) => (
            <option key={r.slug} value={r.slug}>
              {r.name}
            </option>
          ))}
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm outline-none"
          style={{ borderColor: "var(--border)", background: "var(--surface-1)", color: "var(--text-primary)" }}
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div className="ml-auto self-center text-sm" style={{ color: "var(--text-muted)" }}>
          {filtered.length.toLocaleString()} shown
        </div>
      </div>

      <div
        className="overflow-x-auto rounded-xl border"
        style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ color: "var(--text-muted)", borderBottom: "1px solid var(--gridline)" }}>
              <SortHeader label="Product" active={sortKey === "title"} dir={sortDir} onClick={() => toggleSort("title")} />
              <SortHeader label="Retailer" active={sortKey === "retailer"} dir={sortDir} onClick={() => toggleSort("retailer")} />
              <SortHeader label="Category" active={sortKey === "category"} dir={sortDir} onClick={() => toggleSort("category")} />
              <SortHeader label="Price" active={sortKey === "price"} dir={sortDir} onClick={() => toggleSort("price")} align="right" />
              <th className="px-4 py-3 font-medium">Stock</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 400).map((p) => (
              <tr key={`${p.retailerSlug}-${p.id}`} style={{ borderBottom: "1px solid var(--gridline)" }}>
                <td className="px-4 py-3">
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium hover:underline"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {p.title}
                  </a>
                </td>
                <td className="px-4 py-3">
                  <RetailerTag slug={p.retailerSlug} name={p.retailerName} />
                </td>
                <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                  {p.category}
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-medium">{formatMoney(p.price, p.currency)}</td>
                <td className="px-4 py-3">
                  {p.inStock ? (
                    <span style={{ color: "var(--success)" }}>In stock</span>
                  ) : (
                    <span style={{ color: "var(--text-muted)" }}>Out of stock</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > 400 && (
          <div className="px-4 py-3 text-center text-xs" style={{ color: "var(--text-muted)" }}>
            Showing first 400 of {filtered.length.toLocaleString()} — narrow your filters to see more.
          </div>
        )}
        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            No products match your filters.
          </div>
        )}
      </div>
    </div>
  );
}

function SortHeader({
  label,
  active,
  dir,
  onClick,
  align = "left",
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  align?: "left" | "right";
}) {
  return (
    <th className="px-4 py-3 font-medium">
      <button
        onClick={onClick}
        className="inline-flex items-center gap-1"
        style={{ color: active ? retailerColor("desky") : "var(--text-muted)", justifyContent: align === "right" ? "flex-end" : "flex-start" }}
      >
        {label}
        {active && <span aria-hidden>{dir === "asc" ? "↑" : "↓"}</span>}
      </button>
    </th>
  );
}
