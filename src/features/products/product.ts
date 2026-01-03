import { z } from 'zod';
import { pgSchema, uuid, varchar, index } from 'drizzle-orm/pg-core';
import { categories } from '@/features/categories/category.js';

// Zod schema FIRST
export const productSchema = z.object({
  productId: z.uuid(),
  name: z.string().min(1).max(1024),
  categoryId: z.uuid().nullable(),
});

export type Product = z.infer<typeof productSchema>;

// Drizzle table SECOND
const trackerSchema = pgSchema('purchase_tracker');

export const products = trackerSchema.table(
  'products',
  {
    productId: uuid('productid').primaryKey(),
    name: varchar('name', { length: 1024 }).notNull(),
    categoryId: uuid('categoryid').references(() => categories.categoryId),
  },
  table => [index('idx_products_category_id').on(table.categoryId)]
);
