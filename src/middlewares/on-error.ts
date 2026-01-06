import { createInternalServerErrorPD } from '@/utils/problem-document.js';
import type { ErrorHandler } from 'hono';
import { StatusCodes } from 'http-status-codes';

export const onError: ErrorHandler = (_err, c) => {
  console.error(_err, 'Unhandled error');
  return c.json(
    createInternalServerErrorPD(c.req.path, _err),
    StatusCodes.INTERNAL_SERVER_ERROR
  );
};
