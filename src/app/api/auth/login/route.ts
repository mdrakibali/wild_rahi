import { NextResponse } from 'next/server';
import { db, adminUsers } from '@/lib/db';
import { eq } from 'drizzle-orm';
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  hashPassword,
  signSessionTokenAsync,
  verifyPassword,
} from '@/lib/auth';

// Rate limiter for login: max 5 attempts per minute per IP
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 5) {
    return false;
  }
  entry.count += 1;
  return true;
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please wait 1 minute before trying again.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const defaultAdminEmail = (process.env.ADMIN_EMAIL || 'admin@wildrahi.com').trim().toLowerCase();
    const defaultAdminPass = process.env.ADMIN_PASSWORD || 'WildRahi#2026';

    let user: { id: string; email: string; name: string } | null = null;

    try {
      const records = await db
        .select()
        .from(adminUsers)
        .where(eq(adminUsers.email, normalizedEmail))
        .limit(1);

      if (records.length > 0) {
        const admin = records[0];
        if (verifyPassword(password, admin.passwordHash)) {
          user = { id: admin.id, email: admin.email, name: admin.name };
        }
      }
    } catch (dbErr) {
      console.warn('[Auth Login] Database lookup failed, checking default env admin:', dbErr);
    }

    // Fallback/Bootstrap check for default admin if database is empty or not yet seeded
    if (!user && normalizedEmail === defaultAdminEmail && password === defaultAdminPass) {
      user = { id: 'admin-bootstrap', email: defaultAdminEmail, name: 'Razaul Hafiz Rahi' };
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = await signSessionTokenAsync(user);

    const response = NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, name: user.name, role: 'admin' },
      token,
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_TTL_SECONDS,
    });

    return response;
  } catch (err) {
    console.error('[Auth Login] Error:', err);
    return NextResponse.json(
      { error: 'An unexpected authentication error occurred.' },
      { status: 500 }
    );
  }
}

