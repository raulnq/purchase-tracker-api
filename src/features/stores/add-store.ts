import { Hono } from 'hono';
import { client } from '@/database/client.js';
import { stores, storeSchema, type Store } from './store.js';
import { v7 } from 'uuid';
import { z } from 'zod';
import { zValidator } from '@/utils/validation.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StatusCodes } from 'http-status-codes';

const schema = storeSchema.omit({ storeId: true });

export type AddStore = z.infer<typeof schema>;

export const addRoute = new Hono().post(
  '/',
  zValidator('json', schema),
  async c => {
    const data = c.req.valid('json');
    const store = await addStore(data);
    return c.json(store, StatusCodes.CREATED);
  }
);

export const addStore = async (data: AddStore): Promise<Store> => {
  const [store] = await client
    .insert(stores)
    .values({ ...data, storeId: v7() })
    .returning();
  return store;
};

export const AddStoreTool = (server: McpServer) => {
  return server.registerTool(
    'add_store',
    {
      title: 'Add Store',
      description: 'Add a new store',
      inputSchema: schema.shape,
      outputSchema: {
        success: z.boolean(),
        store: storeSchema.optional(),
      },
    },
    async ({ name, enabled }) => {
      try {
        const store = await addStore({ name, enabled });
        const structuredContent = { success: true, store: store };
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(store),
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
              text: `Error creating store: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
};
