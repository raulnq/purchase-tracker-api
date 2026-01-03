import { testClient } from 'hono/testing';
import { faker } from '@faker-js/faker';
import assert from 'node:assert';
import type {
  AddPurchase,
  AddPurchaseItem,
  AddPurchaseResponse,
} from '@/features/purchases/add-purchase.js';
import type {
  AddPurchaseItemWithProduct,
  AddPurchaseWithProducts,
  AddPurchaseWithProductsResponse,
} from '@/features/purchases/add-purchase-with-products.js';
import { purchaseRoute } from '@/features/purchases/index.js';
import { v7 } from 'uuid';
import { ProblemDocument } from 'http-problem-details';
import { StatusCodes } from 'http-status-codes';
import { assertStrictEqualProblemDocument } from '../assertions.js';
import { parseDatesFromJSON } from '../utils.js';

export const randomPurchase = (options?: Partial<AddPurchase>): AddPurchase => {
  return {
    storeId: v7(),
    date: faker.date.past(),
    items: [],
    ...options,
  };
};

export const randomPurchaseWithProduct = (
  options?: Partial<AddPurchaseWithProducts>
): AddPurchaseWithProducts => {
  return {
    storeId: v7(),
    date: faker.date.past(),
    items: [],
    ...options,
  };
};

export const randomPurchaseItem = (
  options?: Partial<AddPurchaseItem>
): AddPurchaseItem => {
  return {
    productId: v7(),
    quantity: faker.number.int({ min: 1, max: 10 }),
    price: faker.number.float({ min: 0.99, max: 999.99, fractionDigits: 2 }),
    unit: 'UN',
    ...options,
  };
};

export const randomPurchaseItemWithProduct = (
  options?: Partial<AddPurchaseItemWithProduct>
): AddPurchaseItemWithProduct => {
  return {
    quantity: faker.number.int({ min: 1, max: 10 }),
    price: faker.number.float({ min: 0.99, max: 999.99, fractionDigits: 2 }),
    unit: 'UN',
    product: {
      name: faker.commerce.productName(),
      code: faker.string.numeric(10),
    },
    ...options,
  };
};

export async function addPurchase(
  input: AddPurchase
): Promise<AddPurchaseResponse>;
export async function addPurchase(
  input: AddPurchase,
  expectedProblemDocument: ProblemDocument
): Promise<ProblemDocument>;

export async function addPurchase(
  input: AddPurchase,
  expectedProblemDocument?: ProblemDocument
): Promise<AddPurchaseResponse | ProblemDocument> {
  const client = testClient(purchaseRoute);
  const response = await client.purchases.$post({
    json: input,
  });

  if (response.status === StatusCodes.CREATED) {
    assert.ok(
      !expectedProblemDocument,
      'Expected a problem document but received CREATED status'
    );
    const json = await response.json();
    const purchase = parseDatesFromJSON<AddPurchaseResponse>(json, ['date']);
    assert.ok(purchase);
    return purchase;
  } else {
    const problemDocument = await response.json();
    assert.ok(problemDocument);
    assert.ok(
      expectedProblemDocument,
      `Expected CREATED status but received ${response.status}`
    );
    assertStrictEqualProblemDocument(problemDocument, expectedProblemDocument);
    return problemDocument;
  }
}

export async function addPurchaseWithProducts(
  input: AddPurchaseWithProducts
): Promise<AddPurchaseWithProductsResponse>;
export async function addPurchaseWithProducts(
  input: AddPurchaseWithProducts,
  expectedProblemDocument: ProblemDocument
): Promise<ProblemDocument>;

export async function addPurchaseWithProducts(
  input: AddPurchaseWithProducts,
  expectedProblemDocument?: ProblemDocument
): Promise<AddPurchaseWithProductsResponse | ProblemDocument> {
  const client = testClient(purchaseRoute);
  const response = await client.purchases['with-products'].$post({
    json: input,
  });

  if (response.status === StatusCodes.CREATED) {
    assert.ok(
      !expectedProblemDocument,
      'Expected a problem document but received CREATED status'
    );
    const json = await response.json();
    const purchase = parseDatesFromJSON<AddPurchaseResponse>(json, ['date']);
    assert.ok(purchase);
    return purchase;
  } else {
    const problemDocument = await response.json();
    assert.ok(problemDocument);
    assert.ok(
      expectedProblemDocument,
      `Expected CREATED status but received ${response.status}`
    );
    assertStrictEqualProblemDocument(problemDocument, expectedProblemDocument);
    return problemDocument;
  }
}
