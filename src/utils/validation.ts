import { type ZodSchema } from 'zod';
import type { ValidationTargets } from 'hono';
import { zValidator as zv } from '@hono/zod-validator';
import { StatusCodes } from 'http-status-codes';
import { createValidationErrorPD } from '@/utils/problem-document.js';

export const zValidator = <
  T extends ZodSchema,
  Target extends keyof ValidationTargets,
>(
  target: Target,
  schema: T
) =>
  zv(target, schema, (result, _c) => {
    if (!result.success) {
      return _c.json(
        createValidationErrorPD(_c.req.path, result.error.issues),
        StatusCodes.BAD_REQUEST
      );
    }
  });
