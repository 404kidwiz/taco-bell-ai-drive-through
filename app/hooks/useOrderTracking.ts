"use client";

import type { Order } from "../types";

const API_BASE = "/api";

export function useOrderTracking() {
  // ─── Fetch helpers ──────────────────────────────────────────────────────────

  async function loadActiveOrders(): Promise<Order[]> {
    try {
      const res = await fetch(`${API_BASE}/orders`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.orders ?? []).map(mapOrder);
    } catch {
      return [];
    }
  }

  async function loadCompletedOrders(limit = 50): Promise<Order[]> {
    try {
      const res = await fetch(`${API_BASE}/orders/history`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.orders ?? []).slice(0, limit).map(mapOrder);
    } catch {
      return [];
    }
  }

  async function createOrderApi(payload: {
    items: Array<{ id: string; name: string; price: number; quantity: number }>;
    total: number;
    specialInstructions?: string;
    customerPhone?: string;
  }): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create order");
    const data = await res.json();
    return mapOrder(data.order);
  }

  async function updateOrderStatusApi(id: string, status: Order["status"]): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update order");
    const data = await res.json();
    return mapOrder(data.order);
  }

  // ─── Mapper: API response → frontend Order ──────────────────────────────────

  function mapOrder(doc: Record<string, unknown>): Order {
    const items = typeof doc.items === "string" ? JSON.parse(doc.items) : doc.items;
    return {
      id: doc.id as string,
      orderNumber: doc.orderNumber as number,
      items: (items as Array<{ id: string; name: string; price: number; quantity: number }>).map(
        (item) => ({
          id: item.id,
          name: item.name,
          description: "",
          price: item.price,
          category: "specialties" as const,
          quantity: item.quantity,
        })
      ),
      specialInstructions: (doc.specialInstructions as string) ?? "",
      customerPhone: doc.customerPhone as string | undefined,
      status: doc.status as Order["status"],
      createdAt: new Date(doc.createdAt as number).toISOString(),
      updatedAt: doc.updatedAt as number,
    };
  }

  return {
    createOrder: createOrderApi,
    updateStatus: updateOrderStatusApi,
    loadActiveOrders,
    loadCompletedOrders,
    mapOrder,
  };
}
