export default function StoriesLoading() {
  return (
    <div className="bg-background text-foreground pt-20">
      <section className="border-b border-border py-14 lg:py-20">
        <div className="site-container space-y-3">
          <div className="h-3 w-36 rounded-lg portfolio-shimmer" />
          <div className="h-12 w-48 rounded-lg portfolio-shimmer" />
          <div className="h-4 w-80 max-w-full rounded-lg portfolio-shimmer" />
        </div>
      </section>

      <section className="site-container py-12 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 lg:gap-8">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="rounded-lg border border-border overflow-hidden bg-card">
              <div className="aspect-[16/10] w-full portfolio-shimmer" />
              <div className="p-6 space-y-3">
                <div className="h-6 w-3/4 rounded-lg portfolio-shimmer" />
                <div className="h-4 w-full rounded-lg portfolio-shimmer" />
                <div className="h-4 w-2/3 rounded-lg portfolio-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

