import { Hono } from 'hono';
import { products, productSchema } from './product.js';
import { categories } from '@/features/categories/category.js';
import { StatusCodes } from 'http-status-codes';
import { zValidator } from '@/utils/validation.js';
import { createResourceNotFoundPD } from '@/utils/problem-document.js';
import { client } from '@/database/client.js';
import { eq } from 'drizzle-orm';

const schema = productSchema.pick({ productId: true });

export const getRoute = new Hono().get(
  '/:productId',
  zValidator('param', schema),
  async c => {
    const { productId } = c.req.valid('param');

    const [product] = await client
      .select({
        productId: products.productId,
        name: products.name,
        categoryId: products.categoryId,
        categoryName: categories.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.categoryId))
      .where(eq(products.productId, productId))
      .limit(1);

    if (!product) {
      return c.json(
        createResourceNotFoundPD(c.req.path, `Product ${productId} not found`),
        StatusCodes.NOT_FOUND
      );
    }
    return c.json(product, StatusCodes.OK);
  }
);
