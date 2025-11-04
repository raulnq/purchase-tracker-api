import { type ZodSchema } from 'zod';
import type { ValidationTargets } from 'hono';
import { zValidator as zv } from '@hono/zod-validator';

export const zValidator = <
  T extends ZodSchema,
  Target extends keyof ValidationTargets,
>(
  target: Target,
  schema: T
) =>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  zv(target, schema, (result, c) => {
    if (!result.success) {
      throw result.error;
    }
  });
