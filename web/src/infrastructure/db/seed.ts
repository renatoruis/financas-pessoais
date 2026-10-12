import 'dotenv/config';
import { readEnv } from '../config/env';
import { createDb } from './client';
import { seedBaseData } from './seed-base';

const db = createDb(readEnv().DATABASE_URL);
await seedBaseData(db);
console.log('Dados base criados (entidades, centros, categorias, definições).');
await db.$client.end();
