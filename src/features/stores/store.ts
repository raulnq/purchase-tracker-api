import { z } from 'zod';
import { boolean, varchar, pgSchema, uuid } from 'drizzle-orm/pg-core';

// Zod schema FIRST
export const storeSchema = z.object({
  storeId: z.uuid(),
  name: z.string().min(1).max(255),
  enabled: z.boolean().default(true),
});

export type Store = z.infer<typeof storeSchema>;

// Drizzle table SECOND
const trackerSchema = pgSchema('purchase_tracker');

export const stores = trackerSchema.table('stores', {
  storeId: uuid('storeid').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  enabled: boolean('enabled').notNull().default(true),
});
