import { Hono } from 'hono';
import { db } from '@/db/index.js';
import { categories } from '@/db/schema/categories.js';
import { v7 } from 'uuid';
import { z } from 'zod';
import { zValidator } from '@/util/validatorWrapper.js';

const schema = z.object({
  name: z.string().nonempty().max(255),
});

export const addRoute = new Hono();

addRoute.post('/', zValidator('json', schema), async c => {
  const { name } = c.req.valid('json');
  const [category] = await db
    .insert(categories)
    .values({ categoryId: v7(), name })
    .returning();
  return c.json(category, 201);
});
