/**
 * Webhooks Routes - KDS and other external webhooks
 */

import { Hono } from 'hono';
import { getOrder } from '../services/order-service.js';
import { NotFoundError } from '../types/index.js';

const webhooksRouter = new Hono();

// Validation interface for KDS webhook
interface KDSWebhookData {
  orderId: string;
  restaurantId: string;
  status: 'received' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  timestamp?: string;
}

// Helper function to validate KDS webhook data
function validateKDSWebhookData(data: any): data is KDSWebhookData {
  if (typeof data !== 'object' || data === null) return false;
  if (typeof data.orderId !== 'string' || data.orderId.trim() === '') return false;
  if (typeof data.restaurantId !== 'string' || data.restaurantId.trim() === '') return false;

  const validStatuses = ['received', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
  if (typeof data.status !== 'string' || !validStatuses.includes(data.status)) return false;

  return true;
}

// POST /api/webhooks/kds - KDS webhook
webhooksRouter.post('/webhooks/kds', async (c) => {
  try {
    const payload = await c.req.json();

    // Validate data
    if (!validateKDSWebhookData(payload)) {
      return c.json(
        {
          error: 'Validation error',
          details: 'Invalid webhook data format',
        },
        400
      );
    }

    // Verify order exists
    const order = await getOrder(payload.orderId);
    if (!order) {
      throw new NotFoundError('Order');
    }

    // Process KDS webhook
    // In a real implementation, this would:
    // 1. Update the order status in the database
    // 2. Notify connected clients via WebSocket
    // 3. Send notifications to restaurant staff
    // 4. Log the event for audit purposes

    console.log('KDS webhook received:', payload);

    // For now, just acknowledge receipt
    return c.json({
      success: true,
      message: 'KDS webhook processed successfully',
      orderId: payload.orderId,
      status: payload.status,
    });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      return c.json(
        {
          error: error.message,
          code: error.code,
        },
        404
      );
    }

    return c.json(
      {
        error: error.message || 'Internal server error',
      },
      500
    );
  }
});

export default webhooksRouter;
