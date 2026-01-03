import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
expand(config());
import { defineConfig } from 'drizzle-kit';
export default defineConfig({
  out: './src/database/migrations',
  schema: './dist/src/database/schemas.js',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    schema: 'purchase_tracker',
  },
});
