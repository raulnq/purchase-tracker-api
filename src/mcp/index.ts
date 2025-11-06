import { StreamableHTTPTransport } from '@hono/mcp';
import { server } from './server.js';
import { Hono } from 'hono';

export const mcpRoute = new Hono();

mcpRoute.all('/', async c => {
  console.log(`[MCP] ${c.req.method} ${c.req.url}`);
  console.log('[MCP] Request headers:', c.req.header());
  try {
    const clonedRequest = c.req.raw.clone();
    const requestBody = await clonedRequest.text();
    if (requestBody) {
      console.log('[MCP] Request body:', requestBody);
    }
  } catch (error) {
    console.log('[MCP] Error reading request body:', error);
  }

  const transport = new StreamableHTTPTransport();
  await server.connect(transport);
  return await transport.handleRequest(c);
});
