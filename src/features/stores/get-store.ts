import { Hono } from 'hono';
import { stores, storeSchema } from './store.js';
import { StatusCodes } from 'http-status-codes';
import { zValidator } from '@/utils/validation.js';
import { createResourceNotFoundPD } from '@/utils/problem-document.js';
import { client } from '@/database/client.js';
import { eq } from 'drizzle-orm';

const schema = storeSchema.pick({ storeId: true });

export const getRoute = new Hono().get(
  '/:storeId',
  zValidator('param', schema),
  async c => {
    const { storeId } = c.req.valid('param');
    const [store] = await client
      .select()
      .from(stores)
      .where(eq(stores.storeId, storeId))
      .limit(1);
    if (!store) {
      return c.json(
        createResourceNotFoundPD(c.req.path, `Store ${storeId} not found`),
        StatusCodes.NOT_FOUND
      );
    }
    return c.json(store, StatusCodes.OK);
  }
);
