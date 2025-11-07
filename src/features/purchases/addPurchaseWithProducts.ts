import { Hono } from 'hono';
import { db } from '@/db/index.js';
import { purchases } from '@/db/schema/purchases.js';
import { purchaseItems } from '@/db/schema/purchaseItems.js';
import { products } from '@/db/schema/products.js';
import { inArray } from 'drizzle-orm';
import { z } from 'zod';
import { zValidator } from '@/util/validation.js';
import { createInsertSchema as drizzle2zod } from 'drizzle-zod';
import { createPurchase } from '@/features/purchases/addPurchase.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { addProduct } from '../products/addProduct.js';

const itemSchema = z.object({
  product: z.object({
    name: z.string().nonempty().max(255),
    code: z.string().nonempty().max(255),
  }),
  quantity: z.number().positive(),
  price: z.number().positive(),
});

const schema = z.object({
  storeId: z.string().uuid(),
  date: z.coerce.date(),
  items: z.array(itemSchema).min(1),
});

export type AddPurchaseWithProducts = z.infer<typeof schema>;

export type AddPurchaseItemWithProduct = z.infer<typeof itemSchema>;

const addPurchaseWithProductsResponseSchema = z.object({
  ...drizzle2zod(purchases).shape,
  items: z.array(drizzle2zod(purchaseItems)),
  createdProducts: z.array(drizzle2zod(products)),
});

export type AddPurchaseWithProductsResponse = z.infer<
  typeof addPurchaseWithProductsResponseSchema
>;

export const addWithProductsRoute = new Hono();

addWithProductsRoute.post(
  '/with-products',
  zValidator('json', schema),
  async c => {
    const { storeId, date, items } = c.req.valid('json');
    const purchase = await createPurchaseWithProducts({ storeId, date, items });
    return c.json(purchase, 201);
  }
);

async function createPurchaseWithProducts({
  storeId,
  date,
  items,
}: AddPurchaseWithProducts) {
  const processedItems = [];
  const codes = items.map(item => item.product.code);
  const existingProducts = await db
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
      const [product] = await addProduct({
        name: item.product.name,
        code: item.product.code,
      });
      productId = product!.productId;
    }
    processedItems.push({
      productId,
      quantity: item.quantity,
      price: item.price,
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
