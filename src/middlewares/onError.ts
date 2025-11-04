import type { ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { ProblemDocument } from 'http-problem-details';
import { ZodError } from 'zod';

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
      status: 404,
      title: 'Resource Not Found',
    });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(message, {
      type: '/problems/unauthorized',
      status: 401,
      title: 'Unauthorized',
    });
  }
}

export const onError: ErrorHandler = (err, c) => {
  console.error(err);
  if (err instanceof ZodError) {
    const details = err.issues.map(i => ({
      field: i.path.join('.'),
      message: i.message,
    }));
    const problem = new ProblemDocument(
      {
        type: '/problems/validation-error',
        title: 'Validation Error',
        status: 400,
        detail: 'The request contains invalid data',
        instance: c.req.url,
      },
      {
        errors: details,
      }
    );
    return c.json(problem, 400);
  }
  if (err instanceof AppError) {
    const problem = err.toProblemDocument(c.req.url);
    return c.json(problem, err.status);
  }
  if (err instanceof HTTPException) {
    if (err.status === 401) {
      return c.json(
        new UnauthorizedError('Invalid token').toProblemDocument(c.req.url),
        401
      );
    }
    return err.res!;
  }
  const problem = new ProblemDocument({
    type: '/problems/internal-server-error',
    title: 'Internal Server Error',
    status: 500,
    detail: 'An unexpected error occurred',
    instance: c.req.url,
  });

  return c.json(problem, 500);
};
