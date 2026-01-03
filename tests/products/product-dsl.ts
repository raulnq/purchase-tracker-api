import { testClient } from 'hono/testing';
import { faker } from '@faker-js/faker';
import assert from 'node:assert';
import { type AddProduct } from '@/features/products/add-product.js';
import { type ListProducts } from '@/features/products/list-products.js';
import {
  type GetProductPurchaseHistory,
  type PurchaseHistoryItem,
} from '@/features/products/get-product-purchase-history.js';
import { type Product } from '@/features/products/product.js';
import { productRoute } from '@/features/products/index.js';
import type { ProblemDocument } from 'http-problem-details/dist/ProblemDocument.js';
import { StatusCodes } from 'http-status-codes';
import { assertStrictEqualProblemDocument } from '../assertions.js';
import type { Page } from '@/types/pagination.js';

export const randomProduct = (overrides?: Partial<AddProduct>): AddProduct => {
  return {
    name: faker.commerce.productName(),
    code: faker.string.numeric(10),
    ...overrides,
  };
};

export const apple = (overrides?: Partial<AddProduct>): AddProduct => {
  return {
    name: `apple ${faker.string.uuid()}`,
    code: faker.string.numeric(10),
    ...overrides,
  };
};

export const rice = (overrides?: Partial<AddProduct>): AddProduct => {
  return {
    name: `rice ${faker.string.uuid()}`,
    code: faker.string.numeric(10),
    ...overrides,
  };
};

export async function addProduct(input: AddProduct): Promise<Product>;
export async function addProduct(
  input: AddProduct,
  expectedProblemDocument: ProblemDocument
): Promise<ProblemDocument>;

export async function addProduct(
  input: AddProduct,
  expectedProblemDocument?: ProblemDocument
): Promise<Product | ProblemDocument> {
  const client = testClient(productRoute);
  const response = await client.products.$post({
    json: input,
  });

  if (response.status === StatusCodes.CREATED) {
    assert.ok(
      !expectedProblemDocument,
      'Expected a problem document but received CREATED status'
    );
    const product = await response.json();
    assert.ok(product);
    return product;
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

export async function listProducts(
  params: ListProducts
): Promise<Page<Product>>;
export async function listProducts(
  params: ListProducts,
  expectedProblemDocument: ProblemDocument
): Promise<ProblemDocument>;

export async function listProducts(
  params: ListProducts,
  expectedProblemDocument?: ProblemDocument
): Promise<Page<Product> | ProblemDocument> {
  const client = testClient(productRoute);
  const queryParams = {
    pageNumber: params.pageNumber?.toString(),
    pageSize: params.pageSize?.toString(),
    name: params.name,
    categoryId: params.categoryId,
  };
  const response = await client.products.$get({
    query: queryParams,
  });

  if (response.status === StatusCodes.OK) {
    const page = await response.json();
    assert.ok(page);
    return page;
  } else {
    const problemDocument = await response.json();
    assert.ok(problemDocument);
    if (expectedProblemDocument) {
      assertStrictEqualProblemDocument(
        problemDocument,
        expectedProblemDocument
      );
    }
    return problemDocument;
  }
}

export async function getProductPurchaseHistory(
  productId: string,
  params: GetProductPurchaseHistory
): Promise<Page<PurchaseHistoryItem>>;
export async function getProductPurchaseHistory(
  productId: string,
  params: GetProductPurchaseHistory,
  expectedProblemDocument: ProblemDocument
): Promise<ProblemDocument>;

export async function getProductPurchaseHistory(
  productId: string,
  params: GetProductPurchaseHistory,
  expectedProblemDocument?: ProblemDocument
): Promise<Page<PurchaseHistoryItem> | ProblemDocument> {
  const client = testClient(productRoute);
  const queryParams = {
    pageNumber: params.pageNumber?.toString(),
    pageSize: params.pageSize?.toString(),
    startDate: params.startDate,
  };
  const response = await client.products[':productId']['purchase-history'].$get(
    {
      param: { productId },
      query: queryParams,
    }
  );

  if (response.status === StatusCodes.OK) {
    const page =
      (await response.json()) as unknown as Page<PurchaseHistoryItem>;
    assert.ok(page);
    return page;
  } else {
    const problemDocument = await response.json();
    assert.ok(problemDocument);
    if (expectedProblemDocument) {
      assertStrictEqualProblemDocument(
        problemDocument,
        expectedProblemDocument
      );
    }
    return problemDocument;
  }
}

export const assertProduct = (product: Product) => {
  return {
    hasName(expected: string) {
      assert.strictEqual(
        product.name,
        expected,
        `Expected name to be ${expected}, got ${product.name}`
      );
      return this;
    },
    hasCode(expected: string) {
      assert.strictEqual(
        product.code,
        expected,
        `Expected code to be ${expected}, got ${product.code}`
      );
      return this;
    },
    hasProductId(expected: string) {
      assert.strictEqual(
        product.productId,
        expected,
        `Expected productId to be ${expected}, got ${product.productId}`
      );
      return this;
    },
  };
};
