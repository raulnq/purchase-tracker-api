import { Hono } from 'hono';
import { exists } from './findStore.js';
import { db } from '@/db/index.js';
import { stores } from '@/db/schema/stores.js';
import { eq } from 'drizzle-orm';
import { zValidator } from '@/util/validation.js';
import { z } from 'zod';

const schema = z.object({
  name: z.string().nonempty().max(255),
  enabled: z.boolean(),
});

export type EditStore = z.infer<typeof schema>;

export const editRoute = new Hono();

editRoute.put('/:storeId', exists, zValidator('json', schema), async c => {
  const { name, enabled } = c.req.valid('json');
  const [store] = await db
    .update(stores)
    .set({ name, enabled })
    .where(eq(stores.storeId, c.var.store.storeId))
    .returning();
  return c.json(store);
});
