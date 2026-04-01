/**
 * Twilio Signature Validation Middleware
 */

import { MiddlewareHandler } from 'hono';
import crypto from 'crypto';

export const twilioAuth: MiddlewareHandler = async (c, next) => {
  const url = c.req.url;
  const signature = c.req.header('X-Twilio-Signature');
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  // Skip validation in dev/test mode if configured
  if (process.env.ORDERFLOW_SKIP_TWILIO_SIGNATURE === '1') {
    return next();
  }

  if (!signature) {
    return c.json({ error: 'Missing X-Twilio-Signature header' }, 401);
  }

  if (!authToken) {
    return c.json({ error: 'Twilio auth token not configured' }, 500);
  }

  // Get raw body for signature validation
  const body = await c.req.text();

  // Build the signature
  const data = url + body;
  const expectedSignature = crypto
    .createHmac('sha1', authToken)
    .update(data)
    .digest('base64');

  if (signature !== expectedSignature) {
    return c.json({ error: 'Invalid Twilio signature' }, 401);
  }

  // Store body in context for later processing
  c.set('rawBody', body);

  await next();
};
