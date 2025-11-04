import { StreamableHTTPTransport } from '@hono/mcp';
import { server } from './server.js';
import { Hono } from 'hono';

export const mcpRoute = new Hono();

mcpRoute.all('/', async c => {
  const transport = new StreamableHTTPTransport();

  await server.connect(transport);
  return await transport.handleRequest(c);
});
