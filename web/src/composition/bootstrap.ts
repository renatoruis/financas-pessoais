import { readEnv } from '@/infrastructure/config/env';
import { createDb } from '@/infrastructure/db/client';
import { runMigrations } from '@/infrastructure/db/migrations';
import { seedBaseData } from '@/infrastructure/db/seed-base';

/** Arranque do servidor: aplica migrações e garante os dados base. Idempotente. */
export async function bootstrapDatabase(): Promise<void> {
  const db = createDb(readEnv().DATABASE_URL);
  try {
    await runMigrations(db);
    await seedBaseData(db);
  } finally {
    await db.$client.end();
  }
}
