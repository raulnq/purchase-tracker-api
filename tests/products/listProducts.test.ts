import { test, describe } from 'node:test';
import { addProduct, listProducts, apple } from './productDsl.js';

describe('List Product Endpoint', () => {
  describe('GET /api/products', () => {
    test('should list products with valid data', async () => {
      const [product] = await addProduct(apple());
      await listProducts({
        name: product?.name,
        pageNumber: 1,
        pageSize: 10,
      });
    });
  });
});
