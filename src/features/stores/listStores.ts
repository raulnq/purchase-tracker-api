import { Hono } from 'hono';
import { db } from '@/db/index.js';
import { stores, storeSchema } from '@/db/schema/stores.js';
import { count, like, SQL, and } from 'drizzle-orm';
import { zValidator } from '@/util/validation.js';
import { createPageSchema, pagination } from '@/util/pagination.js';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const schema = pagination.extend({
  name: z.string().optional(),
});

export type ListStores = z.infer<typeof schema>;

export const listRoute = new Hono();

listRoute.get('/', zValidator('query', schema), async c => {
  const page = await listStores(c.req.valid('query'));
  return c.json(page);
});

export const listStores = async ({
  pageNumber,
  pageSize,
  name,
}: ListStores) => {
  const filters: SQL[] = [];
  const offset = (pageNumber - 1) * pageSize;
  const limit = pageSize;
  if (name) filters.push(like(stores.name, `%${name}%`));

  const [{ totalCount }] = await db
    .select({ totalCount: count() })
    .from(stores)
    .where(and(...filters));

  const items = await db
    .select()
    .from(stores)
    .where(and(...filters))
    .limit(limit)
    .offset(offset);

  return {
    items,
    pageNumber: pageNumber,
    pageSize: pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
    totalCount,
  };
};

export const ListStoresTool = (server: McpServer) => {
  return server.registerTool(
    'list_stores',
    {
      title: 'List Stores',
      description: 'List all stores',
      inputSchema: schema.shape,
      outputSchema: {
        success: z.boolean(),
        page: createPageSchema(storeSchema),
      },
    },
    async ({ name, pageNumber, pageSize }) => {
      try {
        const page = await listStores({
          name,
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
