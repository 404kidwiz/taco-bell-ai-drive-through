/**
 * Analytics Routes
 */

import { Hono } from 'hono';
import { db } from '../db/index.js';
import { orders } from '../db/schema.js';
import { eq, gte, lte, and, sql, desc } from 'drizzle-orm';

const analyticsRouter = new Hono();

/**
 * Calculate analytics metrics with pagination to avoid OOM
 */
async function calculateAnalytics(filters?: {
  restaurantId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}) {
  const conditions = [];

  if (filters?.restaurantId) {
    conditions.push(eq(orders.restaurantId, filters.restaurantId));
  }

  if (filters?.startDate) {
    conditions.push(gte(orders.createdAt, new Date(filters.startDate)));
  }

  if (filters?.endDate) {
    conditions.push(lte(orders.createdAt, new Date(filters.endDate)));
  }

  // Use SQL aggregation instead of loading all records into memory
  const countAndSum = conditions.length > 0
    ? await db.select({
        totalOrders: sql<number>`count(*)::int`,
        totalRevenue: sql<number>`coalesce(sum(${orders.total}), 0)`,
      }).from(orders).where(and(...conditions))
    : await db.select({
        totalOrders: sql<number>`count(*)::int`,
        totalRevenue: sql<number>`coalesce(sum(${orders.total}), 0)`,
      }).from(orders);

  const { totalOrders, totalRevenue } = countAndSum[0];
  const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Orders by type — use SQL GROUP BY instead of loading all records
  const byType = await db.select({
    orderType: orders.orderType,
    count: sql<number>`count(*)::int`,
  }).from(orders).where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(orders.orderType);

  const ordersByType: Record<string, number> = { pickup: 0, delivery: 0, 'dine-in': 0 };
  for (const row of byType) {
    if (row.orderType && row.orderType in ordersByType) {
      ordersByType[row.orderType] = row.count;
    }
  }

  // Orders by status
  const byStatus = await db.select({
    status: orders.status,
    count: sql<number>`count(*)::int`,
  }).from(orders).where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(orders.status);

  const ordersByStatus: Record<string, number> = {
    received: 0, confirmed: 0, preparing: 0, ready: 0, completed: 0, cancelled: 0,
  };
  for (const row of byStatus) {
    if (row.status && row.status in ordersByStatus) {
      ordersByStatus[row.status] = row.count;
    }
  }

  // For popular items and peak hours, we need the items data — use pagination
  const limit = Math.min(filters?.limit || 500, 1000);
  const offset = filters?.offset || 0;

  const paginatedOrders = conditions.length > 0
    ? await db.select({ items: orders.items, createdAt: orders.createdAt })
        .from(orders).where(and(...conditions)).orderBy(desc(orders.createdAt)).limit(limit).offset(offset)
    : await db.select({ items: orders.items, createdAt: orders.createdAt })
        .from(orders).orderBy(desc(orders.createdAt)).limit(limit).offset(offset);

  // Popular items
  const itemCounts = new Map<string, { quantity: number; revenue: number }>();
  paginatedOrders.forEach(order => {
    order.items.forEach(item => {
      const existing = itemCounts.get(item.name) || { quantity: 0, revenue: 0 };
      itemCounts.set(item.name, {
        quantity: existing.quantity + item.quantity,
        revenue: existing.revenue + (item.price * item.quantity),
      });
    });
  });

  const popularItems = Array.from(itemCounts.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  // Peak hours
  const hourCounts = new Map<number, number>();
  paginatedOrders.forEach(order => {
    const hour = order.createdAt.getHours();
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
  });

  const peakHours = Array.from(hourCounts.entries())
    .map(([hour, orders]) => ({ hour, orders }))
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 10);

  return {
    totalOrders,
    totalRevenue,
    averageOrderValue,
    ordersByType,
    ordersByStatus,
    popularItems,
    peakHours,
    pagination: { limit, offset },
  };
}

// GET /api/analytics - Get analytics metrics
analyticsRouter.get('/analytics', async (c) => {
  try {
    const restaurantId = c.req.query('restaurantId');
    const startDate = c.req.query('startDate');
    const endDate = c.req.query('endDate');
    const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!) : 500;
    const offset = c.req.query('offset') ? parseInt(c.req.query('offset')!) : 0;

    const metrics = await calculateAnalytics({
      restaurantId,
      startDate,
      endDate,
      limit,
      offset,
    });

    return c.json(metrics);
  } catch (error: any) {
    return c.json(
      {
        error: error.message || 'Internal server error',
      },
      500
    );
  }
});

// GET /api/analytics/revenue - Get revenue analytics
analyticsRouter.get('/analytics/revenue', async (c) => {
  try {
    const restaurantId = c.req.query('restaurantId');
    const startDate = c.req.query('startDate');
    const endDate = c.req.query('endDate');

    const conditions = [];

    if (restaurantId) {
      conditions.push(eq(orders.restaurantId, restaurantId));
    }

    if (startDate) {
      conditions.push(gte(orders.createdAt, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(orders.createdAt, new Date(endDate)));
    }

    let result;
    if (conditions.length > 0) {
      [result] = await db.select({ total: sql<number>`sum(${orders.total})` }).from(orders).where(and(...conditions));
    } else {
      [result] = await db.select({ total: sql<number>`sum(${orders.total})` }).from(orders);
    }

    return c.json({
      totalRevenue: result?.total || 0,
    });
  } catch (error: any) {
    return c.json(
      {
        error: error.message || 'Internal server error',
      },
      500
    );
  }
});

export default analyticsRouter;
