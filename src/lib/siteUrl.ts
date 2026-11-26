import { headers } from 'next/headers';

interface HeaderLookup {
  get(name: string): string | null;
}

function normalizeOrigin(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

function firstHeaderValue(value: string | null): string {
  if (!value) return '';
  return value.split(',')[0]?.trim() || '';
}

function isLocalHostName(host: string): boolean {
  const lower = host.toLowerCase();
  return (
    lower.startsWith('localhost') ||
    lower.startsWith('127.0.0.1') ||
    lower.startsWith('[::1]')
  );
}

/**
 * Pure origin resolver usable both with Next.js request headers and environment fallbacks.
 */
export function resolveOriginFromContext(
  requestHeaders?: HeaderLookup | null,
  env: Record<string, string | undefined> = process.env
): string {
  if (requestHeaders) {
    const host =
      firstHeaderValue(requestHeaders.get('x-forwarded-host')) ||
      firstHeaderValue(requestHeaders.get('host'));

    if (host) {
      const forwardedProto = firstHeaderValue(requestHeaders.get('x-forwarded-proto'));
      const proto = forwardedProto || (isLocalHostName(host) ? 'http' : 'https');
      return normalizeOrigin(`${proto}://${host}`);
    }
  }

  if (env.APP_URL?.trim()) {
    return normalizeOrigin(env.APP_URL);
  }
  if (env.VERCEL_PROJECT_PRODUCTION_URL?.trim()) {
    return `https://${normalizeOrigin(env.VERCEL_PROJECT_PRODUCTION_URL)}`;
  }
  if (env.VERCEL_URL?.trim()) {
    return `https://${normalizeOrigin(env.VERCEL_URL)}`;
  }
  if (env.RENDER_EXTERNAL_URL?.trim()) {
    return normalizeOrigin(env.RENDER_EXTERNAL_URL);
  }

  return 'http://localhost:3000';
}

/**
 * Resolves the active site origin dynamically on the server from the current request host,
 * with automatic Vercel / Render / optional APP_URL fallbacks.
 */
export async function resolveSiteOrigin(): Promise<string> {
  try {
    const requestHeaders = await headers();
    return resolveOriginFromContext(requestHeaders);
  } catch {
    return resolveOriginFromContext(null);
  }
}
