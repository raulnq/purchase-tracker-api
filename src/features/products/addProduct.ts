import { Hono } from 'hono';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { db } from '@/db/index.js';
import { products, productSchema } from '@/db/schema/products.js';
import { v7 } from 'uuid';
import { z } from 'zod';
import { zValidator } from '@/util/validation.js';
const schema = z.object({
  name: z.string().nonempty().max(255),
  code: z.string().nonempty().max(255),
});

export type AddProduct = z.infer<typeof schema>;

export const addRoute = new Hono();

addRoute.post('/', zValidator('json', schema), async c => {
  const [product] = await addProduct(c.req.valid('json'));
  return c.json(product, 201);
});

export const addProduct = async ({ name, code }: AddProduct) => {
  return await db
    .insert(products)
    .values({
      productId: v7(),
      name,
      code,
    })
    .returning();
};

export const AddProductTool = (server: McpServer) => {
  return server.registerTool(
    'add_product',
    {
      title: 'Add Product',
      description: 'Add a new product',
      inputSchema: schema.shape,
      outputSchema: {
        success: z.boolean(),
        product: productSchema.optional(),
      },
    },
    async ({ name, code }) => {
      try {
        const [product] = await addProduct({ name, code });
        const structuredContent = { success: true, product: product };
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(product),
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
