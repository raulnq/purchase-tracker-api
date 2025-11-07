import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AddProductTool } from '@/features/products/addProduct.js';
import { AddProductsBatchTool } from '@/features/products/addProductsBatch.js';
import { ListProductsTool } from '@/features/products/listProducts.js';
import { AddPurchaseTool } from '@/features/purchases/addPurchase.js';
import { AddStoreTool } from '@/features/stores/addStore.js';
import { ListStoresTool } from '@/features/stores/listStores.js';

export const server = new McpServer({
  name: 'purchase-tracker-api',
  version: '1.0.0',
});

AddProductTool(server);
AddProductsBatchTool(server);
ListProductsTool(server);
AddPurchaseTool(server);
AddStoreTool(server);
ListStoresTool(server);
