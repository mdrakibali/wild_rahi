export default function GalleryLoading() {
  return (
    <div className="bg-background text-foreground pt-20">
      <section className="border-b border-border py-14 lg:py-20">
        <div className="site-container space-y-3">
          <div className="h-3 w-36 rounded-lg portfolio-shimmer" />
          <div className="h-12 w-48 rounded-lg portfolio-shimmer" />
          <div className="h-4 w-96 max-w-full rounded-lg portfolio-shimmer" />
        </div>
      </section>

      <section className="site-container py-10 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="rounded-lg border border-border overflow-hidden bg-card">
              <div className="aspect-[4/3] w-full portfolio-shimmer" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

