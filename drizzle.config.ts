import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './db/schema.ts',
  out: './db/migrations',
  dbCredentials: {
    url: process.env.SUPABASE_DB_URL ?? '',
  },
  verbose: true,
  strict: true,
});
