import { test, describe } from 'node:test';
import { addStore, wallmart, listStores } from './store-dsl.js';
import { assertPage } from '../assertions.js';

describe('List Store Endpoint', () => {
  test('should list stores with valid data', async () => {
    const store = await addStore(wallmart());
    const page = await listStores({
      name: store.name,
      pageNumber: 1,
      pageSize: 10,
    });
    assertPage(page).hasItemsCountAtLeast(1);
  });
});
