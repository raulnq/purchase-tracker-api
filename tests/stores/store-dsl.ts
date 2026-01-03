import { testClient } from 'hono/testing';
import { faker } from '@faker-js/faker';
import assert from 'node:assert';
import { type AddStore } from '@/features/stores/add-store.js';
import { type EditStore } from '@/features/stores/edit-store.js';
import { type ListStores } from '@/features/stores/list-stores.js';
import { type Store } from '@/features/stores/store.js';
import { storeRoute } from '@/features/stores/index.js';
import type { ProblemDocument } from 'http-problem-details/dist/ProblemDocument.js';
import { StatusCodes } from 'http-status-codes';
import { assertStrictEqualProblemDocument } from '../assertions.js';
import type { Page } from '@/types/pagination.js';

export const randomStore = (overrides?: Partial<AddStore>): AddStore => {
  return {
    name: faker.company.name(),
    enabled: true,
    ...overrides,
  };
};

export const wallmart = (overrides?: Partial<AddStore>): AddStore => {
  return {
    name: `wallmart ${faker.string.uuid()}`,
    enabled: true,
    ...overrides,
  };
};

export async function addStore(input: AddStore): Promise<Store>;
export async function addStore(
  input: AddStore,
  expectedProblemDocument: ProblemDocument
): Promise<ProblemDocument>;

export async function addStore(
  input: AddStore,
  expectedProblemDocument?: ProblemDocument
): Promise<Store | ProblemDocument> {
  const client = testClient(storeRoute);
  const response = await client.stores.$post({
    json: input,
  });

  if (response.status === StatusCodes.CREATED) {
    assert.ok(
      !expectedProblemDocument,
      'Expected a problem document but received CREATED status'
    );
    const store = await response.json();
    assert.ok(store);
    return store;
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

export async function editStore(
  storeId: string,
  input: EditStore
): Promise<Store>;
export async function editStore(
  storeId: string,
  input: EditStore,
  expectedProblemDocument: ProblemDocument
): Promise<ProblemDocument>;
export async function editStore(
  storeId: string,
  input: EditStore,
  expectedProblemDocument?: ProblemDocument
): Promise<Store | ProblemDocument> {
  const client = testClient(storeRoute);
  const response = await client.stores[':storeId'].$put({
    param: { storeId },
    json: input,
  });

  if (response.status === StatusCodes.OK) {
    const store = await response.json();
    assert.ok(store);
    return store;
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

export async function getStore(storeId: string): Promise<Store>;
export async function getStore(
  storeId: string,
  expectedProblemDocument: ProblemDocument
): Promise<ProblemDocument>;

export async function getStore(
  storeId: string,
  expectedProblemDocument?: ProblemDocument
): Promise<Store | ProblemDocument> {
  const client = testClient(storeRoute);
  const response = await client.stores[':storeId'].$get({
    param: { storeId },
  });

  if (response.status === StatusCodes.OK) {
    const store = await response.json();
    assert.ok(store);
    return store;
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

export async function listStores(params: ListStores): Promise<Page<Store>>;
export async function listStores(
  params: ListStores,
  expectedProblemDocument: ProblemDocument
): Promise<ProblemDocument>;

export async function listStores(
  params: ListStores,
  expectedProblemDocument?: ProblemDocument
): Promise<Page<Store> | ProblemDocument> {
  const client = testClient(storeRoute);
  const queryParams = {
    pageNumber: params.pageNumber?.toString(),
    pageSize: params.pageSize?.toString(),
    name: params.name,
  };
  const response = await client.stores.$get({
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

export const assertStore = (store: Store) => {
  return {
    hasName(expected: string) {
      assert.strictEqual(
        store.name,
        expected,
        `Expected name to be ${expected}, got ${store.name}`
      );
      return this;
    },
    hasEnabled(expected: boolean) {
      assert.strictEqual(
        store.enabled,
        expected,
        `Expected enabled to be ${expected}, got ${store.enabled}`
      );
      return this;
    },
    hasStoreId(expected: string) {
      assert.strictEqual(
        store.storeId,
        expected,
        `Expected storeId to be ${expected}, got ${store.storeId}`
      );
      return this;
    },
    isTheSameOf(expected: Store) {
      return this.hasStoreId(expected.storeId)
        .hasName(expected.name)
        .hasEnabled(expected.enabled);
    },
  };
};
