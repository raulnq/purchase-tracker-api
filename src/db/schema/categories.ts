import { pgSchema, uuid, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema as drizzle2zod } from 'drizzle-zod';

const purchaseTrackerSchema = pgSchema('purchase_tracker');

export const categories = purchaseTrackerSchema.table('categories', {
  categoryId: uuid('categoryid').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
});

export type Category = typeof categories.$inferSelect;

export const categorySchema = drizzle2zod(categories);
