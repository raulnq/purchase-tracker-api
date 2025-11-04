import { Hono, type MiddlewareHandler } from 'hono';
import { createMiddleware } from 'hono/factory';
import { z } from 'zod';
import { db } from '@/db/index.js';
import { categories, type Category } from '@/db/schema/categories.js';
import { eq } from 'drizzle-orm';
import { NotFoundError } from '@/middlewares/onError.js';

const schema = z.object({
  categoryId: z.string().uuid(),
});

export const exists: MiddlewareHandler<{
  Variables: {
    category: Category;
  };
}> = createMiddleware(async (c, next) => {
  const { categoryId } = schema.parse(c.req.param());
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.categoryId, categoryId))
    .limit(1);

  if (!category) {
    throw new NotFoundError('Category not found');
  }

  c.set('category', category);
  await next();
});

export const findRoute = new Hono();

findRoute.get('/:categoryId', exists, async c => {
  const category = c.var.category;
  return c.json(category);
});
