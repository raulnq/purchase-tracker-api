import { Hono } from 'hono';
import { client } from '@/database/client.js';
import {
  purchases,
  purchaseItems,
  purchaseSchema,
  purchaseItemSchema,
} from './purchase.js';
import { products } from '@/features/products/product.js';
import { stores } from '@/features/stores/store.js';
import { eq, inArray } from 'drizzle-orm';
import { v7 } from 'uuid';
import { z } from 'zod';
import { zValidator } from '@/utils/validation.js';
import { createResourceNotFoundPD } from '@/utils/problem-document.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StatusCodes } from 'http-status-codes';

const itemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().positive(),
  price: z.number().positive(),
  unit: z.string(),
});

const schema = z.object({
  storeId: z.string().uuid(),
  date: z.coerce.date(),
  items: z
    .array(itemSchema)
    .min(1)
    .refine(
      items => {
        const productIds = items.map(item => item.productId);
        const uniqueIds = new Set(productIds);
        return uniqueIds.size === productIds.length;
      },
      {
        message: 'Duplicate products are not allowed',
      }
    ),
});

export type AddPurchase = z.infer<typeof schema>;

export type AddPurchaseItem = z.infer<typeof itemSchema>;

const addPurchaseResponseSchema = z.object({
  ...purchaseSchema.shape,
  items: z.array(purchaseItemSchema),
});

export type AddPurchaseResponse = z.infer<typeof addPurchaseResponseSchema>;

export const addRoute = new Hono().post(
  '/',
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

    const productIds = items.map(item => item.productId);

    const existingProducts = await client
      .select({ productId: products.productId })
      .from(products)
      .where(inArray(products.productId, productIds));

    if (existingProducts.length !== productIds.length) {
      const foundSet = new Set(existingProducts.map(p => p.productId));
      const missingIds = productIds.filter(id => !foundSet.has(id));
      return c.json(
        createResourceNotFoundPD(
          c.req.path,
          `Products not found: ${missingIds.join(', ')}`
        ),
        StatusCodes.NOT_FOUND
      );
    }

    const purchase = await createPurchase({ storeId, date, items });
    return c.json(purchase, StatusCodes.CREATED);
  }
);

export const createPurchase = async function ({
  storeId,
  date,
  items,
}: AddPurchase) {
  return await client.transaction(async tx => {
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const [purchase] = await tx
      .insert(purchases)
      .values({
        purchaseId: v7(),
        storeId: storeId,
        date: date,
        total: total.toString(),
      })
      .returning();

    const createdItems = await tx
      .insert(purchaseItems)
      .values(
        items.map(i => ({
          purchaseId: purchase.purchaseId,
          productId: i.productId,
          price: i.price.toString(),
          quantity: i.quantity.toString(),
          total: (i.price * i.quantity).toString(),
          unit: i.unit,
        }))
      )
      .returning();

    return {
      ...purchase,
      items: createdItems,
    };
  });
};

export const AddPurchaseTool = (server: McpServer) => {
  return server.registerTool(
    'add_purchase',
    {
      title: 'Add Purchase',
      description: 'Add a new purchase',
      inputSchema: schema.shape,
      outputSchema: {
        success: z.boolean(),
        purchase: addPurchaseResponseSchema.optional(),
      },
    },
    async ({ storeId, date, items }) => {
      try {
        const purchase = await createPurchase({ storeId, date, items });
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
              text: `Error creating purchase: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
};
