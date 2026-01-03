import { Hono } from 'hono';
import { client } from '@/database/client.js';
import { purchases, purchaseItems } from './purchase.js';
import { products } from '@/features/products/product.js';
import { stores } from '@/features/stores/store.js';
import { categories } from '@/features/categories/category.js';
import { eq } from 'drizzle-orm';
import { zValidator } from '@/utils/validation.js';
import { z } from 'zod';
import { createResourceNotFoundPD } from '@/utils/problem-document.js';
import { StatusCodes } from 'http-status-codes';

const schema = z.object({
  purchaseId: z.string().uuid(),
});

export const getRoute = new Hono().get(
  '/:purchaseId',
  zValidator('param', schema),
  async c => {
    const { purchaseId } = c.req.valid('param');

    const purchase = await client
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
      return c.json(
        createResourceNotFoundPD(c.req.path, 'Purchase not found'),
        StatusCodes.NOT_FOUND
      );
    }

    const items = await client
      .select({
        purchaseItemId: purchaseItems.purchaseItemId,
        productId: purchaseItems.productId,
        productName: products.name,
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

    return c.json(result, StatusCodes.OK);
  }
);
