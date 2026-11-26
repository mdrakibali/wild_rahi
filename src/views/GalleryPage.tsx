"use client";

import { PhotoCard } from "@/components/photography/PhotoCard";
import { GALLERY_FILTER_TABS } from "@/lib/categories";
import { filterPhotographs } from "@/lib/validation";
import type { Photograph } from "@/types/portfolio";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useMemo, useState } from "react";

export const GalleryPage: React.FC<{ photographs: Photograph[] }> = ({
  photographs,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category") || "all";
  const [selectedCategory, setSelectedCategory] = useState<string>(urlCategory);

  const activeCategory = urlCategory || selectedCategory;

  const publishedPhotos = useMemo(
    () =>
      filterPhotographs(photographs, {
        category: "all",
      }),
    [photographs],
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: publishedPhotos.length };
    for (const p of publishedPhotos) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
    return counts;
  }, [publishedPhotos]);

  const filteredPhotos = useMemo(
    () =>
      filterPhotographs(photographs, {
        category: activeCategory,
      }),
    [photographs, activeCategory],
  );

  const updateCategory = (next: string) => {
    setSelectedCategory(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") {
      params.delete("category");
    } else {
      params.set("category", next);
    }
    const qs = params.toString();
    router.replace(qs ? `/gallery?${qs}` : "/gallery", { scroll: false });
  };

  return (
    <div className="bg-background text-foreground pt-20">
      {/* Minimal Editorial Header */}
      <section className="bg-background border-b border-border py-14 lg:py-20">
        <div className="site-container space-y-3">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground font-medium">
            Wildlife Photography
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-serif font-semibold tracking-tight leading-[1.08]">
            Gallery
          </h1>
          <p className="text-base text-muted-foreground max-w-xl leading-relaxed">
            Birds, mammals, reptiles, amphibians, insects, wetlands, landscapes, and wild flora across North Bengal and Bangladesh.
          </p>
        </div>
      </section>

      {/* Clean Minimal Category Filter Bar */}
      <section className="bg-card/95 backdrop-blur-md border-b border-border sticky top-20 z-20">
        <div className="site-container py-3 flex items-center justify-between gap-4">
          <nav
            aria-label="Wildlife categories"
            className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1"
          >
            {GALLERY_FILTER_TABS.map((cat) => {
              const active = activeCategory === cat.id;
              const count = categoryCounts[cat.id] || 0;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => updateCategory(cat.id)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs tracking-[0.03em] transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {cat.label}
                  {count > 0 && (
                    <span className="ml-1.5 text-[10px] opacity-70 tabular-nums">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </section>

      {/* Standard 3-Column Card Grid */}
      <section className="site-container py-10 lg:py-16">
        {filteredPhotos.length === 0 ? (
          <div className="py-20 text-center space-y-4 rounded-lg border border-border bg-card p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-serif font-semibold text-foreground">
              No photographs in this category yet
            </h2>
            <p className="text-sm text-muted-foreground">
              Explore another wildlife group or return to all photographs.
            </p>
            <button
              type="button"
              onClick={() => updateCategory("all")}
              className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider cursor-pointer"
            >
              Show All
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
            {filteredPhotos.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                allPhotos={filteredPhotos}
                aspectClass="aspect-[4/3]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
