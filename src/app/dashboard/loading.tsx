export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-10">
        <div className="h-9 w-80 rounded-lg bg-muted animate-pulse mb-2" />
        <div className="h-4 w-64 rounded-lg bg-muted animate-pulse" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  );
}
