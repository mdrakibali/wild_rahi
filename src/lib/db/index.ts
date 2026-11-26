import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export * from './schema';

const globalForDb = globalThis as unknown as {
  __wildRahiSql?: postgres.Sql;
  __wildRahiDb?: ReturnType<typeof drizzle<typeof schema>>;
};

export function getDb() {
  if (globalForDb.__wildRahiDb) return globalForDb.__wildRahiDb;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn(
      '[Wild Rahi DB] DATABASE_URL is not set. Database queries will not execute until DATABASE_URL is provided in .env.local.'
    );
  }

  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';
  const poolMax = isBuildPhase ? 1 : 3;

  // Cache client on globalThis to prevent HMR connection leaks in dev and keep Supabase pool usage minimal
  const client =
    globalForDb.__wildRahiSql ||
    postgres(connectionString || 'postgresql://postgres:postgres@localhost:5432/postgres', {
      prepare: false,
      max: poolMax,
      idle_timeout: 15,
      max_lifetime: 300,
      connect_timeout: 10,
    });

  globalForDb.__wildRahiSql = client;
  globalForDb.__wildRahiDb = drizzle(client, { schema });
  return globalForDb.__wildRahiDb;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    const instance = getDb();
    // @ts-expect-error dynamic proxy forwarding
    return instance[prop];
  },
});
