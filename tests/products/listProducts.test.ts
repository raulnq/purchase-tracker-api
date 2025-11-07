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

    test('should list products by code', async () => {
      const [product] = await addProduct(apple());
      await listProducts({
        codes: [product!.code],
        pageNumber: 1,
        pageSize: 10,
      });
    });

    test('should list products by multiple codes', async () => {
      const [appleProduct] = await addProduct(apple());
      const [riceProduct] = await addProduct(apple());
      await listProducts({
        codes: [appleProduct!.code, riceProduct!.code],
        pageNumber: 1,
        pageSize: 10,
      });
    });
  });
});
