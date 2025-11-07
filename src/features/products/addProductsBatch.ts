import { Hono } from 'hono';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { db } from '@/db/index.js';
import { products, productSchema } from '@/db/schema/products.js';
import { v7 } from 'uuid';
import { z } from 'zod';
import { zValidator } from '@/util/validation.js';

const shema = z.object({
  products: z
    .array(
      z.object({
        name: z.string().nonempty().max(255),
        code: z.string().max(255).optional(),
      })
    )
    .min(1)
    .max(100),
});

export type AddProductsBatch = z.infer<typeof shema>;

export const addBatchRoute = new Hono();

addBatchRoute.post('/batch', zValidator('json', shema), async c => {
  const result = await addProductsBatch(c.req.valid('json'));
  return c.json(result, 201);
});

const addProductsBatch = async ({
  products: productsInput,
}: AddProductsBatch) => {
  const productsToInsert = productsInput.map(({ name, code }) => ({
    productId: v7(),
    name,
    code,
  }));

  return await db.insert(products).values(productsToInsert).returning();
};

export const AddProductsBatchTool = (server: McpServer) => {
  return server.registerTool(
    'add_products_batch',
    {
      title: 'Add Products Batch',
      description: 'Add multiple products in a single operation',
      inputSchema: shema.shape,
      outputSchema: {
        success: z.boolean(),
        products: z.array(productSchema),
      },
    },
    async ({ products: productsInput }) => {
      try {
        const result = {
          success: true,
          products: await addProductsBatch({ products: productsInput }),
        };
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result),
            },
          ],
          structuredContent: result,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [
            {
              type: 'text',
              text: `Error creating products batch: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
};
