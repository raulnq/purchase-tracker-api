import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schemas.js';
import { ENV } from '@/env.js';

export const client = drizzle(ENV.DATABASE_URL, {
  schema,
  logger: ENV.NODE_ENV === 'development',
});
