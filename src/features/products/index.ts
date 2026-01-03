import { Hono } from 'hono';
import { listRoute } from './list-products.js';
import { addRoute } from './add-product.js';
import { getRoute } from './get-product.js';
import { editRoute } from './edit-product.js';
import { assignCategoryRoute } from './assign-category.js';
import { removeCategoryRoute } from './remove-category.js';
import { purchaseHistoryRoute } from './get-product-purchase-history.js';

export const productRoute = new Hono()
  .basePath('/products')
  .route('/', listRoute)
  .route('/', addRoute)
  .route('/', getRoute)
  .route('/', editRoute)
  .route('/', assignCategoryRoute)
  .route('/', removeCategoryRoute)
  .route('/', purchaseHistoryRoute);
