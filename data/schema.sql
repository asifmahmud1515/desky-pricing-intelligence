CREATE TABLE IF NOT EXISTS retailers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  is_desky INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  retailer_id INTEGER NOT NULL REFERENCES retailers(id),
  external_id TEXT NOT NULL,
  handle TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  url TEXT NOT NULL,
  image_url TEXT,
  first_seen_at TEXT NOT NULL,
  UNIQUE(retailer_id, external_id)
);

CREATE TABLE IF NOT EXISTS price_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id),
  price REAL NOT NULL,
  compare_at_price REAL,
  currency TEXT NOT NULL DEFAULT 'AUD',
  in_stock INTEGER NOT NULL DEFAULT 1,
  scraped_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_snapshots_product_time ON price_snapshots(product_id, scraped_at);
CREATE INDEX IF NOT EXISTS idx_products_retailer_category ON products(retailer_id, category);
