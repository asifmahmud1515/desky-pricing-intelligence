"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  {
    href: "/",
    label: "Overview",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 13h6V3H3v10Zm0 8h6v-6H3v6Zm8 0h10V11H11v10Zm0-18v6h10V3H11Z"
      />
    ),
  },
  {
    href: "/products",
    label: "Product Explorer",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6h16M4 12h16M4 18h10"
      />
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col justify-between border-r px-4 py-5 md:flex"
      style={{ borderColor: "var(--border)" }}
    >
      <div>
        <Link href="/" className="flex items-center gap-2.5 px-2 py-1.5">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white shadow-lg"
            style={{
              background: `linear-gradient(135deg, var(--series-desky), var(--accent-violet))`,
              boxShadow: "0 4px 16px color-mix(in srgb, var(--series-desky) 40%, transparent)",
            }}
          >
            D
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">Desky</div>
            <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              Pricing Intelligence
            </div>
          </div>
        </Link>

        <nav className="mt-8 flex flex-col gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
                style={{
                  color: active ? "var(--text-primary)" : "var(--text-secondary)",
                  background: active ? "var(--surface-1)" : "transparent",
                  border: `1px solid ${active ? "var(--border-strong)" : "transparent"}`,
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ color: active ? "var(--series-desky)" : "var(--text-muted)" }}
                >
                  {item.icon}
                </svg>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div
        className="rounded-lg border px-3 py-3 text-[11px] leading-relaxed"
        style={{ borderColor: "var(--border)", color: "var(--text-muted)", background: "var(--surface-1)" }}
      >
        Live prices, scraped directly from each retailer&apos;s public storefront every 3 hours.
      </div>
    </aside>
  );
}
