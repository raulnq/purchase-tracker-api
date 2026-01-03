import { test, describe } from 'node:test';
import { addStore, wallmart, assertStore } from './store-dsl.js';
import { emptyText, bigText } from '../utils.js';
import { ProblemDocument } from 'http-problem-details';

describe('Add Store Endpoint', () => {
  test('should create a new store with valid data', async () => {
    const input = wallmart();
    const store = await addStore(input);
    assertStore(store).hasName(input.name).hasEnabled(input.enabled);
  });

  test('should reject empty store name', async () => {
    await addStore(
      { name: emptyText, enabled: true },
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

  test('should reject big store name', async () => {
    await addStore(
      { name: bigText(), enabled: true },
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
});
