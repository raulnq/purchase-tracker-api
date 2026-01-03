import { Hono } from 'hono';
import { listRoute } from './list-categories.js';
import { addRoute } from './add-category.js';
import { getRoute } from './get-category.js';
import { editRoute } from './edit-category.js';

export const categoryRoute = new Hono()
  .basePath('/categories')
  .route('/', listRoute)
  .route('/', addRoute)
  .route('/', getRoute)
  .route('/', editRoute);
