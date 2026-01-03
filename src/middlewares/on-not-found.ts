import type { NotFoundHandler } from 'hono';
import { NotFoundError } from './on-error.js';

export const onNotFound: NotFoundHandler = c => {
  throw new NotFoundError(
    `The requested resource '${c.req.url}' was not found.`
  );
};
