import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
expand(config());
import { defineConfig } from 'drizzle-kit';
export default defineConfig({
  out: './src/db/migrations',
  schema: './dist/src/db/schema/index.js',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    schema: 'purchase_tracker',
  },
});
