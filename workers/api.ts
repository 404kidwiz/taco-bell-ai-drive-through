/**
 * Taco Bell AI Drive-Through — Cloudflare Worker API
 * Handles: order CRUD, SSE real-time stream, analytics, SMS
 */

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq, desc, inArray, sql } from "drizzle-orm";
import { orders, OrderRow } from "./schema";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CreateOrderBody {
  items: CartItem[];
  total: number;
  specialInstructions?: string;
  customerPhone?: string;
  transcript?: string; // Voice transcript for AI accuracy tracking
  restaurant?: "taco-bell" | "orderflow-pizza"; // Which restaurant the order is for
}

interface UpdateStatusBody {
  status: "pending" | "in-progress" | "completed";
}

interface Env {
  TURSO_DATABASE_URL?: string;
  TURSO_AUTH_TOKEN?: string;
}

// ─── SSE Client Store (in-memory per Worker instance) ────────────────────────
const sseClients = new Set<ReadableStreamDefaultController>();

function broadcastSSE(event: { type: string; data: unknown }) {
  const payload = `event: message\ndata: ${JSON.stringify(event)}\n\n`;
  for (const controller of sseClients) {
    try {
      controller.enqueue(new TextEncoder().encode(payload));
    } catch {
      sseClients.delete(controller);
    }
  }
}

// ─── DB Client ────────────────────────────────────────────────────────────────
function getDb(env: Env) {
  const url = env.TURSO_DATABASE_URL || process.env.TURSO_DATABASE_URL;
  const token = env.TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error("TURSO_DATABASE_URL not configured");
  }

  const libsql = createClient({ url, authToken: token });
  return drizzle(libsql);
}

// ─── SMS (CallMeBot — free, no account) ──────────────────────────────────────
async function sendSMS(phone: string, orderNumber: number, total: number, restaurant?: string) {
  if (!phone) return;
  const brand = restaurant === "orderflow-pizza" ? "🍕 OrderFlow Pizza" : "🌮 Taco Bell";
  const msg = `Your ${brand} order #${orderNumber} ($${total.toFixed(2)}) is confirmed! We'll have it ready soon.`;
  try {
    await fetch(
      `https://api.callmebot.com/sms.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(msg)}&user=anonymous`
    );
  } catch (err) {
    console.error("SMS send failed:", err);
  }
}

// ─── CORS Headers ─────────────────────────────────────────────────────────────
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

function errorJson(message: string, status = 400) {
  return json({ success: false, error: message }, status);
}

