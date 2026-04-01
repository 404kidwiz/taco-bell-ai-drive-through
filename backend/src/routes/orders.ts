/**
 * Orders Routes
 */

import { Hono } from 'hono';
import {
  createOrder,
  getOrder,
  listOrders,
  getRecentOrders,
  updateOrderStatus,
} from '../services/order-service.js';
import { NotFoundError, AppError } from '../types/index.js';

const ordersRouter = new Hono();

// Validation interfaces
interface CreateOrderData {
  restaurantId: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    category?: string;
    modifiers?: string[];
  }>;
  customer?: {
    name?: string;
    phone?: string;
    address?: string;
    email?: string;
    notes?: string;
  };
  orderType?: 'pickup' | 'delivery' | 'dine-in';
}

interface UpdateOrderStatusData {
  status: 'received' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
}

// Helper function to validate create order data
function validateCreateOrderData(data: any): data is CreateOrderData {
  if (typeof data !== 'object' || data === null) return false;
  if (typeof data.restaurantId !== 'string' || data.restaurantId.trim() === '') return false;
  if (!Array.isArray(data.items)) return false;
  if (!data.items.every((item: any) =>
    typeof item === 'object' &&
    typeof item.name === 'string' &&
    typeof item.quantity === 'number' &&
    typeof item.price === 'number'
  )) return false;
  return true;
}

// Helper function to validate update status data
function validateUpdateOrderStatusData(data: any): data is UpdateOrderStatusData {
  if (typeof data !== 'object' || data === null) return false;
  const validStatuses = ['received', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
  return typeof data.status === 'string' && validStatuses.includes(data.status);
}

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

// POST /api/orders - Create order
ordersRouter.post('/orders', async (c) => {
  try {
    const data = await c.req.json();

    if (!validateCreateOrderData(data)) {
      return c.json(
        {
          error: 'Validation error',
          details: 'Invalid order data format',
        },
        400 as any
      );
    }

    const order = await createOrder(data);
    return c.json(order, 201);
  } catch (error: any) {
    if (error?.errors) {
      // Zod validation error
      return c.json(
        {
          error: 'Validation error',
          details: error.errors,
        },
        400 as any
      );
    }
    const errorResponse = handleAppError(error);
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    return c.json(errorResponse, statusCode as any);
  }
});

// GET /api/orders - List all orders
ordersRouter.get('/orders', async (c) => {
  try {
    const restaurantId = c.req.query('restaurantId');
    const status = c.req.query('status') as any;
    const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!) : undefined;

    const orders = await listOrders({
      restaurantId,
      status,
      limit,
    });

    return c.json(orders);
  } catch (error) {
    const errorResponse = handleAppError(error);
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    return c.json(errorResponse, statusCode as any);
  }
});

// GET /api/orders/recent - Get recent orders
ordersRouter.get('/orders/recent', async (c) => {
  try {
    const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!) : 10;
    const orders = await getRecentOrders(limit);
    return c.json(orders);
  } catch (error) {
    const errorResponse = handleAppError(error);
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    return c.json(errorResponse, statusCode as any);
  }
});

// GET /api/orders/:id - Get order by ID
ordersRouter.get('/orders/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const order = await getOrder(id);

    if (!order) {
      throw new NotFoundError('Order');
    }

    return c.json(order);
  } catch (error) {
    const errorResponse = handleAppError(error);
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    return c.json(errorResponse, statusCode as any);
  }
});

// PATCH /api/orders/:id/status - Update order status
ordersRouter.patch('/orders/:id/status', async (c) => {
  try {
    const id = c.req.param('id');
    const data = await c.req.json();

    if (!validateUpdateOrderStatusData(data)) {
      return c.json(
        {
          error: 'Validation error',
          details: 'Invalid status value',
        },
        400 as any
      );
    }

    const order = await updateOrderStatus(id, data);

    if (!order) {
      throw new NotFoundError('Order');
    }

    return c.json(order);
  } catch (error) {
    const errorResponse = handleAppError(error);
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    return c.json(errorResponse, statusCode as any);
  }
});

export default ordersRouter;
