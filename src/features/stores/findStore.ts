import { Hono, type MiddlewareHandler } from 'hono';
import { createMiddleware } from 'hono/factory';
import { z } from 'zod';
import { db } from '@/db/index.js';
import { stores, type Store } from '@/db/schema/stores.js';
import { eq } from 'drizzle-orm';
import { NotFoundError } from '@/middlewares/onError.js';

const schema = z.object({
  storeId: z.string().uuid(),
});

export const exists: MiddlewareHandler<{
  Variables: {
    store: Store;
  };
}> = createMiddleware(async (c, next) => {
  const { storeId } = schema.parse(c.req.param());
  const [store] = await db
    .select()
    .from(stores)
    .where(eq(stores.storeId, storeId))
    .limit(1);
  if (!store) {
    throw new NotFoundError('Store not found');
  }
  c.set('store', store);
  await next();
});

export const findRoute = new Hono();

findRoute.get('/:storeId', exists, async c => {
  return c.json(c.var.store);
});
