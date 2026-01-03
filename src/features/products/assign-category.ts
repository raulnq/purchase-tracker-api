import { Hono } from 'hono';
import { StatusCodes } from 'http-status-codes';
import { products, productSchema } from './product.js';
import { categories, categorySchema } from '@/features/categories/category.js';
import { zValidator } from '@/utils/validation.js';
import { createResourceNotFoundPD } from '@/utils/problem-document.js';
import { client } from '@/database/client.js';
import { eq } from 'drizzle-orm';

const schema = productSchema
  .pick({ productId: true })
  .merge(categorySchema.pick({ categoryId: true }));

export const assignCategoryRoute = new Hono().post(
  '/:productId/category/:categoryId',
  zValidator('param', schema),
  async c => {
    const { productId, categoryId } = c.req.valid('param');

    const [product] = await client
      .select()
      .from(products)
      .where(eq(products.productId, productId))
      .limit(1);

    if (!product) {
      return c.json(
        createResourceNotFoundPD(c.req.path, `Product ${productId} not found`),
        StatusCodes.NOT_FOUND
      );
    }

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

    const [updatedProduct] = await client
      .update(products)
      .set({ categoryId })
      .where(eq(products.productId, productId))
      .returning();

    return c.json(updatedProduct, StatusCodes.OK);
  }
);
