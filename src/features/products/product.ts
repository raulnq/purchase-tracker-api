import { z } from 'zod';
import { pgSchema, uuid, varchar } from 'drizzle-orm/pg-core';
import { categories } from '@/features/categories/category.js';

// Zod schema FIRST
export const productSchema = z.object({
  productId: z.uuid(),
  name: z.string().min(1).max(255),
  code: z.string().min(1).max(255),
  categoryId: z.uuid().nullable(),
});

export type Product = z.infer<typeof productSchema>;

// Drizzle table SECOND
const trackerSchema = pgSchema('purchase_tracker');

export const products = trackerSchema.table('products', {
  productId: uuid('productid').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 255 }).notNull(),
  categoryId: uuid('categoryid').references(() => categories.categoryId),
});
