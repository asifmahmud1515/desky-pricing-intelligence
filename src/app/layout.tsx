import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
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
      <body className="min-h-full">
        <div className="mx-auto flex max-w-[1400px]">
          <Sidebar />
          <div className="flex min-h-screen flex-1 flex-col">
            <header
              className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b px-6 py-3.5 backdrop-blur-md md:hidden"
              style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--bg-base) 80%, transparent)" }}
            >
              <Link href="/" className="flex items-center gap-2">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-md text-sm font-semibold text-white"
                  style={{ background: "var(--series-desky)" }}
                >
                  D
                </span>
                <span className="text-sm font-semibold tracking-tight">Desky Pricing Intelligence</span>
              </Link>
              <nav className="flex items-center gap-4 text-sm" style={{ color: "var(--text-secondary)" }}>
                <Link href="/">Overview</Link>
                <Link href="/products">Products</Link>
              </nav>
            </header>
            <main className="flex-1">{children}</main>
            <footer
              className="border-t px-6 py-6 text-center text-xs"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
            >
              Prices sourced live from each retailer&apos;s public storefront. Not affiliated with any competitor listed.
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
