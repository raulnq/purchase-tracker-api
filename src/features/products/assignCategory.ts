import { Hono } from 'hono';
import { exists as existsProduct } from './findProduct.js';
import { exists as existsCategory } from '@/features/categories/findCategory.js';
import { db } from '@/db/index.js';
import { products } from '@/db/schema/products.js';
import { eq } from 'drizzle-orm';

export const assignCategoryRoute = new Hono();

assignCategoryRoute.post(
  '/:productId/category/:categoryId',
  existsProduct,
  existsCategory,
  async c => {
    const [product] = await db
      .update(products)
      .set({ categoryId: c.var.category.categoryId })
      .where(eq(products.productId, c.var.product.productId))
      .returning();
    return c.json(product);
  }
);
