import { pgSchema, uuid, decimal, date, timestamp } from 'drizzle-orm/pg-core';
import { stores } from './stores.js';
import { createInsertSchema as drizzle2zod } from 'drizzle-zod';

const purchaseTrackerSchema = pgSchema('purchase_tracker');

export const purchases = purchaseTrackerSchema.table('purchases', {
  purchaseId: uuid('purchaseid').primaryKey(),
  storeId: uuid('storeid')
    .references(() => stores.storeId)
    .notNull(),
  date: date('date', { mode: 'date' }).notNull(),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('createdat').defaultNow().notNull(),
});

export type Purchase = typeof purchases.$inferSelect;

export const purchaseSchema = drizzle2zod(purchases);
