import path from 'node:path';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import type { Db } from './client';

export const MIGRATIONS_FOLDER = path.join(process.cwd(), 'drizzle');

export async function runMigrations(db: Db): Promise<void> {
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
}
