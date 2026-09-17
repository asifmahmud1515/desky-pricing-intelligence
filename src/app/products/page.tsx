import { ProductExplorer } from "@/components/ProductExplorer";
import { getProducts } from "@/lib/queries";

export default function ProductsPage() {
  const products = getProducts();

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Product explorer</h1>
      <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
        {products.length.toLocaleString()} products tracked live across every retailer. Search, filter, and sort.
      </p>
      <ProductExplorer products={products} />
    </div>
  );
}
