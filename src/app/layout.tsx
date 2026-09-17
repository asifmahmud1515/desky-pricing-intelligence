import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Desky Pricing Intelligence",
  description: "Live competitor price tracking for Desky products.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header
          className="sticky top-0 z-10 border-b backdrop-blur-sm"
          style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--surface-2) 85%, transparent)" }}
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
            <Link href="/" className="flex items-center gap-2">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-md text-sm font-semibold text-white"
                style={{ background: "var(--series-desky)" }}
              >
                D
              </span>
              <span className="text-sm font-semibold tracking-tight">
                Desky Pricing Intelligence
              </span>
            </Link>
            <nav className="flex items-center gap-5 text-sm" style={{ color: "var(--text-secondary)" }}>
              <Link href="/" className="hover:opacity-100" style={{ opacity: 0.85 }}>
                Overview
              </Link>
              <Link href="/products" className="hover:opacity-100" style={{ opacity: 0.85 }}>
                Product Explorer
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer
          className="border-t px-6 py-6 text-center text-xs"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
        >
          Prices sourced live from each retailer&apos;s public storefront. Not affiliated with any competitor listed.
        </footer>
      </body>
    </html>
  );
}
