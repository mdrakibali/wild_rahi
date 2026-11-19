import { NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';

export async function GET() {
  const data = await repository.getPublicPortfolio();
  return NextResponse.json(data);
}

