'use client';

import React, { useMemo } from 'react';
import { Link } from '@/lib/router-compat';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, Camera, Expand, MapPin, Share2 } from 'lucide-react';
import { usePortfolio } from '@/context/PortfolioContext';
import { formatExifMetadata } from '@/lib/validation';
import { Button } from '@/components/ui/Button';

interface PhotoDetailPageProps {
  slug: string;
}

export const PhotoDetailPage: React.FC<PhotoDetailPageProps> = ({ slug }) => {
  const router = useRouter();
  const { photographs, collections, profile } = usePortfolio();

  const photo = useMemo(() => {
    return photographs.find((p) => (p.slug || p.id) === slug || p.id === slug) || photographs[0];
  }, [photographs, slug]);

  const category = useMemo(() => {
    if (!photo) return null;
    return collections.find((c) => c.id === photo.collectionId);
  }, [collections, photo]);

  const relatedPhotos = useMemo(() => {
    if (!photo) return [];
    return photographs
      .filter((p) => p.id !== photo.id && (photo.collectionId ? p.collectionId === photo.collectionId : true))
      .slice(0, 4);
  }, [photographs, photo]);

  if (!photo) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-32 pb-20 site-container text-center space-y-4">
        <h1 className="text-2xl font-serif font-bold">Plate Not Found</h1>
        <p className="text-sm text-muted-foreground">The requested photograph plate could not be found.</p>
        <Link to="/gallery">
          <Button variant="primary">Return to Gallery</Button>
        </Link>
      </div>
    );
  }

  const exif = formatExifMetadata(photo);

  return (
    <div className="bg-background text-foreground pt-24 pb-20">
      {/* Top Breadcrumb Nav */}
      <div className="site-container pb-6">
        <Link
          to="/gallery"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Wildlife Gallery
        </Link>
      </div>

      {/* Main Single Photo Showcase */}
      <section className="site-container">
        <div className="bg-card border border-border rounded-md overflow-hidden shadow-lg grid grid-cols-1 lg:grid-cols-12">
          {/* Main High-Res Image Frame */}
          <div className="lg:col-span-8 bg-black flex items-center justify-center min-h-[420px] lg:min-h-[640px] p-2 sm:p-4">
            <img
              src={photo.imageUrl}
              alt={photo.title}
              className="max-h-[85vh] w-auto max-w-full object-contain"
            />
          </div>

          {/* Details & Optics Panel */}
          <div className="lg:col-span-4 p-6 sm:p-8 flex flex-col justify-between space-y-6 border-t lg:border-t-0 lg:border-l border-border bg-secondary/30">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-secondary border border-border text-foreground">
                    {photo.year || 'Field Archive'}
                  </span>
                  {category && (
                    <span className="text-[11px] font-medium uppercase tracking-wider text-primary">
                      {category.title}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-foreground leading-tight">
                  {photo.title}
                </h1>

                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-1">
                  <span>{photo.speciesName || 'Wildlife Subject'}</span>
                  {photo.locationName && (
                    <>
                      <span>&middot;</span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {photo.locationName}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {photo.caption && (
                <div className="space-y-1 border-l-2 border-primary/50 pl-3">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Field Journal Note
                  </p>
                  <p className="text-sm text-foreground/85 leading-relaxed italic">
                    &ldquo;{photo.caption}&rdquo;
                  </p>
                </div>
              )}

              {/* Camera Optics & Technical EXIF */}
              <div className="bg-card border border-border rounded-md p-5 space-y-3">
                <div className="flex items-center gap-2 border-b border-border pb-2.5">
                  <Camera className="w-4 h-4 text-primary" />
                  <p className="text-xs uppercase tracking-[0.16em] text-foreground font-semibold">
                    Camera &amp; Technical Metadata
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  {photo.camera && (
                    <div className="flex justify-between py-1 border-b border-border/40">
                      <span className="text-muted-foreground font-mono">Camera:</span>
                      <span className="font-medium text-foreground">{photo.camera}</span>
                    </div>
                  )}
                  {photo.lens && (
                    <div className="flex justify-between py-1 border-b border-border/40">
                      <span className="text-muted-foreground font-mono">Optics:</span>
                      <span className="font-medium text-foreground">{photo.lens}</span>
                    </div>
                  )}
                  {exif && (
                    <div className="pt-1">
                      <span className="text-muted-foreground font-mono block text-[11px] mb-1">Exposure:</span>
                      <span className="font-mono text-xs text-foreground bg-secondary px-2.5 py-1 rounded inline-block">
                        {exif}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Direct Enquiry / Licensing CTA */}
            <div className="pt-6 border-t border-border space-y-3">
              <Link to="/contact">
                <Button
                  variant="primary"
                  className="w-full justify-center"
                  icon={<ArrowUpRight className="w-4 h-4" />}
                >
                  Enquire Archival Print or Licensing
                </Button>
              </Link>
              <p className="text-[11px] text-muted-foreground text-center">
                Photographed in natural light by {profile.photographerName}. Zero animal harassment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Plates Grid */}
      {relatedPhotos.length > 0 && (
        <section className="site-container pt-16">
          <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
            <h3 className="text-xl font-serif font-bold text-foreground">
              More from {category?.title || 'Archive'}
            </h3>
            <Link
              to="/gallery"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              View Full Gallery &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedPhotos.map((rel) => (
              <Link
                key={rel.id}
                to={`/photography/${encodeURIComponent(rel.slug || rel.id)}`}
                className="group relative rounded-md overflow-hidden bg-muted aspect-[4/3] border border-border"
              >
                <img
                  src={rel.imageUrl}
                  alt={rel.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex items-end">
                  <p className="text-xs text-white font-serif font-semibold truncate">
                    {rel.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

