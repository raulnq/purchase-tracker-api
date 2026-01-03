import { Hono } from 'hono';
import { StatusCodes } from 'http-status-codes';
import { products, productSchema } from './product.js';
import { zValidator } from '@/utils/validation.js';
import { createResourceNotFoundPD } from '@/utils/problem-document.js';
import { client } from '@/database/client.js';
import { eq } from 'drizzle-orm';

const schema = productSchema.pick({ productId: true });

export const removeCategoryRoute = new Hono().delete(
  '/:productId/category',
  zValidator('param', schema),
  async c => {
    const { productId } = c.req.valid('param');

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

    const [updatedProduct] = await client
      .update(products)
      .set({ categoryId: null })
      .where(eq(products.productId, productId))
      .returning();

    return c.json(updatedProduct, StatusCodes.OK);
  }
);
