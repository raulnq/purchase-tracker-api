import {
  pgSchema,
  uuid,
  decimal,
  serial,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { purchases } from './purchases.js';
import { products } from './products.js';
import { createInsertSchema as drizzle2zod } from 'drizzle-zod';

const purchaseTrackerSchema = pgSchema('purchase_tracker');

export const purchaseItems = purchaseTrackerSchema.table(
  'purchase_items',
  {
    purchaseItemId: serial('purchaseitemid'),
    purchaseId: uuid('purchaseid')
      .references(() => purchases.purchaseId)
      .notNull(),
    productId: uuid('productid')
      .references(() => products.productId)
      .notNull(),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
    total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  },
  table => ({
    pk: primaryKey({ columns: [table.purchaseItemId, table.purchaseId] }),
  })
);

export type PurchaseItem = typeof purchaseItems.$inferSelect;

export const purchaseItemSchema = drizzle2zod(purchaseItems);
