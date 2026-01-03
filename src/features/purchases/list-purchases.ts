import { Hono } from 'hono';
import { client } from '@/database/client.js';
import { purchases } from './purchase.js';
import { stores } from '@/features/stores/store.js';
import { count, eq, and, gte, lte, SQL } from 'drizzle-orm';
import { zValidator } from '@/utils/validation.js';
import { paginationSchema, createPage } from '@/types/pagination.js';
import { z } from 'zod';
import { StatusCodes } from 'http-status-codes';

const schema = paginationSchema
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

export const listRoute = new Hono().get(
  '/',
  zValidator('query', schema),
  async c => {
    const { storeId, startDate, endDate, pageNumber, pageSize } =
      c.req.valid('query');

    const filters: SQL[] = [];
    const offset = (pageNumber - 1) * pageSize;
    const limit = pageSize;
    if (storeId) filters.push(eq(purchases.storeId, storeId));
    if (startDate) filters.push(gte(purchases.date, startDate));
    if (endDate) filters.push(lte(purchases.date, endDate));

    const [countResult, items] = await Promise.all([
      client
        .select({ totalCount: count() })
        .from(purchases)
        .innerJoin(stores, eq(purchases.storeId, stores.storeId))
        .where(and(...filters)),
      client
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
        .orderBy(purchases.date, purchases.createdAt),
    ]);

    return c.json(
      createPage(items, countResult[0].totalCount, pageNumber, pageSize),
      StatusCodes.OK
    );
  }
);
