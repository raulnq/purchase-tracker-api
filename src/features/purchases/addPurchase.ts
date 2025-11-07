import { Hono } from 'hono';
import { db } from '@/db/index.js';
import { purchases } from '@/db/schema/purchases.js';
import { purchaseItems } from '@/db/schema/purchaseItems.js';
import { products } from '@/db/schema/products.js';
import { stores } from '@/db/schema/stores.js';
import { eq, inArray } from 'drizzle-orm';
import { v7 } from 'uuid';
import { z } from 'zod';
import { zValidator } from '@/util/validation.js';
import { NotFoundError } from '@/middlewares/onError.js';
import { createInsertSchema as drizzle2zod } from 'drizzle-zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const itemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().positive(),
  price: z.number().positive(),
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
  ...drizzle2zod(purchases).shape,
  items: z.array(drizzle2zod(purchaseItems)),
});

export type AddPurchaseResponse = z.infer<typeof addPurchaseResponseSchema>;

export const addRoute = new Hono();

addRoute.post('/', zValidator('json', schema), async c => {
  const { storeId, date, items } = c.req.valid('json');
  const purchase = await createPurchase({ storeId, date, items });
  return c.json(purchase, 201);
});

export const createPurchase = async function ({
  storeId,
  date,
  items,
}: AddPurchase) {
  const [store] = await db
    .select()
    .from(stores)
    .where(eq(stores.storeId, storeId))
    .limit(1);

  if (!store) {
    throw new NotFoundError('Store not found');
  }

  const productIds = items.map(item => item.productId);

  const existingProducts = await db
    .select({ productId: products.productId })
    .from(products)
    .where(inArray(products.productId, productIds));

  if (existingProducts.length !== productIds.length) {
    const foundIds = existingProducts.map(p => p.productId);
    const missingIds = productIds.filter(id => !foundIds.includes(id));
    throw new NotFoundError(`Products not found: ${missingIds.join(', ')}`);
  }

  return await db.transaction(async tx => {
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
              text: `Error creating product: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
};
