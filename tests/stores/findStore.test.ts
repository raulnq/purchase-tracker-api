import { test, describe } from 'node:test';
import { addStore, wallmart, findStore } from './storeDsl.js';
import { ProblemDocument } from 'http-problem-details';

describe('Find Store Endpoint', () => {
  describe('GET /api/stores:storeId', () => {
    test('should find store with valid data', async () => {
      const [store] = await addStore(wallmart());
      await findStore(store!.storeId);
    });

    test('should return error when finding non-existent store', async () => {
      await findStore(
        '019a417c-6e95-78b0-86c6-ebeefffa5db2',
        new ProblemDocument({
          status: 404,
          detail: 'Store not found',
        })
      );
    });
  });
});
