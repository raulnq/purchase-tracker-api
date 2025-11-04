import { faker } from '@faker-js/faker';
import { type AddProduct } from '@/features/products/addProduct.js';
import { type Product } from '@/db/schema/products.js';
import { ProblemDocument } from 'http-problem-details';
import { invokeListQueryApi, invokeMutationApi } from '../utils.js';
import type { ListProducts } from '@/features/products/listProducts.js';
import type { Page } from '@/util/pagination.js';

export const randomProduct = (options?: Partial<AddProduct>): AddProduct => {
  return {
    name: faker.commerce.productName(),
    code: faker.string.numeric(10),
    ...options,
  };
};

export const apple = (): AddProduct => {
  return {
    name: `apple ${faker.string.uuid()}`,
    code: faker.string.numeric(10),
  };
};

export const rice = (): AddProduct => {
  return {
    name: `rice ${faker.string.uuid()}`,
    code: faker.string.numeric(10),
  };
};

export const addProduct = async (
  input: AddProduct,
  problemDocument: ProblemDocument | undefined = undefined
): Promise<[Product?, ProblemDocument?]> => {
  return invokeMutationApi<AddProduct, Product>({
    method: 'POST',
    input,
    endpoint: '/api/products',
    problemDocument,
    successStatus: 201,
  });
};

export const listProducts = async (
  input: ListProducts,
  problemDocument: ProblemDocument | undefined = undefined
): Promise<[Page<Product> | undefined, ProblemDocument | undefined]> => {
  return invokeListQueryApi<ListProducts, Product>({
    input,
    endpoint: '/api/products',
    problemDocument,
  });
};
