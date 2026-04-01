/**
 * Shared Redis Client
 * Single connection instance used across all services.
 */

import { Redis } from 'ioredis';

export const redis = new Redis(process.env.REDIS_URL!);

export default redis;
