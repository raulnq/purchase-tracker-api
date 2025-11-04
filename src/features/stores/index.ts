import { Hono } from 'hono';
import { listRoute } from './listStores.js';
import { addRoute } from './addStore.js';
import { findRoute } from './findStore.js';
import { editRoute } from './editStore.js';

export const storeRoute = new Hono();

storeRoute
  .route('/', listRoute)
  .route('/', addRoute)
  .route('/', findRoute)
  .route('/', editRoute);
