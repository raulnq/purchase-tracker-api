import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@/db/schema/index.js';
import { ENV } from '@/env.js';
console.log('Database URL:', ENV.DATABASE_URL);
export const db = drizzle(ENV.DATABASE_URL, { schema, logger: true });
