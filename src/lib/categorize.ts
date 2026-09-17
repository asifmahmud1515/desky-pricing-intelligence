const RULES: [RegExp, string][] = [
  [/office pod|phone booth|meeting (room|booth)/i, "Office Pods & Booths"],
  [/monitor arm|monitor mount|monitor stand|monitor riser|monitor bracket|vesa mount/i, "Monitor Arms & Stands"],
  [/chair|stool/i, "Seating"],
  [
    /standing desk|sit.?stand|height adjustable desk|desk frame|frame only|corner desk|l.?shape desk|dual desk|single desk|gaming desk|fixed desk|manual desk|\d+\s*motor\b|lifting weight|height adjuster/i,
    "Standing Desks",
  ],
  [/desktop|desk top|table top|bamboo top|hardwood.*desk/i, "Desk Tops"],
  [/cable|grommet/i, "Cable Management"],
  [/mat\b|floor protector/i, "Mats"],
  [/light|lamp/i, "Lighting"],
  [/converter|riser stand/i, "Desk Converters"],
  [/drawer|cabinet|locker|organiser|organizer|partition|whiteboard/i, "Storage & Organisation"],
  [/laptop stand|phone stand|headphone|microphone stand|footrest|foot rest|caster/i, "Desk Accessories"],
];

/** Best-effort normalization into a shared taxonomy so catalogs from different retailers can be compared. */
export function categorize(title: string, productType?: string | null): string {
  const haystack = `${productType ?? ""} ${title}`.toLowerCase();
  for (const [pattern, category] of RULES) {
    if (pattern.test(haystack)) return category;
  }
  return "Other";
}

/** Products that aren't real comparable catalog items (store credit, hidden bundle SKUs, etc). */
export function isExcludedProduct(title: string, productType?: string | null): boolean {
  const haystack = `${productType ?? ""} ${title}`.toLowerCase();
  return haystack.includes("gift card") || haystack.includes("options_hidden_product");
}
