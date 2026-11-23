import React from 'react';
import { Link } from '@/lib/router-compat';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const ConservationCta: React.FC = () => {
  return (
    <section className="bg-muted border-t border-border py-20">
      <div className="site-container flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="max-w-2xl space-y-2.5">
          <h2 className="text-3xl font-serif font-bold tracking-tight text-foreground">
            Partner With Wild Rahi on Conservation Media
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Non-profits, researchers, universities, and conservation publications can request
            visual documentation, species reference images, or awareness talks.
          </p>
        </div>
        <div className="flex flex-wrap gap-3.5">
          <Link to="/contact">
            <Button
              variant="primary"
              size="lg"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Discuss a Collaboration
            </Button>
          </Link>
          <Link to="/wildlife">
            <Button
              variant="outline"
              size="lg"
            >
              Browse Species Archive
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

