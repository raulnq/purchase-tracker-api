import { Hono } from 'hono';
import { client } from '@/database/client.js';
import { products, productSchema } from './product.js';
import { count, eq, like, and, SQL, inArray } from 'drizzle-orm';
import { zValidator } from '@/utils/validation.js';
import {
  paginationSchema,
  createPage,
  createPageSchema,
} from '@/types/pagination.js';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StatusCodes } from 'http-status-codes';

const schema = paginationSchema.extend({
  name: z.string().optional(),
  codes: z
    .union([z.string().transform(val => [val]), z.array(z.string())])
    .optional(),
  categoryId: z.string().uuid().optional(),
});

export type ListProducts = z.infer<typeof schema>;

export const listRoute = new Hono().get(
  '/',
  zValidator('query', schema),
  async c => {
    const page = await listProducts(c.req.valid('query'));
    return c.json(page, StatusCodes.OK);
  }
);

export const listProducts = async ({
  pageNumber,
  pageSize,
  name,
  codes,
  categoryId,
}: ListProducts) => {
  const filters: SQL[] = [];
  const offset = (pageNumber - 1) * pageSize;
  const limit = pageSize;
  if (name) filters.push(like(products.name, `%${name}%`));
  if (codes && codes.length > 0) filters.push(inArray(products.code, codes));
  if (categoryId) filters.push(eq(products.categoryId, categoryId));

  const [{ totalCount }] = await client
    .select({ totalCount: count() })
    .from(products)
    .where(and(...filters));

  const items = await client
    .select()
    .from(products)
    .limit(limit)
    .where(and(...filters))
    .offset(offset);

  return createPage(items, totalCount, pageNumber, pageSize);
};

export const ListProductsTool = (server: McpServer) => {
  return server.registerTool(
    'list_product',
    {
      title: 'List Products',
      description:
        'List all products with optional filtering by name, codes (single or multiple), or category',
      inputSchema: schema.shape,
      outputSchema: {
        success: z.boolean(),
        page: createPageSchema(productSchema),
      },
    },
    async ({ name, codes, categoryId, pageNumber, pageSize }) => {
      try {
        const page = await listProducts({
          name,
          codes,
          categoryId,
          pageNumber,
          pageSize,
        });
        const structuredContent = { success: true, page: page };
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(page),
            },
          ],
          structuredContent,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [
            {
              type: 'text',
              text: `Error listing products: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
};
