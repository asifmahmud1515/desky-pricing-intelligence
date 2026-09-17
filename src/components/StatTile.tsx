export function StatTile({
  label,
  value,
  delta,
  deltaGoodDirection = "down",
  sub,
}: {
  label: string;
  value: string;
  delta?: string | null;
  deltaGoodDirection?: "up" | "down";
  sub?: string;
}) {
  const isPositive = delta?.trim().startsWith("+");
  const isGood = delta != null && (deltaGoodDirection === "down" ? !isPositive : isPositive);

  return (
    <div
      className="rounded-xl border p-5"
      style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
    >
      <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
        {label}
      </div>
      <div className="mt-2 text-3xl font-semibold" style={{ color: "var(--text-primary)" }}>
        {value}
      </div>
      {(delta || sub) && (
        <div className="mt-1.5 flex items-center gap-1.5 text-sm">
          {delta && (
            <span style={{ color: isGood ? "var(--success)" : "var(--text-secondary)" }}>
              {delta}
            </span>
          )}
          {sub && <span style={{ color: "var(--text-muted)" }}>{sub}</span>}
        </div>
      )}
    </div>
  );
}
