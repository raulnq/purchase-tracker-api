import { faker } from '@faker-js/faker';
import { type AddStore } from '@/features/stores/addStore.js';
import { type EditStore } from '@/features/stores/editStore.js';
import { type ListStores } from '@/features/stores/listStores.js';
import { type Store } from '@/db/schema/stores.js';
import { ProblemDocument } from 'http-problem-details';
import {
  invokeMutationApi,
  invokeListQueryApi,
  invokeSingleQueryApi,
} from '../utils.js';
import { type Page } from '@/util/pagination.js';

export const randomStore = (options?: Partial<AddStore>): AddStore => {
  return {
    name: faker.company.name(),
    ...options,
  };
};

export const wallmart = (): AddStore => {
  return {
    name: `wallmart ${faker.string.uuid()}`,
  };
};

export const addStore = async (
  input: AddStore,
  problemDocument: ProblemDocument | undefined = undefined
): Promise<[Store | undefined, ProblemDocument | undefined]> => {
  return invokeMutationApi<AddStore, Store>({
    method: 'POST',
    input,
    endpoint: '/api/stores',
    problemDocument,
    successStatus: 201,
  });
};

export const editStore = async (
  storeId: string,
  input: EditStore,
  problemDocument: ProblemDocument | undefined = undefined
): Promise<[Store | undefined, ProblemDocument | undefined]> => {
  return invokeMutationApi<EditStore, Store>({
    method: 'PUT',
    input,
    endpoint: `/api/stores/${storeId}`,
    problemDocument,
    successStatus: 200,
  });
};

export const listStores = async (
  input: ListStores,
  problemDocument: ProblemDocument | undefined = undefined
): Promise<[Page<Store> | undefined, ProblemDocument | undefined]> => {
  return invokeListQueryApi<ListStores, Store>({
    input,
    endpoint: '/api/stores',
    problemDocument,
  });
};

export const findStore = async (
  storeId: string,
  problemDocument: ProblemDocument | undefined = undefined
): Promise<[Store | undefined, ProblemDocument | undefined]> => {
  return invokeSingleQueryApi<Store>({
    endpoint: `/api/stores/${storeId}`,
    problemDocument,
  });
};
