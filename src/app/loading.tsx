export default function Loading() {
  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="h-[68vh] w-full portfolio-shimmer" />
      <div className="site-container py-16 space-y-6">
        <div className="h-4 w-32 rounded-lg portfolio-shimmer" />
        <div className="h-9 w-72 rounded-lg portfolio-shimmer" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="aspect-[4/3] rounded-lg portfolio-shimmer border border-border" />
          ))}
        </div>
      </div>
    </div>
  );
}

