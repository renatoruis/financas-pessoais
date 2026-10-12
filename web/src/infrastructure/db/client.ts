import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const MAX_CONNECTIONS = 5;

export function createDb(url: string) {
  const client = postgres(url, { max: MAX_CONNECTIONS, onnotice: () => {} });
  return drizzle(client, { schema });
}

export type Db = ReturnType<typeof createDb>;
export type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];
