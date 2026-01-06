import type { NotFoundHandler } from 'hono';
import { StatusCodes } from 'http-status-codes';
import { createResourceNotFoundPD } from '@/utils/problem-document.js';

export const onNotFound: NotFoundHandler = c => {
  return c.json(
    createResourceNotFoundPD(c.req.path, 'Resource not found'),
    StatusCodes.NOT_FOUND
  );
};
