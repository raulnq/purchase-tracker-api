import { Hono } from 'hono';
import { exists } from './findCategory.js';
import { db } from '@/db/index.js';
import { categories } from '@/db/schema/categories.js';
import { eq } from 'drizzle-orm';
import { zValidator } from '@/util/validatorWrapper.js';
import { z } from 'zod';

const schema = z.object({
  name: z.string().nonempty().max(255),
});

export const editRoute = new Hono();

editRoute.put('/:categoryId', exists, zValidator('json', schema), async c => {
  const { name } = c.req.valid('json');
  const [category] = await db
    .update(categories)
    .set({ name })
    .where(eq(categories.categoryId, c.var.category.categoryId))
    .returning();
  return c.json(category);
});
