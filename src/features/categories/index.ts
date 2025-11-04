import { Hono } from 'hono';
import { listRoute } from './listCategories.js';
import { addRoute } from './addCategory.js';
import { findRoute } from './findCategory.js';
import { editRoute } from './editCategory.js';

export const categoryRoute = new Hono();

categoryRoute
  .route('/', listRoute)
  .route('/', addRoute)
  .route('/', findRoute)
  .route('/', editRoute);
