import { test, describe } from 'node:test';
import { addProduct, randomProduct, apple } from './productDsl.js';
import { ProblemDocument } from 'http-problem-details';
import { emptyText, bigText } from '../utils.js';

describe('Add Store Endpoint', () => {
  describe('POST /api/products', () => {
    test('should create a new product with valid data', async () => {
      await addProduct(apple());
    });

    test('should reject empty product name', async () => {
      const data = randomProduct({ name: emptyText });
      await addProduct(
        data,
        new ProblemDocument(
          {
            detail: 'The request contains invalid data',
            status: 400,
          },
          {
            errors: [
              {
                field: 'name',
                message: 'String must contain at least 1 character(s)',
              },
            ],
          }
        )
      );
    });

    test('should reject big product name', async () => {
      const data = randomProduct({ name: bigText() });
      await addProduct(
        data,
        new ProblemDocument(
          {
            detail: 'The request contains invalid data',
            status: 400,
          },
          {
            errors: [
              {
                field: 'name',
                message: 'String must contain at most 255 character(s)',
              },
            ],
          }
        )
      );
    });

    test('should reject big product code', async () => {
      const data = randomProduct({ code: bigText() });
      await addProduct(
        data,
        new ProblemDocument(
          {
            detail: 'The request contains invalid data',
            status: 400,
          },
          {
            errors: [
              {
                field: 'code',
                message: 'String must contain at most 255 character(s)',
              },
            ],
          }
        )
      );
    });
  });
});
