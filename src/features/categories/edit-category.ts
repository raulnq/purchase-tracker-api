import { Hono } from 'hono';
import { StatusCodes } from 'http-status-codes';
import { categories, categorySchema } from './category.js';
import { zValidator } from '@/utils/validation.js';
import { createResourceNotFoundPD } from '@/utils/problem-document.js';
import { client } from '@/database/client.js';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const paramSchema = categorySchema.pick({ categoryId: true });
const bodySchema = categorySchema.omit({ categoryId: true });

export type EditCategory = z.infer<typeof bodySchema>;

export const editRoute = new Hono().put(
  '/:categoryId',
  zValidator('param', paramSchema),
  zValidator('json', bodySchema),
  async c => {
    const { categoryId } = c.req.valid('param');
    const data = c.req.valid('json');
    const existing = await client
      .select()
      .from(categories)
      .where(eq(categories.categoryId, categoryId))
      .limit(1);

    if (existing.length === 0) {
      return c.json(
        createResourceNotFoundPD(
          c.req.path,
          `Category ${categoryId} not found`
        ),
        StatusCodes.NOT_FOUND
      );
    }
    const [category] = await client
      .update(categories)
      .set(data)
      .where(eq(categories.categoryId, categoryId))
      .returning();
    return c.json(category, StatusCodes.OK);
  }
);
