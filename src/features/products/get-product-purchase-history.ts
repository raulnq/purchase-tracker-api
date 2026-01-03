import { Hono } from 'hono';
import { StatusCodes } from 'http-status-codes';
import { products, productSchema } from './product.js';
import { purchases, purchaseItems } from '@/features/purchases/purchase.js';
import { stores } from '@/features/stores/store.js';
import { zValidator } from '@/utils/validation.js';
import { createResourceNotFoundPD } from '@/utils/problem-document.js';
import { client } from '@/database/client.js';
import { eq, and, gte, desc, count } from 'drizzle-orm';
import { z } from 'zod';
import { paginationSchema, createPage, type Page } from '@/types/pagination.js';

const paramSchema = productSchema.pick({ productId: true });
const querySchema = paginationSchema.extend({
  startDate: z.string().datetime().optional(),
});

export type GetProductPurchaseHistory = z.infer<typeof querySchema>;

export type PurchaseHistoryItem = {
  purchaseItemId: number;
  purchaseId: string;
  purchaseDate: Date;
  storeName: string;
  price: number;
  quantity: number;
  total: number;
};

export const purchaseHistoryRoute = new Hono().get(
  '/:productId/purchase-history',
  zValidator('param', paramSchema),
  zValidator('query', querySchema),
  async c => {
    const { productId } = c.req.valid('param');
    const { pageNumber, pageSize, startDate } = c.req.valid('query');

    const [product] = await client
      .select()
      .from(products)
      .where(eq(products.productId, productId))
      .limit(1);

    if (!product) {
      return c.json(
        createResourceNotFoundPD(c.req.path, `Product ${productId} not found`),
        StatusCodes.NOT_FOUND
      );
    }

    const filters = [eq(purchaseItems.productId, productId)];

    if (startDate) {
      filters.push(gte(purchases.date, new Date(startDate)));
    }

    const offset = (pageNumber - 1) * pageSize;

    const [countResult, purchaseHistory] = await Promise.all([
      client
        .select({ totalCount: count() })
        .from(purchaseItems)
        .innerJoin(
          purchases,
          eq(purchaseItems.purchaseId, purchases.purchaseId)
        )
        .where(and(...filters)),
      client
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
        .innerJoin(
          purchases,
          eq(purchaseItems.purchaseId, purchases.purchaseId)
        )
        .innerJoin(stores, eq(purchases.storeId, stores.storeId))
        .where(and(...filters))
        .orderBy(desc(purchases.date), desc(purchases.createdAt))
        .limit(pageSize)
        .offset(offset),
    ]);

    const result: Page<PurchaseHistoryItem> = createPage(
      purchaseHistory,
      countResult[0].totalCount,
      pageNumber,
      pageSize
    );

    return c.json(result, StatusCodes.OK);
  }
);
