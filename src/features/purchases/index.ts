import { Hono } from 'hono';
import { addRoute } from './addPurchase.js';
import { listRoute } from './listPurchases.js';
import { findRoute } from './findPurchase.js';

export const purchaseRoute = new Hono();

purchaseRoute.route('/', listRoute).route('/', addRoute).route('/', findRoute);
