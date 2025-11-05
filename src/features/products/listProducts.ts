import { Hono } from 'hono';
import { db } from '@/db/index.js';
import { products, productSchema } from '@/db/schema/products.js';
import { count, eq, like, and, SQL } from 'drizzle-orm';
import { zValidator } from '@/util/validation.js';
import { pagination, createPageSchema } from '@/util/pagination.js';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const schema = pagination.extend({
  name: z.string().optional(),
  code: z.string().optional(),
  categoryId: z.string().uuid().optional(),
});

export type ListProducts = z.infer<typeof schema>;

export const listRoute = new Hono();

listRoute.get('/', zValidator('query', schema), async c => {
  const page = await listProducts(c.req.valid('query'));
  return c.json(page);
});

export const listProducts = async ({
  pageNumber,
  pageSize,
  name,
  code,
  categoryId,
}: ListProducts) => {
  const filters: SQL[] = [];
  const offset = (pageNumber - 1) * pageSize;
  const limit = pageSize;
  if (name) filters.push(like(products.name, `%${name}%`));
  if (code) filters.push(like(products.code, `%${code}%`));
  if (categoryId) filters.push(eq(products.categoryId, categoryId));

  const [{ totalCount }] = await db
    .select({ totalCount: count() })
    .from(products)
    .where(and(...filters));

  const items = await db
    .select()
    .from(products)
    .limit(limit)
    .where(and(...filters))
    .offset(offset);

  return {
    items,
    pageNumber: pageNumber,
    pageSize: pageSize,
    totalCount: totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
  };
};

export const ListProductsTool = (server: McpServer) => {
  return server.registerTool(
    'list_product',
    {
      title: 'List Products',
      description: 'List all products',
      inputSchema: schema.shape,
      outputSchema: {
        success: z.boolean(),
        page: createPageSchema(productSchema),
      },
    },
    async ({ name, code, categoryId, pageNumber, pageSize }) => {
      try {
        const page = await listProducts({
          name,
          code,
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
              text: `Error creating product: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
};
