import { NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await repository.getPublicPortfolio();
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
