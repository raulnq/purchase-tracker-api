import { Hono } from 'hono';
import { exists } from './findProduct.js';
import { db } from '@/db/index.js';
import { products } from '@/db/schema/products.js';
import { eq } from 'drizzle-orm';

export const removeCategoryRoute = new Hono();

// eslint-disable-next-line drizzle/enforce-delete-with-where
removeCategoryRoute.delete('/:productId/category', exists, async c => {
  const [product] = await db
    .update(products)
    .set({ categoryId: null })
    .where(eq(products.productId, c.var.product.productId))
    .returning();

  return c.json(product);
});
