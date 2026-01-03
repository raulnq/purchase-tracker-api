import { ProblemDocument } from 'http-problem-details';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { ENV } from '@/env.js';
import type { HTTPResponseError } from 'hono/types';

export const createResourceNotFoundPD = (path: string, detail: string) => {
  return new ProblemDocument({
    type: '/problems/resource-not-found',
    title: 'Resource not found',
    status: StatusCodes.NOT_FOUND,
    detail: detail,
    instance: path,
  });
};

export const createInternalServerErrorPD = (
  path: string,
  error?: Error | HTTPResponseError
) => {
  const extensions =
    ENV.NODE_ENV === 'development' && error?.stack
      ? { stack: error.stack }
      : undefined;

  return new ProblemDocument(
    {
      type: '/problems/internal-server-error',
      title: 'Internal Server Error',
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      detail: 'An unexpected error occurred',
      instance: path,
    },
    extensions
  );
};

export const createValidationErrorPD = (path: string, issues: z.ZodIssue[]) => {
  return new ProblemDocument(
    {
      type: '/problems/validation-error',
      title: 'Validation Error',
      status: StatusCodes.BAD_REQUEST,
      detail: 'The request contains invalid data',
      instance: path,
    },
    {
      errors: issues.map(err => ({
        path: err.path.join('.'),
        message: err.message,
        code: err.code,
      })),
    }
  );
};
