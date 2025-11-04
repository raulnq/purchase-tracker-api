import { serve } from '@hono/node-server';
import { ENV } from '@/env.js';
import { app } from './app.js';

process.on('uncaughtException', err => {
  console.error(err.name, err.message);
  process.exit(1);
});

const server = serve(
  {
    fetch: app.fetch,
    port: ENV.PORT,
  },
  info => {
    console.log(
      `Server(${ENV.NODE_ENV}) is running on http://localhost:${info.port}`
    );
  }
);

process.on('unhandledRejection', (err: Error) => {
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
