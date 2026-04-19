export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="h-9 w-48 rounded-lg bg-muted animate-pulse mb-2" />
        <div className="h-4 w-64 rounded-lg bg-muted animate-pulse" />
      </div>
      <div className="h-14 rounded-2xl bg-muted animate-pulse mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  );
}
