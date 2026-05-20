export default function StatCard({
  label, value, sub, accent,
}: { label: string; value: string; sub?: string; accent?: "primary" | "herb" | "accent" }) {
  const ring =
    accent === "primary" ? "from-primary/10 to-primary/0" :
    accent === "herb" ? "from-herb/15 to-herb/0" :
    accent === "accent" ? "from-accent/15 to-accent/0" :
    "from-secondary to-transparent";
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-card border border-border/60 p-5 shadow-soft`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${ring} pointer-events-none`} />
      <p className="relative text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="relative font-display text-3xl font-bold mt-2">{value}</p>
      {sub && <p className="relative text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}
