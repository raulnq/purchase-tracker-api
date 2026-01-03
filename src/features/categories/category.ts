import { z } from 'zod';
import { pgSchema, uuid, varchar } from 'drizzle-orm/pg-core';

// Zod schema FIRST
export const categorySchema = z.object({
  categoryId: z.uuid(),
  name: z.string().min(1).max(255),
});

export type Category = z.infer<typeof categorySchema>;

// Drizzle table SECOND
const trackerSchema = pgSchema('purchase_tracker');

export const categories = trackerSchema.table('categories', {
  categoryId: uuid('categoryid').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
});
