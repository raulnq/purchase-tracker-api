import { faker } from '@faker-js/faker';
import type {
  AddPurchase,
  AddPurchaseItem,
  AddPurchaseResponse,
} from '@/features/purchases/addPurchase.js';
import { v7 } from 'uuid';
import { ProblemDocument } from 'http-problem-details';
import { invokeMutationApi } from '../utils.js';

export const randomPurchase = (options?: Partial<AddPurchase>): AddPurchase => {
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
    ...options,
  };
};

export const addPurchase = async (
  input: AddPurchase,
  problemDocument: ProblemDocument | undefined = undefined
): Promise<[AddPurchaseResponse?, ProblemDocument?]> => {
  return invokeMutationApi<AddPurchase, AddPurchaseResponse>({
    method: 'POST',
    input,
    endpoint: '/api/purchases',
    problemDocument,
    successStatus: 201,
  });
};
