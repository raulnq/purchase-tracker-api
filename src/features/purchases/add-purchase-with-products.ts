import { Hono } from 'hono';
import { client } from '@/database/client.js';
import { purchaseSchema, purchaseItemSchema } from './purchase.js';
import { products } from '@/features/products/product.js';
import { inArray, eq } from 'drizzle-orm';
import { z } from 'zod';
import { zValidator } from '@/utils/validation.js';
import { createPurchase } from './add-purchase.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { addProducts } from '@/features/products/add-product.js';
import { StatusCodes } from 'http-status-codes';
import { stores } from '../stores/store.js';
import { createResourceNotFoundPD } from '@/utils/problem-document.js';

const itemSchema = z.object({
  product: z.object({
    name: z.string().min(1).max(1024),
  }),
  quantity: z.number().positive(),
  price: z.number().positive(),
  unit: z.string().max(32),
});

const schema = z.object({
  storeId: z.uuid(),
  date: z.iso.date(),
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
    const [store] = await client
      .select()
      .from(stores)
      .where(eq(stores.storeId, storeId))
      .limit(1);

    if (!store) {
      return c.json(
        createResourceNotFoundPD(c.req.path, 'Store not found'),
        StatusCodes.NOT_FOUND
      );
    }
    const purchase = await createPurchaseWithProducts({ storeId, date, items });
    return c.json(purchase, StatusCodes.CREATED);
  }
);

async function createPurchaseWithProducts({
  storeId,
  date,
  items,
}: AddPurchaseWithProducts) {
  const names = items.map(item => item.product.name);

  const existingProducts = await client
    .select()
    .from(products)
    .where(inArray(products.name, names));

  const byName = new Map(existingProducts.map(p => [p.name, p]));

  const productsToCreate = items
    .filter(item => !byName.has(item.product.name))
    .map(item => ({
      name: item.product.name,
    }));

  if (productsToCreate.length > 0) {
    const created = await addProducts(productsToCreate);
    for (const p of created) {
      byName.set(p.name, p);
    }
  }

  const processedItems = items.map(item => {
    const product = byName.get(item.product.name)!;
    return {
      productId: product.productId,
      quantity: item.quantity,
      price: item.price,
      unit: item.unit,
    };
  });

  return await createPurchase({
    storeId,
    date: new Date(date),
    items: processedItems,
  });
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
