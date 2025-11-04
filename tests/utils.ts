import assert from 'node:assert';
import { ProblemDocument } from 'http-problem-details';
import { app } from '@/app.js';
import { type Page } from '@/util/pagination.js';

export const assertStrictEqualProblemDocument = (
  actual: ProblemDocument,
  expected: ProblemDocument
): void => {
  assert.strictEqual(actual.status, expected.status);
  assert.strictEqual(actual.detail, expected.detail);
  if ('errors' in actual && 'errors' in expected) {
    assert.deepStrictEqual(actual['errors'], expected['errors']);
  }
};

export const Send = async (path: string, options: RequestInit = {}) => {
  const request = new Request(`http://localhost${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  return await app.fetch(request);
};

type InvokeMutationApiOptions<TInput> = {
  problemDocument?: ProblemDocument;
  successStatus?: number;
  endpoint: string;
  method: 'POST' | 'PUT';
  input: TInput;
};

export const invokeMutationApi = async <TInput, TResult>(
  options: InvokeMutationApiOptions<TInput>
): Promise<[TResult | undefined, ProblemDocument | undefined]> => {
  const { endpoint, method, input, problemDocument, successStatus } = options;
  const response = await Send(endpoint, {
    method: method,
    body: JSON.stringify(input),
  });

  if (!problemDocument) {
    assert.strictEqual(response.status, successStatus);
    const result = (await response.json()) as TResult;
    assert.ok(result);
    return [result, undefined];
  } else {
    const problem = (await response.json()) as ProblemDocument;
    assertStrictEqualProblemDocument(problem, problemDocument);
    return [undefined, problem];
  }
};

type InvokeListQueryApiOptions<TInput> = {
  problemDocument?: ProblemDocument;
  endpoint: string;
  input: TInput;
};

export const invokeListQueryApi = async <TInput, TResult>(
  options: InvokeListQueryApiOptions<TInput>
): Promise<[Page<TResult> | undefined, ProblemDocument | undefined]> => {
  const { endpoint, input, problemDocument } = options;

  const queryParams = new URLSearchParams();
  if (input && typeof input === 'object') {
    Object.entries(input).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
  }

  const url = queryParams.toString()
    ? `${endpoint}?${queryParams.toString()}`
    : endpoint;

  const response = await Send(url, {
    method: 'GET',
  });

  if (!problemDocument) {
    assert.strictEqual(response.status, 200);
    const result = (await response.json()) as Page<TResult>;
    assert.ok(result);
    assert.notEqual(result.items.length, 0);

    return [result, undefined];
  } else {
    const problem = (await response.json()) as ProblemDocument;
    assertStrictEqualProblemDocument(problem, problemDocument);
    return [undefined, problem];
  }
};

type InvokeSingleQueryApiOptions = {
  problemDocument?: ProblemDocument;
  endpoint: string;
};

export const invokeSingleQueryApi = async <TResult>(
  options: InvokeSingleQueryApiOptions
): Promise<[TResult | undefined, ProblemDocument | undefined]> => {
  const { endpoint, problemDocument } = options;
  const response = await Send(endpoint, {
    method: 'GET',
  });

  if (!problemDocument) {
    assert.strictEqual(response.status, 200);
    const result = (await response.json()) as TResult;
    assert.ok(result);
    return [result, undefined];
  } else {
    const problem = (await response.json()) as ProblemDocument;
    assertStrictEqualProblemDocument(problem, problemDocument);
    return [undefined, problem];
  }
};

export const emptyText = '';

export const bigText = (lenght: number = 256): string => {
  return 'a'.repeat(lenght);
};
