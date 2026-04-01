/**
 * Health Check Route
 */

import { Hono } from 'hono';

const healthRouter = new Hono();

healthRouter.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

export default healthRouter;
