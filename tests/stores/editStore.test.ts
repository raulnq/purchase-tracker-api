import { test, describe } from 'node:test';
import assert from 'node:assert';
import { addStore, wallmart, editStore } from './storeDsl.js';
import { emptyText, bigText } from '../utils.js';
import { ProblemDocument } from 'http-problem-details';

describe('Edit Store Endpoint', () => {
  describe('PUT /api/stores/:storeId', () => {
    test('should update an existing store with valid data', async () => {
      const [store] = await addStore(wallmart());

      const data = {
        name: 'new name',
        enabled: false,
      };

      const [result] = await editStore(store!.storeId, data);

      assert.strictEqual(result!.name, data.name);
      assert.strictEqual(result!.enabled, data.enabled);
    });

    test('should return error when updating non-existent store', async () => {
      await editStore(
        '019a417c-6e95-78b0-86c6-ebeefffa5db2 ',
        {
          name: 'new name',
          enabled: false,
        },
        new ProblemDocument({
          status: 404,
          detail: 'Store not found',
        })
      );
    });

    test('should reject empty store name in update', async () => {
      const [store] = await addStore(wallmart());

      await editStore(
        store!.storeId,
        {
          name: emptyText,
          enabled: true,
        },
        new ProblemDocument(
          {
            detail: 'The request contains invalid data',
            status: 400,
          },
          {
            errors: [
              {
                field: 'name',
                message: 'String must contain at least 1 character(s)',
              },
            ],
          }
        )
      );
    });

    test('should reject big store name in update', async () => {
      const [store] = await addStore(wallmart());

      await editStore(
        store!.storeId,
        {
          name: bigText(),
          enabled: true,
        },
        new ProblemDocument(
          {
            detail: 'The request contains invalid data',
            status: 400,
          },
          {
            errors: [
              {
                field: 'name',
                message: 'String must contain at most 255 character(s)',
              },
            ],
          }
        )
      );
    });
  });
});
