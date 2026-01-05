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
import { StatusCodes } from 'http-status-codes';

const itemSchema = purchaseItemSchema.omit({
  purchaseItemId: true,
  purchaseId: true,
  total: true,
});

const schema = purchaseSchema
  .omit({ createdAt: true, total: true, purchaseId: true })
  .extend({
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        total: total,
      })
      .returning();

    const createdItems = await tx
      .insert(purchaseItems)
      .values(
        items.map(i => ({
          purchaseId: purchase.purchaseId,
          productId: i.productId,
          price: i.price,
          quantity: i.quantity,
          total: i.price * i.quantity,
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
