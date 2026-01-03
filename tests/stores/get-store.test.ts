import { test, describe } from 'node:test';
import { addStore, wallmart, getStore, assertStore } from './store-dsl.js';
import { ProblemDocument } from 'http-problem-details';

describe('Get Store Endpoint', () => {
  test('should find store with valid data', async () => {
    const store = await addStore(wallmart());
    const found = await getStore(store.storeId);
    assertStore(found).isTheSameOf(store);
  });

  test('should return error when finding non-existent store', async () => {
    await getStore(
      '019a417c-6e95-78b0-86c6-ebeefffa5db2',
      new ProblemDocument({
        status: 404,
        detail: 'Store 019a417c-6e95-78b0-86c6-ebeefffa5db2 not found',
      })
    );
  });
});
