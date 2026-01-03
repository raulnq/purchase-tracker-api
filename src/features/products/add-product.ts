import { Hono } from 'hono';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { client } from '@/database/client.js';
import { products, productSchema, type Product } from './product.js';
import { v7 } from 'uuid';
import { z } from 'zod';
import { zValidator } from '@/utils/validation.js';
import { StatusCodes } from 'http-status-codes';

const schema = productSchema.omit({ productId: true, categoryId: true });

export type AddProduct = z.infer<typeof schema>;

export const addRoute = new Hono().post(
  '/',
  zValidator('json', schema),
  async c => {
    const product = await addProduct(c.req.valid('json'));
    return c.json(product, StatusCodes.CREATED);
  }
);

export const addProduct = async (data: AddProduct): Promise<Product> => {
  const [product] = await client
    .insert(products)
    .values({
      ...data,
      productId: v7(),
      categoryId: null,
    })
    .returning();
  return product;
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
        const product = await addProduct({ name, code });
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
