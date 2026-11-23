import { NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';

// Revalidate public portfolio data cache at most every 60 seconds
export const revalidate = 60;

export async function GET() {
  const data = await repository.getPublicPortfolio();
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
