import { NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getAdminSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ authenticated: false, admin: null });
  }

  return NextResponse.json({
    authenticated: true,
    admin: {
      id: session.sub,
      email: session.email,
      name: session.name,
      role: 'admin',
    },
  });
}

