const SERIES_VAR: Record<string, string> = {
  desky: "var(--series-desky)",
  deskit: "var(--series-deskit)",
  standesk: "var(--series-standesk)",
};

export function retailerColor(slug: string): string {
  return SERIES_VAR[slug] ?? "var(--text-muted)";
}

export function RetailerTag({ slug, name }: { slug: string; name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm" style={{ color: "var(--text-primary)" }}>
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ background: retailerColor(slug) }}
        aria-hidden
      />
      {name}
    </span>
  );
}
