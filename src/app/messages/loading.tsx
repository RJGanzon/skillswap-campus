export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="h-9 w-32 rounded-lg bg-muted animate-pulse mb-2" />
      <div className="h-4 w-64 rounded-lg bg-muted animate-pulse mb-8" />
      <div className="rounded-2xl border border-border/60 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 bg-muted animate-pulse border-b border-border/40 last:border-0" />
        ))}
      </div>
    </div>
  );
}
