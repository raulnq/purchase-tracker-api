import { after } from 'node:test';
import { client } from '@/database/client.js';

after(async () => {
  await client.$client.end();
});
