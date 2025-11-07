import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AddPurchaseWithProductsTool } from '@/features/purchases/addPurchaseWithProducts.js';
import { AddStoreTool } from '@/features/stores/addStore.js';
import { ListStoresTool } from '@/features/stores/listStores.js';

export const server = new McpServer({
  name: 'purchase-tracker-api',
  version: '1.0.0',
});

AddPurchaseWithProductsTool(server);
AddStoreTool(server);
ListStoresTool(server);
