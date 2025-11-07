import { test, describe } from 'node:test';
import { addProductsBatch, apple, rice } from './productDsl.js';

describe('Add Products Batch Endpoint', () => {
  describe('POST /api/products/batch', () => {
    test('should create multiple products with valid data', async () => {
      const products = [apple(), rice()];
      await addProductsBatch({ products });
    });

    test('should handle single product in batch', async () => {
      const products = [apple()];
      await addProductsBatch({ products });
    });
  });
});
