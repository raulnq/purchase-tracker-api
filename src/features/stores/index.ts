import { Hono } from 'hono';
import { listRoute } from './list-stores.js';
import { addRoute } from './add-store.js';
import { getRoute } from './get-store.js';
import { editRoute } from './edit-store.js';

export const storeRoute = new Hono()
  .basePath('/stores')
  .route('/', listRoute)
  .route('/', addRoute)
  .route('/', getRoute)
  .route('/', editRoute);
