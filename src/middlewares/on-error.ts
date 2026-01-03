import type { ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { ProblemDocument } from 'http-problem-details';
import { ZodError } from 'zod';
import { StatusCodes } from 'http-status-codes';
import {
  createValidationErrorPD,
  createInternalServerErrorPD,
} from '@/utils/problem-document.js';

interface AppErrorOptions {
  type: string;
  status: ContentfulStatusCode;
  title: string;
}

export class AppError extends Error {
  public readonly type: string;
  public readonly status: ContentfulStatusCode;
  public readonly title: string;

  constructor(message: string, options: AppErrorOptions) {
    super(message);

    this.name = this.constructor.name;
    this.type = options.type;
    this.status = options.status;
    this.title = options.title;
  }

  toProblemDocument(instance: string): ProblemDocument {
    return new ProblemDocument({
      type: this.type,
      title: this.title,
      status: this.status,
      detail: this.message,
      instance: instance,
    });
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, {
      type: '/problems/resource-not-found',
      status: StatusCodes.NOT_FOUND,
      title: 'Resource Not Found',
    });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(message, {
      type: '/problems/unauthorized',
      status: StatusCodes.UNAUTHORIZED,
      title: 'Unauthorized',
    });
  }
}

export const onError: ErrorHandler = (err, c) => {
  console.error(err);
  if (err instanceof ZodError) {
    const problem = createValidationErrorPD(c.req.url, err.issues);
    return c.json(problem, StatusCodes.BAD_REQUEST);
  }
  if (err instanceof AppError) {
    const problem = err.toProblemDocument(c.req.url);
    return c.json(problem, err.status);
  }
  if (err instanceof HTTPException) {
    if (err.status === StatusCodes.UNAUTHORIZED) {
      return c.json(
        new UnauthorizedError('Invalid token').toProblemDocument(c.req.url),
        StatusCodes.UNAUTHORIZED
      );
    }
    return err.res!;
  }
  const problem = createInternalServerErrorPD(c.req.url, err);

  return c.json(problem, StatusCodes.INTERNAL_SERVER_ERROR);
};
