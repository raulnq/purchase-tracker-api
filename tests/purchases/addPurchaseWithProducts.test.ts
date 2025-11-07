import { test, describe } from 'node:test';
import {
  addPurchaseWithProducts,
  randomPurchaseItemWithProduct,
  randomPurchaseWithProduct,
} from './purchaseDsl.js';
import { addStore, wallmart } from '../stores/storeDsl.js';
import { addProduct, apple } from '../products/productDsl.js';

describe('Add Purchase with Products Endpoint', () => {
  describe('POST /api/purchases/with-products', () => {
    test('should create purchase with new products', async () => {
      const [store] = await addStore(wallmart());

      const purchase = randomPurchaseWithProduct({
        storeId: store!.storeId,
        items: [randomPurchaseItemWithProduct()],
      });

      await addPurchaseWithProducts(purchase);
    });

    test('should create purchase with mix of existing and new products', async () => {
      const [store] = await addStore(wallmart());
      const [product] = await addProduct(apple());
      const purchase = randomPurchaseWithProduct({
        storeId: store!.storeId,
        items: [
          randomPurchaseItemWithProduct(),
          randomPurchaseItemWithProduct({
            product: { code: product!.code!, name: product!.name! },
          }),
        ],
      });

      await addPurchaseWithProducts(purchase);
    });
  });
});
