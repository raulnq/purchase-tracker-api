import { test, describe } from 'node:test';
import { addStore, wallmart } from './storeDsl.js';
import { emptyText, bigText } from '../utils.js';
import { ProblemDocument } from 'http-problem-details';

describe('Add Store Endpoint', () => {
  describe('POST /api/stores', () => {
    test('should create a new store with valid data', async () => {
      await addStore(wallmart());
    });

    test('should reject empty store name', async () => {
      await addStore(
        { name: emptyText },
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

    test('should reject big store name', async () => {
      await addStore(
        { name: bigText() },
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
