import { Hono } from 'hono';
import { db } from '@/db/index.js';
import { purchases } from '@/db/schema/purchases.js';
import { stores } from '@/db/schema/stores.js';
import { count, eq, and, gte, lte, SQL } from 'drizzle-orm';
import { zValidator } from '@/util/validation.js';
import { pagination } from '@/util/pagination.js';
import { z } from 'zod';

const schema = pagination
  .extend({
    storeId: z.string().uuid().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  })
  .refine(
    data => {
      if (data.startDate && data.endDate) {
        return data.endDate >= data.startDate;
      }
      return true;
    },
    {
      message: 'End date must be greater than or equal to start date',
      path: ['endDate'],
    }
  );

export type ListPurchases = z.infer<typeof schema>;

export const listRoute = new Hono();

listRoute.get('/', zValidator('query', schema), async c => {
  const { storeId, startDate, endDate, pageNumber, pageSize } =
    c.req.valid('query');

  const filters: SQL[] = [];
  const offset = (pageNumber - 1) * pageSize;
  const limit = pageSize;
  if (storeId) filters.push(eq(purchases.storeId, storeId));
  if (startDate) filters.push(gte(purchases.date, startDate));
  if (endDate) filters.push(lte(purchases.date, endDate));

  const [{ totalCount }] = await db
    .select({ totalCount: count() })
    .from(purchases)
    .innerJoin(stores, eq(purchases.storeId, stores.storeId))
    .where(and(...filters));

  const items = await db
    .select({
      purchaseId: purchases.purchaseId,
      storeId: purchases.storeId,
      storeName: stores.name,
      date: purchases.date,
      total: purchases.total,
      createdAt: purchases.createdAt,
    })
    .from(purchases)
    .innerJoin(stores, eq(purchases.storeId, stores.storeId))
    .where(and(...filters))
    .limit(limit)
    .offset(offset)
    .orderBy(purchases.date, purchases.createdAt);

  return c.json({
    items,
    pageNumber: pageNumber,
    pageSize: pageSize,
    totalCount: totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
  });
});
