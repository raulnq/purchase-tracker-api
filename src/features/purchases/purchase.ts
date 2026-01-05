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
  index,
} from 'drizzle-orm/pg-core';
import { stores } from '@/features/stores/store.js';
import { products } from '@/features/products/product.js';

// Zod schemas FIRST
export const purchaseSchema = z.object({
  purchaseId: z.uuid(),
  storeId: z.uuid(),
  date: z.coerce.date(),
  total: z.number().positive(),
  createdAt: z.coerce.date(),
});

export type Purchase = z.infer<typeof purchaseSchema>;

export const purchaseItemSchema = z.object({
  purchaseItemId: z.number(),
  purchaseId: z.uuid(),
  productId: z.uuid(),
  price: z.number().positive(),
  quantity: z.number().positive(),
  unit: z.string().max(32),
  total: z.number().positive(),
});

export type PurchaseItem = z.infer<typeof purchaseItemSchema>;

// Drizzle tables SECOND
const trackerSchema = pgSchema('purchase_tracker');

export const purchases = trackerSchema.table(
  'purchases',
  {
    purchaseId: uuid('purchaseid').primaryKey(),
    storeId: uuid('storeid')
      .references(() => stores.storeId)
      .notNull(),
    date: date('date', { mode: 'date' }).notNull(),
    total: decimal('total', {
      precision: 10,
      scale: 2,
      mode: 'number',
    }).notNull(),
    createdAt: timestamp('createdat').defaultNow().notNull(),
  },
  table => [
    index('idx_purchases_store_id').on(table.storeId),
    index('idx_purchases_date').on(table.date),
    index('idx_purchases_store_date').on(table.storeId, table.date),
  ]
);

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
    price: decimal('price', {
      precision: 10,
      scale: 2,
      mode: 'number',
    }).notNull(),
    quantity: decimal('quantity', {
      precision: 10,
      scale: 2,
      mode: 'number',
    }).notNull(),
    unit: varchar('unit', { length: 32 }).notNull(),
    total: decimal('total', {
      precision: 10,
      scale: 2,
      mode: 'number',
    }).notNull(),
  },
  table => [
    primaryKey({ columns: [table.purchaseItemId, table.purchaseId] }),
    index('idx_purchase_items_purchase_id').on(table.purchaseId),
    index('idx_purchase_items_product_id').on(table.productId),
  ]
);
