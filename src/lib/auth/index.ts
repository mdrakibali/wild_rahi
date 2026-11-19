import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export const SESSION_COOKIE_NAME = 'wr_session';
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days
const SCRYPT_KEYLEN = 64;

export interface SessionPayload {
  sub: string;
  email: string;
  name: string;
  role: 'admin';
  exp?: number;
}

function getJwtSecret(): Uint8Array {
  const secret =
    process.env.AUTH_SECRET ||
    process.env.SESSION_SECRET ||
    'wild-rahi-super-secret-key-at-least-32-chars-long';
  return new TextEncoder().encode(secret);
}

function getSecretString(): string {
  return (
    process.env.AUTH_SECRET ||
    process.env.SESSION_SECRET ||
    'wild-rahi-super-secret-key-at-least-32-chars-long'
  );
}

/**
 * Hashes a plain text password using bcrypt with salt, prefixed with 'bcrypt:' to maintain colon separator.
 */
export function hashPassword(plainPassword: string): string {
  const salt = bcrypt.genSaltSync(12);
  const hash = bcrypt.hashSync(plainPassword, salt);
  return `bcrypt:${hash}`;
}

/**
 * Verifies a plain text password against a stored bcrypt or legacy scrypt hash.
 */
export function verifyPassword(plainPassword: string, storedHash: string): boolean {
  if (!plainPassword || !storedHash) return false;

  if (storedHash.startsWith('bcrypt:')) {
    try {
      return bcrypt.compareSync(plainPassword, storedHash.slice(7));
    } catch {
      return false;
    }
  }

  if (storedHash.startsWith('$2')) {
    try {
      return bcrypt.compareSync(plainPassword, storedHash);
    } catch {
      return false;
    }
  }

  // Backward compatibility with previous crypto.scryptSync salt:hex format
  const parts = storedHash.split(':');
  if (parts.length === 2) {
    const [salt, expectedHex] = parts;
    if (!salt || !expectedHex) return false;
    try {
      const derived = crypto.scryptSync(plainPassword, salt, SCRYPT_KEYLEN);
      const expected = Buffer.from(expectedHex, 'hex');
      if (derived.length !== expected.length) return false;
      return crypto.timingSafeEqual(derived, expected);
    } catch {
      return false;
    }
  }

  return false;
}

function toBase64Url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function fromBase64Url(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + pad, 'base64').toString('utf8');
}

/**
 * Creates and signs a secure JWT session token for the administrator.
 */
export async function signSessionTokenAsync(
  user: { id: string; email: string; name: string },
  ttlSeconds = SESSION_TTL_SECONDS
): Promise<string> {
  const secret = getJwtSecret();
  return new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: 'admin',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(secret);
}

/**
 * Synchronous session token signer for backward compatibility with existing tests.
 */
export function signSessionToken(
  user: { id: string; email: string; name: string },
  secret = getSecretString(),
  ttlMs = SESSION_TTL_SECONDS * 1000
): string {
  const payload: SessionPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: 'admin',
    exp: Date.now() + ttlMs,
  };
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', secret)
    .update(encodedPayload)
    .digest();
  return `${encodedPayload}.${toBase64Url(signature)}`;
}

/**
 * Verifies a session token string (handles both JWT and test HMAC format).
 */
export async function verifySessionTokenAsync(token: string): Promise<SessionPayload | null> {
  if (!token || typeof token !== 'string') return null;

  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string,
      role: 'admin',
      exp: payload.exp,
    };
  } catch {
    return verifySessionToken(token);
  }
}

/**
 * Synchronous session verifier for test backwards compatibility.
 */
export function verifySessionToken(
  token: string,
  secret = getSecretString()
): SessionPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encodedPayload, providedSig] = parts;
  if (!encodedPayload || !providedSig) return null;

  const expectedSig = toBase64Url(
    crypto.createHmac('sha256', secret).update(encodedPayload).digest()
  );

  const providedBuf = Buffer.from(providedSig);
  const expectedBuf = Buffer.from(expectedSig);
  if (
    providedBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(providedBuf, expectedBuf)
  ) {
    return null;
  }

  try {
    const decoded = JSON.parse(fromBase64Url(encodedPayload)) as SessionPayload;
    if (decoded.exp && Date.now() > decoded.exp) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Helper to parse Cookie header into key-value map.
 */
export function parseCookies(cookieHeader?: string | null): Record<string, string> {
  if (!cookieHeader) return {};
  const result: Record<string, string> = {};
  for (const item of cookieHeader.split(';')) {
    const [rawKey, ...valParts] = item.trim().split('=');
    if (rawKey) {
      result[rawKey] = valParts.join('=');
    }
  }
  return result;
}

/**
 * Server-side helper to read and verify admin session from Request cookies or Authorization header.
 */
export async function getAdminSessionFromRequest(request: Request): Promise<SessionPayload | null> {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearer = authHeader.slice(7).trim();
    const verified = await verifySessionTokenAsync(bearer);
    if (verified) return verified;
  }

  const cookieHeader = request.headers.get('cookie');
  const parsed = parseCookies(cookieHeader);
  const cookieToken = parsed[SESSION_COOKIE_NAME];
  if (cookieToken) {
    return verifySessionTokenAsync(cookieToken);
  }

  return null;
}

/**
 * Server Component / Server Action helper using Next.js cookies() API.
 */
export async function getServerAdminSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) return null;
    return verifySessionTokenAsync(sessionCookie.value);
  } catch {
    return null;
  }
}
