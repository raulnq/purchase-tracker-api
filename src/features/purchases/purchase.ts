import { z } from 'zod';
import {
  pgSchema,
  uuid,
  decimal,
  date,
  timestamp,
  serial,
  primaryKey,
  varchar,
} from 'drizzle-orm/pg-core';
import { stores } from '@/features/stores/store.js';
import { products } from '@/features/products/product.js';

// Zod schemas FIRST
export const purchaseSchema = z.object({
  purchaseId: z.uuid(),
  storeId: z.uuid(),
  date: z.coerce.date(),
  total: z.string(),
  createdAt: z.coerce.date(),
});

export type Purchase = z.infer<typeof purchaseSchema>;

export const purchaseItemSchema = z.object({
  purchaseItemId: z.number(),
  purchaseId: z.uuid(),
  productId: z.uuid(),
  price: z.string(),
  quantity: z.string(),
  unit: z.string().max(32),
  total: z.string(),
});

export type PurchaseItem = z.infer<typeof purchaseItemSchema>;

// Drizzle tables SECOND
const trackerSchema = pgSchema('purchase_tracker');

export const purchases = trackerSchema.table('purchases', {
  purchaseId: uuid('purchaseid').primaryKey(),
  storeId: uuid('storeid')
    .references(() => stores.storeId)
    .notNull(),
  date: date('date', { mode: 'date' }).notNull(),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('createdat').defaultNow().notNull(),
});

export const purchaseItems = trackerSchema.table(
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
    unit: varchar('unit', { length: 32 }).notNull(),
    total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  },
  table => ({
    pk: primaryKey({ columns: [table.purchaseItemId, table.purchaseId] }),
  })
);
