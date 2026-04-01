/**
 * Rate Limiting Middleware (Redis-backed)
 */

import { MiddlewareHandler } from 'hono';
import { redis } from '../lib/redis.js';

interface RateLimitOptions {
  limit: number;
  windowMs: number;
  identifier?: (c: any) => string;
}

export function rateLimit(options: RateLimitOptions): MiddlewareHandler {
  const { limit, windowMs, identifier } = options;

  return async (c, next): Promise<Response | void> => {
    const key = identifier
      ? `rate-limit:${identifier(c)}`
      : `rate-limit:${c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown'}`;

    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, Math.ceil(windowMs / 1000));
    }

    const remaining = Math.max(0, limit - current);
    c.res.headers.set('X-RateLimit-Limit', limit.toString());
    c.res.headers.set('X-RateLimit-Remaining', remaining.toString());

    if (current > limit) {
      const ttl = await redis.ttl(key);
      c.res.headers.set('Retry-After', ttl.toString());
      return c.json(
        {
          error: 'Rate limit exceeded',
          retryAfter: ttl,
        },
        429 as any
      );
    }

    await next();
  };
}

// Voice-specific rate limiter (by caller phone number)
export function voiceRateLimit(): MiddlewareHandler {
  return rateLimit({
    limit: 10,
    windowMs: 60000, // 1 minute
    identifier: (c) => {
      const form = c.req.raw.body;
      if (form instanceof FormData) {
        return form.get('From') as string || 'unknown';
      }
      return 'unknown';
    },
  });
}
