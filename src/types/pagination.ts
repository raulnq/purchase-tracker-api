import { z } from 'zod';

const DEFAULT_PAGE_NUMBER = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

export const paginationSchema = z.object({
  pageNumber: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .default(DEFAULT_PAGE_NUMBER),
  pageSize: z.coerce
    .number()
    .int()
    .positive()
    .max(MAX_PAGE_SIZE)
    .optional()
    .default(DEFAULT_PAGE_SIZE),
});

export interface Page<TResult> {
  items: TResult[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

export const createPage = <TResult>(
  items: TResult[],
  totalCount: number,
  pageNumber: number,
  pageSize: number
): Page<TResult> => {
  const totalPages = Math.ceil(totalCount / pageSize);
  return {
    items,
    pageNumber,
    pageSize,
    totalPages,
    totalCount,
  };
};

export const createPageSchema = <T>(itemSchema: z.ZodSchema<T>) =>
  z.object({
    items: z.array(itemSchema),
    pageNumber: z.number().min(1),
    pageSize: z.number().min(1).max(MAX_PAGE_SIZE),
    totalPages: z.number().min(0),
    totalCount: z.number().min(0),
  });
