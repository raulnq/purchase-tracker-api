import assert from 'node:assert';
import { ProblemDocument } from 'http-problem-details';
import type { Page } from '@/types/pagination.js';

export const assertPage = <TResult>(page: Page<TResult>) => {
  return {
    hasItemsCountAtLeast(expected: number) {
      assert.ok(page);
      assert.ok(
        page.items.length >= expected,
        `Expected at least ${expected} items, got ${page.items.length}`
      );
      return this;
    },
    hasItemsCount(expected: number) {
      assert.ok(page);
      assert.strictEqual(
        page.items.length,
        expected,
        `Expected ${expected} items, got ${page.items.length}`
      );
      return this;
    },
    hasTotalCount(expected: number) {
      assert.ok(page);
      assert.strictEqual(
        page.totalCount,
        expected,
        `Expected totalCount to be ${expected}, got ${page.totalCount}`
      );
      return this;
    },
    hasTotalPages(expected: number) {
      assert.ok(page);
      assert.strictEqual(
        page.totalPages,
        expected,
        `Expected totalPages to be ${expected}, got ${page.totalPages}`
      );
      return this;
    },
    hasEmptyResult() {
      return this.hasItemsCount(0).hasTotalCount(0).hasTotalPages(0);
    },
  };
};

export const assertStrictEqualProblemDocument = (
  actual: ProblemDocument,
  expected: ProblemDocument
): void => {
  assert.strictEqual(actual.status, expected.status);
  assert.strictEqual(actual.detail, expected.detail);
  if ('errors' in actual && 'errors' in expected) {
    assert.deepStrictEqual(actual['errors'], expected['errors']);
  }
};
