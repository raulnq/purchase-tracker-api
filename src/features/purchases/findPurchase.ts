import { Hono } from 'hono';
import { db } from '@/db/index.js';
import { purchases } from '@/db/schema/purchases.js';
import { purchaseItems } from '@/db/schema/purchaseItems.js';
import { products } from '@/db/schema/products.js';
import { stores } from '@/db/schema/stores.js';
import { categories } from '@/db/schema/categories.js';
import { eq } from 'drizzle-orm';
import { zValidator } from '@/util/validatorWrapper.js';
import { z } from 'zod';
import { NotFoundError } from '@/middlewares/onError.js';

const schema = z.object({
  purchaseId: z.string().uuid(),
});

export const findRoute = new Hono();

findRoute.get('/:purchaseId', zValidator('param', schema), async c => {
  const { purchaseId } = c.req.valid('param');

  const purchase = await db
    .select({
      purchaseId: purchases.purchaseId,
      storeId: purchases.storeId,
      storeName: stores.name,
      date: purchases.date,
      total: purchases.total,
      createdAt: purchases.createdAt,
    })
    .from(purchases)
    .innerJoin(stores, eq(purchases.storeId, stores.storeId))
    .where(eq(purchases.purchaseId, purchaseId))
    .limit(1);

  if (!purchase || purchase.length === 0) {
    throw new NotFoundError('Purchase not found');
  }

  const items = await db
    .select({
      purchaseItemId: purchaseItems.purchaseItemId,
      productId: purchaseItems.productId,
      productName: products.name,
      productCode: products.code,
      categoryId: products.categoryId,
      categoryName: categories.name,
      price: purchaseItems.price,
      quantity: purchaseItems.quantity,
      total: purchaseItems.total,
    })
    .from(purchaseItems)
    .innerJoin(products, eq(purchaseItems.productId, products.productId))
    .leftJoin(categories, eq(products.categoryId, categories.categoryId))
    .where(eq(purchaseItems.purchaseId, purchaseId))
    .orderBy(purchaseItems.purchaseItemId);

  const result = {
    ...purchase[0],
    items: items,
  };

  return c.json(result);
});
