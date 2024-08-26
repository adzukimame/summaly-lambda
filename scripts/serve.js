import { serve } from '@hono/node-server';
import { app } from '../built/index.js';

/* eslint-disable no-console */

console.log('Server is listening on port 3000');

serve(app);
