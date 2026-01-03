import { Hono } from 'hono';
import { client } from '@/database/client.js';
import { categories, categorySchema, type Category } from './category.js';
import { v7 } from 'uuid';
import { z } from 'zod';
import { zValidator } from '@/utils/validation.js';
import { StatusCodes } from 'http-status-codes';

const schema = categorySchema.omit({ categoryId: true });

export type AddCategory = z.infer<typeof schema>;

export const addRoute = new Hono().post(
  '/',
  zValidator('json', schema),
  async c => {
    const data = c.req.valid('json');
    const category = await addCategory(data);
    return c.json(category, StatusCodes.CREATED);
  }
);

export const addCategory = async (data: AddCategory): Promise<Category> => {
  const [category] = await client
    .insert(categories)
    .values({ ...data, categoryId: v7() })
    .returning();
  return category;
};
