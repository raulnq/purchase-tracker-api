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

  test('should list products by code', async () => {
    const product = await addProduct(apple());
    const page = await listProducts({
      codes: [product.code],
      pageNumber: 1,
      pageSize: 10,
    });
    assertPage(page).hasItemsCountAtLeast(1);
  });

  test('should list products by multiple codes', async () => {
    const appleProduct = await addProduct(apple());
    const riceProduct = await addProduct(apple());
    const page = await listProducts({
      codes: [appleProduct.code, riceProduct.code],
      pageNumber: 1,
      pageSize: 10,
    });
    assertPage(page).hasItemsCountAtLeast(2);
  });
});
