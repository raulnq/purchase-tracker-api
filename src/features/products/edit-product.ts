import { Hono } from 'hono';
import { StatusCodes } from 'http-status-codes';
import { products, productSchema } from './product.js';
import { zValidator } from '@/utils/validation.js';
import { createResourceNotFoundPD } from '@/utils/problem-document.js';
import { client } from '@/database/client.js';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const paramSchema = productSchema.pick({ productId: true });
const bodySchema = productSchema.omit({ productId: true, categoryId: true });

export type EditProduct = z.infer<typeof bodySchema>;

export const editRoute = new Hono().put(
  '/:productId',
  zValidator('param', paramSchema),
  zValidator('json', bodySchema),
  async c => {
    const { productId } = c.req.valid('param');
    const data = c.req.valid('json');
    const existing = await client
      .select()
      .from(products)
      .where(eq(products.productId, productId))
      .limit(1);

    if (existing.length === 0) {
      return c.json(
        createResourceNotFoundPD(c.req.path, `Product ${productId} not found`),
        StatusCodes.NOT_FOUND
      );
    }
    const [product] = await client
      .update(products)
      .set(data)
      .where(eq(products.productId, productId))
      .returning();
    return c.json(product, StatusCodes.OK);
  }
);
