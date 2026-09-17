import { getReadDb } from "./db";

export interface RetailerSummary {
  slug: string;
  name: string;
  domain: string;
  isDesky: boolean;
  productCount: number;
  avgPrice: number | null;
  lastScrapedAt: string | null;
}

export interface CategoryRow {
  category: string;
  totalProducts: number;
  byRetailer: Record<
    string,
    { avgPrice: number | null; minPrice: number | null; maxPrice: number | null; count: number }
  >;
  deskyVsCompetitorPct: number | null;
}

export interface ProductRow {
  id: number;
  title: string;
  category: string;
  url: string;
  imageUrl: string | null;
  retailerSlug: string;
  retailerName: string;
  isDesky: boolean;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  inStock: boolean;
  scrapedAt: string;
}

export interface PriceHistoryPoint {
  price: number;
  scrapedAt: string;
}

const LATEST_SNAPSHOT_JOIN = `
  JOIN price_snapshots s ON s.id = (
    SELECT id FROM price_snapshots WHERE product_id = p.id ORDER BY scraped_at DESC LIMIT 1
  )
`;

export function getRetailerSummaries(): RetailerSummary[] {
  const db = getReadDb();
  const rows = db
    .prepare(
      `
      SELECT
        r.slug,
        r.name,
        r.domain,
        r.is_desky AS isDesky,
        COUNT(p.id) AS productCount,
        AVG(s.price) AS avgPrice,
        MAX(s.scraped_at) AS lastScrapedAt
      FROM retailers r
      LEFT JOIN products p ON p.retailer_id = r.id
      LEFT JOIN price_snapshots s ON s.id = (
        SELECT id FROM price_snapshots WHERE product_id = p.id ORDER BY scraped_at DESC LIMIT 1
      )
      GROUP BY r.id
      ORDER BY r.is_desky DESC, r.name ASC
      `
    )
    .all() as Array<{
    slug: string;
    name: string;
    domain: string;
    isDesky: number;
    productCount: number;
    avgPrice: number | null;
    lastScrapedAt: string | null;
  }>;

  return rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    domain: r.domain,
    isDesky: !!r.isDesky,
    productCount: r.productCount,
    avgPrice: r.avgPrice,
    lastScrapedAt: r.lastScrapedAt,
  }));
}

export function getCategoryComparison(): CategoryRow[] {
  const db = getReadDb();
  const rows = db
    .prepare(
      `
      SELECT
        p.category AS category,
        r.slug AS retailerSlug,
        r.is_desky AS isDesky,
        COUNT(p.id) AS count,
        AVG(s.price) AS avgPrice,
        MIN(s.price) AS minPrice,
        MAX(s.price) AS maxPrice
      FROM products p
      JOIN retailers r ON r.id = p.retailer_id
      ${LATEST_SNAPSHOT_JOIN}
      GROUP BY p.category, r.id
      `
    )
    .all() as Array<{
    category: string;
    retailerSlug: string;
    isDesky: number;
    count: number;
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
  }>;

  const byCategory = new Map<string, CategoryRow>();
  for (const row of rows) {
    if (!byCategory.has(row.category)) {
      byCategory.set(row.category, {
        category: row.category,
        totalProducts: 0,
        byRetailer: {},
        deskyVsCompetitorPct: null,
      });
    }
    const cat = byCategory.get(row.category)!;
    cat.totalProducts += row.count;
    cat.byRetailer[row.retailerSlug] = {
      avgPrice: row.avgPrice,
      minPrice: row.minPrice,
      maxPrice: row.maxPrice,
      count: row.count,
    };
  }

  for (const cat of byCategory.values()) {
    const deskyAvg = cat.byRetailer["desky"]?.avgPrice ?? null;
    const competitorPrices = Object.entries(cat.byRetailer)
      .filter(([slug]) => slug !== "desky")
      .map(([, v]) => v.avgPrice)
      .filter((v): v is number => v != null);
    const competitorAvg =
      competitorPrices.length > 0
        ? competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length
        : null;
    if (deskyAvg != null && competitorAvg != null && competitorAvg > 0) {
      cat.deskyVsCompetitorPct = ((deskyAvg - competitorAvg) / competitorAvg) * 100;
    }
  }

  return Array.from(byCategory.values()).sort((a, b) => b.totalProducts - a.totalProducts);
}

export function getProducts(): ProductRow[] {
  const db = getReadDb();
  const rows = db
    .prepare(
      `
      SELECT
        p.id AS id,
        p.title AS title,
        p.category AS category,
        p.url AS url,
        p.image_url AS imageUrl,
        r.slug AS retailerSlug,
        r.name AS retailerName,
        r.is_desky AS isDesky,
        s.price AS price,
        s.compare_at_price AS compareAtPrice,
        s.currency AS currency,
        s.in_stock AS inStock,
        s.scraped_at AS scrapedAt
      FROM products p
      JOIN retailers r ON r.id = p.retailer_id
      ${LATEST_SNAPSHOT_JOIN}
      ORDER BY p.category ASC, p.title ASC
      `
    )
    .all() as Array<
    Omit<ProductRow, "isDesky" | "inStock"> & { isDesky: number; inStock: number }
  >;

  return rows.map((r) => ({ ...r, isDesky: !!r.isDesky, inStock: !!r.inStock }));
}

export function getProductHistory(productId: number): PriceHistoryPoint[] {
  const db = getReadDb();
  return db
    .prepare(
      `SELECT price, scraped_at AS scrapedAt FROM price_snapshots WHERE product_id = ? ORDER BY scraped_at ASC`
    )
    .all(productId) as PriceHistoryPoint[];
}

export function getLastScrapedAt(): string | null {
  const db = getReadDb();
  const row = db.prepare(`SELECT MAX(scraped_at) AS ts FROM price_snapshots`).get() as {
    ts: string | null;
  };
  return row.ts;
}
