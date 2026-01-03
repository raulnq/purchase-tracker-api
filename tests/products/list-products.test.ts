import { test, describe } from 'node:test';
import { addProduct, listProducts, apple } from './product-dsl.js';
import { assertPage } from '../assertions.js';

describe('List Product Endpoint', () => {
  test('should list products with valid data', async () => {
    const product = await addProduct(apple());
    const page = await listProducts({
      name: product.name,
      pageNumber: 1,
      pageSize: 10,
    });
    assertPage(page).hasItemsCountAtLeast(1);
  });

  test('should list products by name', async () => {
    const product = await addProduct(apple());
    const page = await listProducts({
      pageNumber: 1,
      pageSize: 10,
      name: product.name,
    });
    assertPage(page).hasItemsCountAtLeast(1);
  });
});
