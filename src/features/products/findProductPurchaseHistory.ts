import { Hono } from 'hono';
import { db } from '@/db/index.js';
import { purchases } from '@/db/schema/purchases.js';
import { purchaseItems } from '@/db/schema/purchaseItems.js';
import { stores } from '@/db/schema/stores.js';
import { eq, and, gte, desc, count } from 'drizzle-orm';
import { z } from 'zod';
import { zValidator } from '@/util/validation.js';
import { pagination, type Page } from '@/util/pagination.js';
import { exists } from './findProduct.js';

const schema = pagination.extend({
  startDate: z.string().datetime().optional(),
});

export type FindProductPurchaseHistory = z.infer<typeof schema>;

export type PurchaseHistoryItem = {
  purchaseItemId: number;
  purchaseId: string;
  purchaseDate: Date;
  storeName: string;
  price: string;
  quantity: string;
  total: string;
};

export const purchaseHistoryRoute = new Hono();

purchaseHistoryRoute.get(
  '/:productId/purchase-history',
  exists,
  zValidator('query', schema),
  async c => {
    const productId = c.var.product.productId;
    const { pageNumber, pageSize, startDate } = c.req.valid('query');

    const filters = [eq(purchaseItems.productId, productId)];

    if (startDate) {
      filters.push(gte(purchases.date, new Date(startDate)));
    }

    const [{ totalCount }] = await db
      .select({ totalCount: count() })
      .from(purchaseItems)
      .innerJoin(purchases, eq(purchaseItems.purchaseId, purchases.purchaseId))
      .where(and(...filters));

    const totalPages = Math.ceil(totalCount / pageSize);
    const offset = (pageNumber - 1) * pageSize;

    const purchaseHistory = await db
      .select({
        purchaseItemId: purchaseItems.purchaseItemId,
        purchaseId: purchaseItems.purchaseId,
        purchaseDate: purchases.date,
        storeName: stores.name,
        price: purchaseItems.price,
        quantity: purchaseItems.quantity,
        total: purchaseItems.total,
      })
      .from(purchaseItems)
      .innerJoin(purchases, eq(purchaseItems.purchaseId, purchases.purchaseId))
      .innerJoin(stores, eq(purchases.storeId, stores.storeId))
      .where(and(...filters))
      .orderBy(desc(purchases.date), desc(purchases.createdAt))
      .limit(pageSize)
      .offset(offset);

    const result: Page<PurchaseHistoryItem> = {
      items: purchaseHistory,
      pageNumber,
      pageSize,
      totalPages,
      totalCount,
    };

    return c.json(result, 200);
  }
);
