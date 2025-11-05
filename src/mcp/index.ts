import { StreamableHTTPTransport } from '@hono/mcp';
import { server } from './server.js';
import { Hono } from 'hono';

export const mcpRoute = new Hono();

mcpRoute.all('/', async c => {
  // Log the request method and URL
  console.log(`[MCP] ${c.req.method} ${c.req.url}`);

  // Log request headers
  console.log('[MCP] Request headers:', c.req.header());

  // Log request body if it exists - clone the raw request to avoid consuming the stream
  try {
    const clonedRequest = c.req.raw.clone();
    const requestBody = await clonedRequest.text();
    if (requestBody) {
      console.log('[MCP] Request body:', requestBody);

      // Try to parse and pretty print JSON if possible
      try {
        const parsedBody = JSON.parse(requestBody);
        console.log(
          '[MCP] Parsed request body:',
          JSON.stringify(parsedBody, null, 2)
        );
      } catch {
        // If not JSON, just log the raw body
        console.log('[MCP] Raw request body:', requestBody);
      }
    }
  } catch (error) {
    console.log('[MCP] Error reading request body:', error);
  }

  const transport = new StreamableHTTPTransport();

  await server.connect(transport);
  return await transport.handleRequest(c);
});
