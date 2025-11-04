import { test, describe } from 'node:test';
import { addStore, wallmart, listStores } from './storeDsl.js';

describe('List Store Endpoint', () => {
  describe('GET /api/stores', () => {
    test('should list stores with valid data', async () => {
      const [store] = await addStore(wallmart());
      await listStores({
        name: store?.name,
        pageNumber: 1,
        pageSize: 10,
      });
    });
  });
});
