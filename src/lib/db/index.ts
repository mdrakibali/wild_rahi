import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export * from './schema';

let client: postgres.Sql | null = null;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (dbInstance) return dbInstance;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn(
      '[Wild Rahi DB] DATABASE_URL is not set. Database queries will not execute until DATABASE_URL is provided in .env.local.'
    );
  }

  // Disable prefetch as it is not supported for "Transaction" pool mode in Supabase
  client = postgres(connectionString || 'postgresql://postgres:postgres@localhost:5432/postgres', {
    prepare: false,
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  dbInstance = drizzle(client, { schema });
  return dbInstance;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    const instance = getDb();
    // @ts-expect-error dynamic proxy forwarding
    return instance[prop];
  },
});

