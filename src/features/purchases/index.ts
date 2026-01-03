import { Hono } from 'hono';
import { addRoute } from './add-purchase.js';
import { addWithProductsRoute } from './add-purchase-with-products.js';
import { listRoute } from './list-purchases.js';
import { getRoute } from './get-purchase.js';

export const purchaseRoute = new Hono()
  .basePath('/purchases')
  .route('/', listRoute)
  .route('/', addRoute)
  .route('/', addWithProductsRoute)
  .route('/', getRoute);
