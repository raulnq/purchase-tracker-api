import { describe, test } from 'node:test';
import assert from 'node:assert';
import { addProduct, apple, getProductPurchaseHistory } from './product-dsl.js';
import { addStore, wallmart } from '../stores/store-dsl.js';
import {
  addPurchase,
  randomPurchase,
  randomPurchaseItem,
} from '../purchases/purchase-dsl.js';

describe('Get Purchase History Endpoint', () => {
  test('should list purchase history with valid data', async () => {
    const store = await addStore(wallmart());
    const product = await addProduct(apple());

    const data = randomPurchase({
      storeId: store.storeId,
      items: [randomPurchaseItem({ productId: product.productId })],
    });

    await addPurchase(data);
    const history = await getProductPurchaseHistory(product.productId, {
      pageNumber: 1,
      pageSize: 10,
    });

    assert.ok(history);
    assert.ok(history.items.length >= 1);
  });
});
