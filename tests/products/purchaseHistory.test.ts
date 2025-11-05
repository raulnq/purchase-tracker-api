import { describe, test } from 'node:test';
import assert from 'node:assert';
import { addProduct, apple, findProductPurchaseHistory } from './productDsl.js';
import { addStore, wallmart } from '../stores/storeDsl.js';
import {
  addPurchase,
  randomPurchase,
  randomPurchaseItem,
} from '../purchases/purchaseDsl.js';

describe('Find Purchase History Endpoint', () => {
  describe('GET /api/products/:productId/purchase-history', () => {
    test('should list purchase history with valid data', async () => {
      const [store] = await addStore(wallmart());

      const [product] = await addProduct(apple());

      const data = randomPurchase({
        storeId: store!.storeId,
        items: [randomPurchaseItem({ productId: product!.productId })],
      });

      await addPurchase(data);
      const [history] = await findProductPurchaseHistory(product!.productId, {
        pageNumber: 1,
        pageSize: 10,
      });

      assert.ok(history);
    });
  });
});

/*
describe('Product Purchase History', () => {
  it('should return 404 for non-existent product', async () => {
    // Act
    const response = await getPurchaseHistory(
      '00000000-0000-0000-0000-000000000000'
    );

    // Assert
    assert.strictEqual(response.status, 404);
  });

  it('should return empty result for product with no purchases', async () => {
    // Arrange
    const [product] = await addProduct(randomProduct());

    if (!product) {
      throw new Error('Failed to create product');
    }

    // Act
    const response = await getPurchaseHistory(product.productId);

    // Assert
    assert.strictEqual(response.status, 200);
    const data = await response.json();
    assert.strictEqual(data.items.length, 0);
    assert.strictEqual(data.totalCount, 0);
  });

  it('should handle pagination parameters', async () => {
    // Arrange
    const [product] = await addProduct(randomProduct());

    if (!product) {
      throw new Error('Failed to create product');
    }

    // Act
    const response = await getPurchaseHistory(product.productId, {
      pageSize: 5,
      pageNumber: 1,
    });

    // Assert
    assert.strictEqual(response.status, 200);
    const data = await response.json();
    assert.strictEqual(data.pageSize, 5);
    assert.strictEqual(data.pageNumber, 1);
  });
});
*/
