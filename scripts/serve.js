import { serve } from '@hono/node-server';

const { app } = await import('../built/index.js');

// eslint-disable-next-line no-console
console.log('Server is listening on port 3000');

serve(app);
