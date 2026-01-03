import { Hono } from 'hono';
import { categories, categorySchema } from './category.js';
import { StatusCodes } from 'http-status-codes';
import { zValidator } from '@/utils/validation.js';
import { createResourceNotFoundPD } from '@/utils/problem-document.js';
import { client } from '@/database/client.js';
import { eq } from 'drizzle-orm';

const schema = categorySchema.pick({ categoryId: true });

export const getRoute = new Hono().get(
  '/:categoryId',
  zValidator('param', schema),
  async c => {
    const { categoryId } = c.req.valid('param');
    const [category] = await client
      .select()
      .from(categories)
      .where(eq(categories.categoryId, categoryId))
      .limit(1);
    if (!category) {
      return c.json(
        createResourceNotFoundPD(
          c.req.path,
          `Category ${categoryId} not found`
        ),
        StatusCodes.NOT_FOUND
      );
    }
    return c.json(category, StatusCodes.OK);
  }
);
