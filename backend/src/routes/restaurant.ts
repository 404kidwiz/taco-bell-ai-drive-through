/**
 * Restaurant Routes
 */

import { Hono } from 'hono';
import { getRestaurant, listRestaurants } from '../services/order-service.js';
import { NotFoundError, AppError } from '../types/index.js';

const restaurantRouter = new Hono();

// Allowlist of valid config identifiers
const VALID_CONFIGS = new Set(['sample', 'demo', 'production']);

// Error handler
function handleAppError(error: unknown) {
  if (error instanceof AppError) {
    return {
      error: error.message,
      code: error.code,
    };
  }
  return {
    error: 'Internal server error',
  };
}

// GET /api/restaurant/config - Get restaurant config
restaurantRouter.get('/restaurant/config', async (c) => {
  try {
    const restaurantId = c.req.query('restaurantId') || process.env.RESTAURANT_ID || 'sample';

    if (!VALID_CONFIGS.has(restaurantId)) {
      return c.json({ error: 'Invalid config parameter' }, 400 as any);
    }

    const restaurant = await getRestaurant(restaurantId);

    if (!restaurant) {
      throw new NotFoundError('Restaurant');
    }

    return c.json({
      id: restaurant.id,
      name: restaurant.name,
      config: restaurant.config,
    });
  } catch (error) {
    const errorResponse = handleAppError(error);
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    return c.json(errorResponse, statusCode as any);
  }
});

// GET /api/restaurants - List all restaurants
restaurantRouter.get('/restaurants', async (c) => {
  try {
    const restaurants = await listRestaurants();
    return c.json(restaurants);
  } catch (error) {
    const errorResponse = handleAppError(error);
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    return c.json(errorResponse, statusCode as any);
  }
});

export default restaurantRouter;
