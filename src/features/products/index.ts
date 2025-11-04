import { Hono } from 'hono';
import { listRoute } from './listProducts.js';
import { addRoute } from './addProduct.js';
import { findRoute } from './findProduct.js';
import { editRoute } from './editProduct.js';
import { assignCategoryRoute } from './assignCategory.js';
import { removeCategoryRoute } from './removeCategory.js';

export const productRoute = new Hono();

productRoute
  .route('/', listRoute)
  .route('/', addRoute)
  .route('/', findRoute)
  .route('/', editRoute)
  .route('/', assignCategoryRoute)
  .route('/', removeCategoryRoute);
