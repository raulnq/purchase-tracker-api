import { Hono } from 'hono';
import { client } from '@/database/client.js';
import { stores, storeSchema } from './store.js';
import { count, like, SQL, and } from 'drizzle-orm';
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
});

export type ListStores = z.infer<typeof schema>;

export const listRoute = new Hono().get(
  '/',
  zValidator('query', schema),
  async c => {
    const page = await listStores(c.req.valid('query'));
    return c.json(page, StatusCodes.OK);
  }
);

export const listStores = async ({
  pageNumber,
  pageSize,
  name,
}: ListStores) => {
  const filters: SQL[] = [];
  const offset = (pageNumber - 1) * pageSize;
  const limit = pageSize;
  if (name) filters.push(like(stores.name, `%${name}%`));

  const [countResult, items] = await Promise.all([
    client
      .select({ totalCount: count() })
      .from(stores)
      .where(and(...filters)),
    client
      .select()
      .from(stores)
      .where(and(...filters))
      .limit(limit)
      .offset(offset),
  ]);

  return createPage(items, countResult[0].totalCount, pageNumber, pageSize);
};

export const ListStoresTool = (server: McpServer) => {
  return server.registerTool(
    'list_stores',
    {
      title: 'List Stores',
      description: 'List all stores',
      inputSchema: schema,
      outputSchema: z.object({
        success: z.boolean(),
        page: createPageSchema(storeSchema),
      }),
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
              text: `Error listing stores: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
};
