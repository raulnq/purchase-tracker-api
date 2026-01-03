import { test, describe } from 'node:test';
import {
  addProduct,
  randomProduct,
  apple,
  assertProduct,
} from './product-dsl.js';
import { ProblemDocument } from 'http-problem-details';
import { emptyText, bigText } from '../utils.js';

describe('Add Product Endpoint', () => {
  test('should create a new product with valid data', async () => {
    const input = apple();
    const product = await addProduct(input);
    assertProduct(product).hasName(input.name).hasCode(input.code);
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
              path: 'name',
              message: 'Too small: expected string to have >=1 characters',
              code: 'too_small',
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
              path: 'name',
              message: 'Too big: expected string to have <=255 characters',
              code: 'too_big',
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
              path: 'code',
              message: 'Too big: expected string to have <=255 characters',
              code: 'too_big',
            },
          ],
        }
      )
    );
  });
});
