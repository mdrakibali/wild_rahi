import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
import { repository } from './db/repository';

export const PORTFOLIO_CACHE_TAG = 'portfolio';

/**
 * Cached server-side portfolio snapshot shared across public Server Components.
 * Revalidated immediately whenever an admin saves or deletes content.
 */
export const getCachedPublicPortfolio = unstable_cache(
  async () => {
    return repository.getPublicPortfolio();
  },
  ['public-portfolio-v1'],
  {
    tags: [PORTFOLIO_CACHE_TAG],
    revalidate: 3600,
  }
);

/**
 * Purges public portfolio data cache and all public App Router paths.
 */
export function revalidatePortfolioCache(): void {
  revalidateTag(PORTFOLIO_CACHE_TAG);
  revalidatePath('/', 'layout');
  revalidatePath('/');
  revalidatePath('/gallery');
  revalidatePath('/videos');
  revalidatePath('/stories');
  revalidatePath('/about');
  revalidatePath('/contact');
}
