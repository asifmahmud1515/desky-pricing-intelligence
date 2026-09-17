import { getWriteDb } from "../src/lib/db";
import { RETAILERS } from "../src/lib/retailers";
import { fetchShopifyCatalog } from "../src/lib/shopify";
import { categorize, isExcludedProduct } from "../src/lib/categorize";

async function main() {
  const db = getWriteDb();
  const now = new Date().toISOString();

  const upsertRetailer = db.prepare(`
    INSERT INTO retailers (slug, name, domain, is_desky)
    VALUES (@slug, @name, @domain, @isDesky)
    ON CONFLICT(slug) DO UPDATE SET name = excluded.name, domain = excluded.domain
    RETURNING id
  `);

  const upsertProduct = db.prepare(`
    INSERT INTO products (retailer_id, external_id, handle, title, category, url, image_url, first_seen_at)
    VALUES (@retailerId, @externalId, @handle, @title, @category, @url, @imageUrl, @now)
    ON CONFLICT(retailer_id, external_id) DO UPDATE SET
      title = excluded.title, category = excluded.category, url = excluded.url, image_url = excluded.image_url
    RETURNING id
  `);

  const insertSnapshot = db.prepare(`
    INSERT INTO price_snapshots (product_id, price, compare_at_price, currency, in_stock, scraped_at)
    VALUES (@productId, @price, @compareAtPrice, @currency, @inStock, @scrapedAt)
  `);

  let totalStored = 0;

  for (const retailer of RETAILERS) {
    console.log(`\nScraping ${retailer.name} (${retailer.domain})...`);

    const retailerRow = upsertRetailer.get({
      slug: retailer.slug,
      name: retailer.name,
      domain: retailer.domain,
      isDesky: retailer.isTarget ? 1 : 0,
    }) as { id: number };

    let products;
    try {
      products = await fetchShopifyCatalog(retailer.domain);
    } catch (err) {
      console.error(`  failed: ${(err as Error).message}`);
      continue;
    }
    console.log(`  fetched ${products.length} catalog entries`);

    let stored = 0;
    for (const p of products) {
      if (isExcludedProduct(p.title, p.product_type)) continue;
      if (!p.variants || p.variants.length === 0) continue;

      const cheapest = p.variants.reduce((min, v) =>
        parseFloat(v.price) < parseFloat(min.price) ? v : min
      );
      const price = parseFloat(cheapest.price);
      if (!Number.isFinite(price) || price <= 0) continue;

      const category = categorize(p.title, p.product_type);

      const productRow = upsertProduct.get({
        retailerId: retailerRow.id,
        externalId: String(p.id),
        handle: p.handle,
        title: p.title,
        category,
        url: `https://${retailer.domain}/products/${p.handle}`,
        imageUrl: p.images?.[0]?.src ?? null,
        now,
      }) as { id: number };

      const compareAt = cheapest.compare_at_price ? parseFloat(cheapest.compare_at_price) : null;

      insertSnapshot.run({
        productId: productRow.id,
        price,
        compareAtPrice: compareAt && compareAt > price ? compareAt : null,
        currency: retailer.currency,
        inStock: cheapest.available ? 1 : 0,
        scrapedAt: now,
      });
      stored += 1;
    }

    console.log(`  stored ${stored} price snapshots`);
    totalStored += stored;
  }

  // Fold the WAL back into the main file so `data/pricing.db` alone is a complete,
  // git-committable snapshot (no dangling -wal/-shm dependency).
  db.pragma("wal_checkpoint(TRUNCATE)");
  db.close();
  console.log(`\nDone. ${totalStored} snapshots recorded at ${now}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
