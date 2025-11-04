import { pgSchema, uuid, varchar } from 'drizzle-orm/pg-core';
import { categories } from './categories.js';
import { createInsertSchema as drizzle2zod } from 'drizzle-zod';

const purchaseTrackerSchema = pgSchema('purchase_tracker');

export const products = purchaseTrackerSchema.table('products', {
  productId: uuid('productid').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 255 }),
  categoryId: uuid('categoryid').references(() => categories.categoryId),
});

export type Product = typeof products.$inferSelect;

export const productSchema = drizzle2zod(products);
