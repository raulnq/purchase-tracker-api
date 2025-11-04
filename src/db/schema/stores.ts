import { boolean, varchar, pgSchema, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema as drizzle2zod } from 'drizzle-zod';

const trackerSchema = pgSchema('purchase_tracker');

export const stores = trackerSchema.table('stores', {
  storeId: uuid('storeid').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  enabled: boolean('enabled').notNull().default(true),
});

export type Store = typeof stores.$inferSelect;

export const storeSchema = drizzle2zod(stores);
