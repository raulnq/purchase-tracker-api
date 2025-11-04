import { Hono } from 'hono';
import { db } from '@/db/index.js';
import { stores, storeSchema } from '@/db/schema/stores.js';
import { v7 } from 'uuid';
import { z } from 'zod';
import { zValidator } from '@/util/validatorWrapper.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const schema = z.object({
  name: z.string().nonempty().max(255),
});

export type AddStore = z.infer<typeof schema>;

export const addRoute = new Hono();

addRoute.post('/', zValidator('json', schema), async c => {
  const { name } = c.req.valid('json');
  const [store] = await addStore({ name });
  return c.json(store, 201);
});

const addStore = async ({ name }: AddStore) => {
  return await db.insert(stores).values({ storeId: v7(), name }).returning();
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
    async ({ name }) => {
      try {
        const [store] = await addStore({ name });
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
