export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="h-9 w-32 rounded-lg bg-muted animate-pulse mb-2" />
      <div className="h-4 w-80 rounded-lg bg-muted animate-pulse mb-8" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  );
}
