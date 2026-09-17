# Desky Pricing Intelligence

Live competitor price tracking for [Desky](https://desky.com.au) — an internal dashboard for monitoring how Desky's catalog is priced against direct competitors.

**Tracked retailers:** Desky (`desky.com.au`), Deskit (`deskit.com.au`), Standesk (`standesk.com.au`) — chosen because all three publish a public Shopify `products.json` storefront feed, which the scraper reads directly rather than parsing HTML.

## How it works

- `scripts/scrape.ts` fetches each retailer's `/products.json` feed, normalizes every product into a shared category taxonomy (`src/lib/categorize.ts`), and appends a price snapshot to `data/pricing.db` (SQLite).
- The Next.js app (`src/app`) reads that database at build/request time — no live scraping happens in the deployed app itself.
- `.github/workflows/scrape.yml` runs the scraper daily via GitHub Actions, commits the updated `data/pricing.db`, and pushes to `main`. A connected Vercel project auto-redeploys on every push, so the live dashboard picks up fresh prices once a day. Price history accumulates snapshot-by-snapshot from there.

This keeps the whole thing serverless-deployment-friendly: no external database to provision, and the git history of `data/pricing.db` doubles as an audit trail of every scrape.

## Commands

```bash
npm run dev      # local dev server
npm run build    # production build
npm run start    # run the production build
npm run scrape   # run the live scraper and update data/pricing.db
```

## Project structure

- `src/lib/shopify.ts` — paginated Shopify `products.json` fetcher
- `src/lib/categorize.ts` — keyword-based category normalization across retailers
- `src/lib/db.ts` — SQLite read/write handles (write handle is scrape-only; the web app only ever reads)
- `src/lib/queries.ts` — dashboard query layer (retailer summaries, category comparison, product list, price history)
- `src/app/page.tsx` — overview dashboard (KPIs, category price comparison chart, full category table)
- `src/app/products` — searchable/sortable/filterable product explorer

## Known limitations (prototype scope)

- Category assignment is keyword-based and will occasionally misclassify an oddly-named SKU.
- Only 3 competitors are tracked; extending coverage means adding a retailer to `src/lib/retailers.ts` (Shopify-based storefronts work out of the box — others need a custom fetcher in `src/lib/shopify.ts`-style module).
- Price history is only as deep as the number of scrapes that have run since this was set up — it gets more useful every day the scheduled workflow runs.
