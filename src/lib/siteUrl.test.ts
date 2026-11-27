import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveOriginFromContext, resolveStaticSiteOrigin } from './siteUrl';

function mockHeaders(values: Record<string, string>) {
  return {
    get(name: string) {
      return values[name.toLowerCase()] ?? null;
    },
  };
}

test('resolveOriginFromContext prioritizes incoming request host and protocol', () => {
  assert.equal(
    resolveOriginFromContext(
      mockHeaders({ host: 'localhost:3000' }),
      { APP_URL: 'https://wildrahi.com' }
    ),
    'http://localhost:3000'
  );

  assert.equal(
    resolveOriginFromContext(
      mockHeaders({
        'x-forwarded-host': 'wild-rahi.vercel.app',
        'x-forwarded-proto': 'https',
      }),
      {}
    ),
    'https://wild-rahi.vercel.app'
  );

  assert.equal(
    resolveOriginFromContext(
      mockHeaders({ host: 'wildrahi.com' }),
      {}
    ),
    'https://wildrahi.com'
  );
});

test('resolveOriginFromContext falls back cleanly when headers are unavailable', () => {
  assert.equal(
    resolveOriginFromContext(null, { VERCEL_URL: 'wild-rahi-preview.vercel.app' }),
    'https://wild-rahi-preview.vercel.app'
  );
  assert.equal(
    resolveOriginFromContext(null, { RENDER_EXTERNAL_URL: 'https://wild-rahi.onrender.com/' }),
    'https://wild-rahi.onrender.com'
  );
  assert.equal(resolveOriginFromContext(null, {}), 'http://localhost:3000');
  assert.equal(
    resolveStaticSiteOrigin({ VERCEL_PROJECT_PRODUCTION_URL: 'wildrahi.com' }),
    'https://wildrahi.com'
  );
});

