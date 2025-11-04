import { test, describe } from 'node:test';
import {
  addPurchase,
  randomPurchase,
  randomPurchaseItem,
} from './purchaseDsl.js';
import { addStore, wallmart } from '../stores/storeDsl.js';
import { addProduct, apple, rice } from '../products/productDsl.js';
import { ProblemDocument } from 'http-problem-details';

describe('Add Purchase Endpoint', () => {
  describe('POST /api/purchases', async () => {
    test('should create a one product new purchase with valid data', async () => {
      const [store] = await addStore(wallmart());

      const [product] = await addProduct(apple());

      const data = randomPurchase({
        storeId: store!.storeId,
        items: [randomPurchaseItem({ productId: product!.productId })],
      });

      await addPurchase(data);
    });

    test('should create a multiple products new purchase with valid data', async () => {
      const [store] = await addStore(wallmart());

      const [appleProduct] = await addProduct(apple());
      const [riceProduct] = await addProduct(rice());

      const data = randomPurchase({
        storeId: store!.storeId,
        items: [
          randomPurchaseItem({ productId: appleProduct!.productId }),
          randomPurchaseItem({ productId: riceProduct!.productId }),
        ],
      });

      await addPurchase(data);
    });

    test('should return error when storeId does not exist', async () => {
      const [product] = await addProduct(apple());
      const data = randomPurchase({
        items: [randomPurchaseItem({ productId: product!.productId })],
      });

      await addPurchase(
        data,
        new ProblemDocument({
          status: 404,
          detail: `Store not found`,
        })
      );
    });

    test('should return error when productId does not exist', async () => {
      const [store] = await addStore(wallmart());

      const data = randomPurchase({
        storeId: store!.storeId,
        items: [randomPurchaseItem()],
      });

      await addPurchase(
        data,
        new ProblemDocument({
          status: 404,
          detail: `Products not found: ${data.items[0].productId}`,
        })
      );
    });

    test('should return error when duplicate productId exists', async () => {
      const [store] = await addStore(wallmart());

      const [product] = await addProduct(apple());

      const data = randomPurchase({
        storeId: store!.storeId,
        items: [
          randomPurchaseItem({ productId: product!.productId }),
          randomPurchaseItem({ productId: product!.productId }),
        ],
      });

      await addPurchase(
        data,
        new ProblemDocument(
          {
            detail: 'The request contains invalid data',
            status: 400,
          },
          {
            errors: [
              {
                field: 'items',
                message: 'Duplicate products are not allowed',
              },
            ],
          }
        )
      );
    });
  });
});
