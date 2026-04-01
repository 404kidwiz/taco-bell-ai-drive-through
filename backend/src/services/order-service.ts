/**
 * Order Service
 */

import { db } from '../db/index.js';
import { orders, restaurants } from '../db/schema.js';
import { eq, desc, and } from 'drizzle-orm';
import type {
  Order,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  OrderStatus,
  RestaurantConfig,
} from '../types/index.js';
import { NotFoundError } from '../types/index.js';

/**
 * Create a new order
 */
export async function createOrder(request: CreateOrderRequest): Promise<Order> {
  // Validate restaurant exists
  const restaurant = await getRestaurant(request.restaurantId);
  if (!restaurant) {
    throw new NotFoundError('Restaurant');
  }

  // Calculate totals
  const subtotal = request.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * restaurant.config.taxRate);
  const total = subtotal + tax;

  const id = generateOrderId();

  const [newOrder] = await db
    .insert(orders)
    .values({
      id,
      restaurantId: request.restaurantId,
      items: request.items,
      subtotal,
      tax,
      total,
      customer: request.customer || {},
      orderType: request.orderType || 'pickup',
      status: 'received',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return newOrder as Order;
}

/**
 * Get order by ID
 */
export async function getOrder(id: string): Promise<Order | null> {
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  return (order as Order) || null;
}

/**
 * List all orders (with optional filters)
 */
export async function listOrders(filters?: {
  restaurantId?: string;
  status?: OrderStatus;
  limit?: number;
  offset?: number;
}): Promise<Order[]> {
  const conditions = [];

  if (filters?.restaurantId) {
    conditions.push(eq(orders.restaurantId, filters.restaurantId));
  }

  if (filters?.status) {
    conditions.push(eq(orders.status, filters.status));
  }

  const query = db.select().from(orders)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(orders.createdAt))
    .limit(filters?.limit || 100);

  return (await query) as Order[];
}

/**
 * Get recent orders
 */
export async function getRecentOrders(limit: number = 10): Promise<Order[]> {
  return (await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(limit)) as Order[];
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  id: string,
  request: UpdateOrderStatusRequest
): Promise<Order | null> {
  const [updated] = await db
    .update(orders)
    .set({
      status: request.status,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, id))
    .returning();

  return (updated as Order) || null;
}

/**
 * Get restaurant config
 */
export async function getRestaurant(id: string): Promise<{ id: string; name: string; config: RestaurantConfig } | null> {
  const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, id));
  return (restaurant as { id: string; name: string; config: RestaurantConfig }) || null;
}

/**
 * List all restaurants
 */
export async function listRestaurants(): Promise<{ id: string; name: string; config: RestaurantConfig }[]> {
  return (await db.select().from(restaurants)) as {
    id: string;
    name: string;
    config: RestaurantConfig;
  }[];
}

/**
 * Generate order ID
 */
function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `ord_${timestamp}_${random}`;
}