// ─── Route Handler ─────────────────────────────────────────────────────────────
async function handleRoute(path: string, method: string, body: unknown, env: Env, url: URL) {
  const db = getDb(env);

  // POST /api/orders — create order
  if (path === "/api/orders" && method === "POST") {
    const { items, total, specialInstructions, customerPhone, transcript, restaurant } = body as CreateOrderBody;
    if (!items?.length || typeof total !== "number") {
      return errorJson("items[] and total are required");
    }

    const id = crypto.randomUUID();
    const now = Date.now();

    // Get next sequential order number (simple counter via a lookup query)
    const allOrders = await db.select({ orderNumber: orders.orderNumber })
      .from(orders)
      .orderBy(desc(orders.orderNumber))
      .limit(1);
    const nextOrderNumber = (allOrders[0]?.orderNumber ?? 100) + 1;

    const newOrder: OrderRow = {
      id,
      orderNumber: nextOrderNumber,
      items: JSON.stringify(items),
      total,
      specialInstructions: specialInstructions ?? null,
      customerPhone: customerPhone ?? null,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(orders).values(newOrder);

    // Store transcript if provided (separate table or append to order)
    if (transcript) {
      console.log(`[Transcript] Order #${nextOrderNumber}: ${transcript}`);
    }

    // Send SMS in background (don't await)
    if (customerPhone) {
      sendSMS(customerPhone, nextOrderNumber, total, restaurant).catch(() => {});
    }

    // Smart AI upselling — suggest complementary items
    const upsellSuggestions = getUpsellSuggestions(items);

    // Broadcast to SSE clients with upsell data
    broadcastSSE({
      type: "new",
      data: {
        ...newOrder,
        items: JSON.parse(newOrder.items),
        upsell: upsellSuggestions,
        transcript: transcript ?? null,
      },
    });

    return json({
      success: true,
      order: { ...newOrder, items },
      upsell: upsellSuggestions,
      eta: calculateETA(1), // Default ETA for new order
    });
  }

  // GET /api/orders — list active orders
  if (path === "/api/orders" && method === "GET") {
    const activeOrders = await db
      .select()
      .from(orders)
      .where(inArray(orders.status, ["pending", "in-progress"]))
      .orderBy(orders.createdAt);

    const result = activeOrders.map((o) => ({
      ...o,
      items: JSON.parse(o.items as string),
    }));

    return json({ orders: result });
  }

  // GET /api/orders/history — completed orders (must be before :id catch-all)
  if (path === "/api/orders/history" && method === "GET") {
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);

    const completedOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.status, "completed"))
      .orderBy(desc(orders.updatedAt))
      .limit(Math.min(limit, 100));

    const result = completedOrders.map((o) => ({
      ...o,
      items: JSON.parse(o.items as string),
    }));

    return json({ orders: result });
  }

  // GET /api/orders/stream — SSE real-time (must be before :id catch-all)
  if (path === "/api/orders/stream" && method === "GET") {
    const stream = new ReadableStream({
      start(controller) {
        sseClients.add(controller);

        // Send initial connection ping
        controller.enqueue(new TextEncoder().encode(`: connected\n\n`));

        // Keep-alive ping every 30s
        const interval = setInterval(() => {
          try {
            controller.enqueue(new TextEncoder().encode(`: ping\n\n`));
          } catch {
            clearInterval(interval);
            sseClients.delete(controller);
          }
        }, 30000);

        // Clean up on close
        return () => {
          clearInterval(interval);
          sseClients.delete(controller);
        };
      },
      cancel() {
        // Client disconnected — handled via error catch in broadcastSSE
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        ...CORS,
      },
    });
  }

  // GET /api/orders/:id — get single order (must be after /history and /stream)
  const getOrderMatch = path.match(/^\/api\/orders\/([^/]+)$/);
  if (getOrderMatch && method === "GET") {
    const orderId = getOrderMatch[1];
    const orderRows = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!orderRows.length) {
      return errorJson("Order not found", 404);
    }

    const order = orderRows[0];
    return json({
      order: {
        ...order,
        items: JSON.parse(order.items as string),
      },
    });
  }

  // PATCH /api/orders/[id] — update order status
  const patchMatch = path.match(/^\/api\/orders\/(.+)$/);
  if (patchMatch && method === "PATCH") {
    const orderId = patchMatch[1];
    const { status } = body as UpdateStatusBody;
    if (!["pending", "in-progress", "completed"].includes(status)) {
      return errorJson("Invalid status");
    }

    const now = Date.now();
    const updated = await db
      .update(orders)
      .set({ status, updatedAt: now })
      .where(eq(orders.id, orderId))
      .returning();

    if (!updated.length) {
      return errorJson("Order not found", 404);
    }

    const order = updated[0];
    broadcastSSE({
      type: "update",
      data: { ...order, items: JSON.parse(order.items as string) },
    });

    return json({ success: true, order: { ...order, items: JSON.parse(order.items as string) } });
  }

  // GET /api/orders/:id/eta — real-time ETA prediction
  const etaMatch = path.match(/^\/api\/orders\/([^/]+)\/eta$/);
  if (etaMatch && method === "GET") {
    const orderId = etaMatch[1];
    const orderRows = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!orderRows.length) {
      return errorJson("Order not found", 404);
    }

    const order = orderRows[0];
    const activeCount = await db
      .select()
      .from(orders)
      .where(inArray(orders.status, ["pending", "in-progress"]));

    const eta = calculateETA(activeCount.length, order.status);
    return json({ orderId, status: order.status, eta, queuePosition: activeCount.filter(o => o.createdAt <= (order as any).createdAt).length });
  }

  // GET /api/analytics
  if (path === "/api/analytics" && method === "GET") {
    const days = parseInt(url.searchParams.get("days") || "7", 10);
    const since = Date.now() - days * 24 * 60 * 60 * 1000;

    const allOrders = await db
      .select()
      .from(orders)
      .where(sql`${orders.createdAt} >= ${since}`);

    const totalOrders = allOrders.length;
    const totalRevenue = allOrders.reduce((s, o) => s + o.total, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Count by status
    const completedCount = allOrders.filter((o) => o.status === "completed").length;
    const completionRate = totalOrders > 0 ? completedCount / totalOrders : 0;

    // Today's stats
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayOrders = allOrders.filter((o) => o.createdAt >= todayStart.getTime());
    const todaysRevenue = todayOrders.reduce((s, o) => s + o.total, 0);

    // Orders by hour
    const ordersByHour: Record<number, number> = {};
    allOrders.forEach((o) => {
      const h = new Date(o.createdAt).getHours();
      ordersByHour[h] = (ordersByHour[h] || 0) + 1;
    });

    // Top items
    const itemCounts: Record<string, number> = {};
    allOrders.forEach((o) => {
      try {
        const items = JSON.parse(o.items as string) as CartItem[];
        items.forEach((item) => {
          itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
        });
      } catch {}
    });
    const topItems = Object.entries(itemCounts)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    return json({
      orderCount: totalOrders,
      revenue: totalRevenue,
      avgOrderValue,
      completionRate,
      todaysOrderCount: todayOrders.length,
      todaysRevenue,
      ordersByHour,
      topItems,
    });
  }

  return errorJson("Not found", 404);
}

