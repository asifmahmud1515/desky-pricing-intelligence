export interface ShopifyVariant {
  id: number;
  price: string;
  compare_at_price: string | null;
  available: boolean;
}

export interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  product_type: string;
  vendor: string;
  variants: ShopifyVariant[];
  images: { src: string }[];
}

const USER_AGENT =
  "Mozilla/5.0 (compatible; DeskyPricingIntelligence/1.0; +https://github.com/asifmahmud1515/desky-pricing-intelligence)";

/** Paginates a storefront's public Shopify `/products.json` feed. */
export async function fetchShopifyCatalog(domain: string): Promise<ShopifyProduct[]> {
  const all: ShopifyProduct[] = [];
  let page = 1;

  while (page <= 20) {
    const url = `https://${domain}/products.json?limit=250&page=${page}`;
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) {
      throw new Error(`${domain}: request failed with ${res.status}`);
    }
    const data = (await res.json()) as { products?: ShopifyProduct[] };
    const products = data.products ?? [];
    if (products.length === 0) break;
    all.push(...products);
    if (products.length < 250) break;
    page += 1;
  }

  return all;
}
