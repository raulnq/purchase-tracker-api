import { Hono } from 'hono';
import { client } from '@/database/client.js';
import { categories } from './category.js';
import { count, like, SQL, and } from 'drizzle-orm';
import { zValidator } from '@/utils/validation.js';
import { paginationSchema, createPage } from '@/types/pagination.js';
import { z } from 'zod';
import { StatusCodes } from 'http-status-codes';

const schema = paginationSchema.extend({
  name: z.string().optional(),
});

export type ListCategories = z.infer<typeof schema>;

export const listRoute = new Hono().get(
  '/',
  zValidator('query', schema),
  async c => {
    const { pageNumber, pageSize, name } = c.req.valid('query');

    const filters: SQL[] = [];
    const offset = (pageNumber - 1) * pageSize;
    const limit = pageSize;
    if (name) filters.push(like(categories.name, `%${name}%`));

    const [countResult, items] = await Promise.all([
      client
        .select({ totalCount: count() })
        .from(categories)
        .where(and(...filters)),
      client
        .select()
        .from(categories)
        .where(and(...filters))
        .limit(limit)
        .offset(offset),
    ]);

    return c.json(
      createPage(items, countResult[0].totalCount, pageNumber, pageSize),
      StatusCodes.OK
    );
  }
);
