import { Hono } from 'hono';
import { db } from '@/db/index.js';
import { categories } from '@/db/schema/categories.js';
import { count, like, SQL, and } from 'drizzle-orm';
import { zValidator } from '@/util/validation.js';
import { pagination } from '@/util/pagination.js';
import { z } from 'zod';

const schema = z
  .object({
    name: z.string().optional(),
  })
  .merge(pagination);

export type ListCategories = z.infer<typeof schema>;

export const listRoute = new Hono();

listRoute.get('/', zValidator('query', schema), async c => {
  const { pageNumber, pageSize, name } = c.req.valid('query');

  const filters: SQL[] = [];
  const offset = (pageNumber - 1) * pageSize;
  const limit = pageSize;
  if (name) filters.push(like(categories.name, `%${name}%`));

  const [{ totalCount }] = await db
    .select({ totalCount: count() })
    .from(categories)
    .where(and(...filters));

  const items = await db
    .select()
    .from(categories)
    .where(and(...filters))
    .limit(limit)
    .offset(offset);

  return c.json({
    items,
    pageNumber: pageNumber,
    pageSize: pageSize,
    totalCount: totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
  });
});