// ─── Smart AI Upselling ────────────────────────────────────────────────────────
function getUpsellSuggestions(items: CartItem[]): CartItem[] {
  const suggestions: CartItem[] = [];
  const itemNames = items.map(i => i.name.toLowerCase());
  const hasDrink = itemNames.some(n => n.includes("blast") || n.includes("pepsi") || n.includes("lemonade") || n.includes("mountain"));
  const hasTaco = itemNames.some(n => n.includes("taco"));
  const hasBurrito = itemNames.some(n => n.includes("burrito"));
  const hasNacho = itemNames.some(n => n.includes("nacho"));
  const hasQuesadilla = itemNames.some(n => n.includes("quesadilla"));

  // If no drink, suggest Baja Blast
  if (!hasDrink) {
    suggestions.push({ id: "baja-blast", name: "Large Baja Blast", price: 2.89, quantity: 1 });
  }

  // If tacos/burritos but no nachos, suggest Nacho Fries
  if ((hasTaco || hasBurrito) && !hasNacho) {
    suggestions.push({ id: "nacho-fries", name: "Nacho Fries", price: 1.99, quantity: 1 });
  }

  // If quesadilla, suggest Cinnamon Twists
  if (hasQuesadilla) {
    suggestions.push({ id: "cinnamon-twists", name: "Cinnamon Twists", price: 1.49, quantity: 1 });
  }

  // If order is under $10, suggest Cheesy Gordita Crunch
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  if (total < 10 && !itemNames.some(n => n.includes("gordita"))) {
    suggestions.push({ id: "gordita-crunch", name: "Cheesy Gordita Crunch", price: 4.89, quantity: 1 });
  }

  return suggestions.slice(0, 2); // Max 2 suggestions
}

// ─── ETA Prediction ────────────────────────────────────────────────────────────
function calculateETA(activeOrders: number, status?: string): string {
  const baseMinutes = 5;
  const loadMultiplier = 1 + (activeOrders * 0.2);
  const eta = Math.round(baseMinutes * loadMultiplier);

  // Completed orders are ready now
  if (status === "completed") return "Ready";

  const min = Math.max(2, eta - 2);
  const max = eta;
  return `${min}-${max} MINS`;
}

// ─── Worker Entry Point ────────────────────────────────────────────────────────
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Only handle /api/* routes
    if (!path.startsWith("/api/")) {
      return new Response("Not found", { status: 404 });
    }

    let body: unknown = null;
    if (["POST", "PATCH"].includes(method)) {
      try {
        body = await request.json();
      } catch {
        return errorJson("Invalid JSON body", 400);
      }
    }

    try {
      return await handleRoute(path, method, body, env, url);
    } catch (err) {
      console.error("Worker error:", err);
      return errorJson("Internal server error", 500);
    }
  },
};
