import { test, describe } from 'node:test';
import { addStore, wallmart, editStore, assertStore } from './store-dsl.js';
import { emptyText, bigText } from '../utils.js';
import { ProblemDocument } from 'http-problem-details';

describe('Edit Store Endpoint', () => {
  test('should update an existing store with valid data', async () => {
    const store = await addStore(wallmart());

    const data = {
      name: 'new name',
      enabled: false,
    };

    const result = await editStore(store.storeId, data);
    assertStore(result).hasName(data.name).hasEnabled(data.enabled);
  });

  test('should return error when updating non-existent store', async () => {
    await editStore(
      '019a417c-6e95-78b0-86c6-ebeefffa5db2',
      {
        name: 'new name',
        enabled: false,
      },
      new ProblemDocument({
        status: 404,
        detail: 'Store 019a417c-6e95-78b0-86c6-ebeefffa5db2 not found',
      })
    );
  });

  test('should reject empty store name in update', async () => {
    const store = await addStore(wallmart());

    await editStore(
      store.storeId,
      {
        name: emptyText,
        enabled: true,
      },
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

  test('should reject big store name in update', async () => {
    const store = await addStore(wallmart());

    await editStore(
      store.storeId,
      {
        name: bigText(),
        enabled: true,
      },
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
