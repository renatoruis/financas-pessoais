import 'dotenv/config';
import { readEnv } from '../config/env';
import { createDb } from './client';
import { runMigrations } from './migrations';

const db = createDb(readEnv().DATABASE_URL);
await runMigrations(db);
console.log('Migrações aplicadas.');
await db.$client.end();
