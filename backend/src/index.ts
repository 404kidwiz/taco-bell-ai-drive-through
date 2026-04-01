/**
 * OrderFlow AI - Hono Application Entry Point
 * TypeScript Backend (Phase 2 Migration)
 */

import 'dotenv/config';

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';

// Middleware
import { securityHeaders } from './middleware/security.js';
import { rateLimit } from './middleware/rate-limit.js';
import { twilioAuth } from './middleware/twilio-auth.js';

// Routes
import healthRouter from './routes/health.js';
import ordersRouter from './routes/orders.js';
import restaurantRouter from './routes/restaurant.js';
import voiceRouter from './routes/voice.js';
import analyticsRouter from './routes/analytics.js';
import webhooksRouter from './routes/webhooks.js';

// Initialize Hono app
const app = new Hono();

// Allowed CORS origins
const allowedOrigins = [
  'https://orderflow-ai.pages.dev',
  'http://localhost:3000',
  'http://localhost:3001',
];

// Global middleware — order matters
app.use('*', logger());
app.use('*', securityHeaders);
app.use('*', cors({
  origin: allowedOrigins,
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting on all API routes
app.use('/api/*', rateLimit({ limit: 100, windowMs: 60_000 }));

// Twilio signature validation on voice webhooks
app.use('/api/voice/*', twilioAuth);

// Mount routes
app.route('/', healthRouter);
app.route('/api', ordersRouter);
app.route('/api', restaurantRouter);
app.route('/api', voiceRouter);
app.route('/api', analyticsRouter);
app.route('/api', webhooksRouter);

// Root endpoint
app.get('/', (c) => {
  return c.json({
    name: 'OrderFlow AI Backend',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      orders: '/api/orders',
      restaurant: '/api/restaurant/config',
      voice: '/api/voice/*',
      analytics: '/api/analytics',
      webhooks: '/api/webhooks/kds',
    },
  });
});

// 404 handler
app.notFound((c) => {
  return c.json({
    error: 'Not found',
    path: c.req.path,
  }, 404 as never);
});

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({
    error: 'Internal server error',
    message: err.message,
  }, 500 as never);
});

// Start server
const port = parseInt(process.env.PORT || '3001');

console.log(`🚀 OrderFlow AI TypeScript Backend`);
console.log(`📡 Server starting on port ${port}`);
console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);

serve({
  fetch: app.fetch,
  port,
});

console.log(`✅ Server is running on http://localhost:${port}`);

export default app;
