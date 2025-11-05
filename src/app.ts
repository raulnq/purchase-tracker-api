import { Hono } from 'hono';
import { storeRoute } from './features/stores/index.js';
import { categoryRoute } from './features/categories/index.js';
import { productRoute } from './features/products/index.js';
import { purchaseRoute } from './features/purchases/index.js';
import { onError } from '@/middlewares/onError.js';
import { onNotFound } from './middlewares/onNotFound.js';
import { logger } from 'hono/logger';
import { mcpRoute } from './mcp/index.js';
import { bearerAuth } from 'hono/bearer-auth';
import { ENV } from './env.js';

export const app = new Hono({ strict: false });
app.use(logger());
if (ENV.TOKEN) {
  app.use('/api/*', bearerAuth({ token: ENV.TOKEN }));
  //app.use('/mcp/*', bearerAuth({ token: ENV.TOKEN }));
}
app.route('/mcp', mcpRoute);
app.route('/api/stores', storeRoute);
app.route('/api/categories', categoryRoute);
app.route('/api/products', productRoute);
app.route('/api/purchases', purchaseRoute);
app.get('/live', c =>
  c.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: Date.now(),
  })
);
app.notFound(onNotFound);
app.onError(onError);

export type App = typeof app;
