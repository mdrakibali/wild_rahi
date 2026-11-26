import { NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getAdminSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ authenticated: false, user: null, admin: null });
  }

  const user = {
    id: session.sub,
    email: session.email,
    name: session.name,
    role: 'admin' as const,
  };

  return NextResponse.json({
    authenticated: true,
    user,
    admin: user,
  });
}
