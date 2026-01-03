import { Hono } from 'hono';
import { client } from '@/database/client.js';
import { purchaseSchema, purchaseItemSchema } from './purchase.js';
import { products } from '@/features/products/product.js';
import { inArray } from 'drizzle-orm';
import { z } from 'zod';
import { zValidator } from '@/utils/validation.js';
import { createPurchase } from './add-purchase.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { addProduct } from '@/features/products/add-product.js';
import { StatusCodes } from 'http-status-codes';

const itemSchema = z.object({
  product: z.object({
    name: z.string().min(1).max(255),
    code: z.string().min(1).max(255),
  }),
  quantity: z.number().positive(),
  price: z.number().positive(),
  unit: z.string(),
});

const schema = z.object({
  storeId: z.string().uuid(),
  date: z.coerce.date(),
  items: z.array(itemSchema).min(1),
});

export type AddPurchaseWithProducts = z.infer<typeof schema>;

export type AddPurchaseItemWithProduct = z.infer<typeof itemSchema>;

const addPurchaseWithProductsResponseSchema = z.object({
  ...purchaseSchema.shape,
  items: z.array(purchaseItemSchema),
});

export type AddPurchaseWithProductsResponse = z.infer<
  typeof addPurchaseWithProductsResponseSchema
>;

export const addWithProductsRoute = new Hono().post(
  '/with-products',
  zValidator('json', schema),
  async c => {
    const { storeId, date, items } = c.req.valid('json');
    const purchase = await createPurchaseWithProducts({ storeId, date, items });
    return c.json(purchase, StatusCodes.CREATED);
  }
);

async function createPurchaseWithProducts({
  storeId,
  date,
  items,
}: AddPurchaseWithProducts) {
  const processedItems = [];
  const codes = items.map(item => item.product.code);
  const existingProducts = await client
    .select()
    .from(products)
    .where(inArray(products.code, codes));

  const map = new Map(existingProducts.map(p => [p.code, p]));

  for (const item of items) {
    let productId: string;
    const existingProduct = map.get(item.product.code);
    if (existingProduct) {
      productId = existingProduct.productId;
    } else {
      const product = await addProduct({
        name: item.product.name,
        code: item.product.code,
      });
      productId = product.productId;
    }
    processedItems.push({
      productId,
      quantity: item.quantity,
      price: item.price,
      unit: item.unit,
    });
  }

  return await createPurchase({ storeId, date, items: processedItems });
}

export const AddPurchaseWithProductsTool = (server: McpServer) => {
  return server.registerTool(
    'add_purchase_with_products',
    {
      title: 'Add Purchase with Products',
      description: "Add a new purchase and create products if they don't exist",
      inputSchema: schema.shape,
      outputSchema: {
        success: z.boolean(),
        purchase: addPurchaseWithProductsResponseSchema.optional(),
      },
    },
    async ({ storeId, date, items }) => {
      try {
        const purchase = await createPurchaseWithProducts({
          storeId,
          date,
          items,
        });
        const structuredContent = { success: true, purchase: purchase };
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(purchase),
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
              text: `Error creating purchase with products: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
};
