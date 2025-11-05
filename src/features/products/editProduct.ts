import { Hono } from 'hono';
import { exists } from './findProduct.js';
import { db } from '@/db/index.js';
import { products } from '@/db/schema/products.js';
import { eq } from 'drizzle-orm';
import { zValidator } from '@/util/validation.js';
import { z } from 'zod';

const schema = z.object({
  name: z.string().nonempty().max(255),
  code: z.string().max(255).optional(),
});

export const editRoute = new Hono();

editRoute.put('/:productId', exists, zValidator('json', schema), async c => {
  const { name, code } = c.req.valid('json');
  const [product] = await db
    .update(products)
    .set({
      name,
      code,
    })
    .where(eq(products.productId, c.var.product.productId))
    .returning();
  return c.json(product);
});
