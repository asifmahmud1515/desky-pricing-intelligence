export type RetailerSlug = "desky" | "deskit" | "standesk";

export interface RetailerConfig {
  slug: RetailerSlug;
  name: string;
  domain: string;
  /** True for Desky itself — the brand this dashboard is built for. */
  isTarget: boolean;
  currency: string;
}

export const RETAILERS: RetailerConfig[] = [
  { slug: "desky", name: "Desky", domain: "desky.com.au", isTarget: true, currency: "AUD" },
  { slug: "deskit", name: "Deskit", domain: "www.deskit.com.au", isTarget: false, currency: "AUD" },
  { slug: "standesk", name: "Standesk", domain: "www.standesk.com.au", isTarget: false, currency: "AUD" },
];
