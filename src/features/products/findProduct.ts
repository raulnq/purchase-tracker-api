import { Hono, type MiddlewareHandler } from 'hono';
import { createMiddleware } from 'hono/factory';
import { z } from 'zod';
import { db } from '@/db/index.js';
import { products, type Product } from '@/db/schema/products.js';
import { categories } from '@/db/schema/categories.js';
import { eq } from 'drizzle-orm';
import { NotFoundError } from '@/middlewares/onError.js';

const schema = z.object({
  productId: z.string().uuid(),
});

export const exists: MiddlewareHandler<{
  Variables: {
    product: Product;
  };
}> = createMiddleware(async (c, next) => {
  const { productId } = schema.parse(c.req.param());
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.productId, productId))
    .limit(1);

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  c.set('product', product);
  await next();
});

export const findRoute = new Hono();

findRoute.get('/:productId', exists, async c => {
  const product = c.var.product;

  const productWithCategory = await db
    .select({
      productId: products.productId,
      name: products.name,
      code: products.code,
      categoryId: products.categoryId,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.categoryId))
    .where(eq(products.productId, product.productId))
    .limit(1);

  return c.json(productWithCategory[0]);
});
