import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AddPurchaseWithProductsTool } from '@/features/purchases/add-purchase-with-products.js';
import { AddStoreTool } from '@/features/stores/add-store.js';
import { ListStoresTool } from '@/features/stores/list-stores.js';

export const server = new McpServer({
  name: 'purchase-tracker-api',
  version: '1.0.0',
});

AddPurchaseWithProductsTool(server);
AddStoreTool(server);
ListStoresTool(server);
