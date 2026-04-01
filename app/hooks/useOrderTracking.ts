"use client";

import type { Order } from "../types";
import { api } from "../lib/api";

export function useOrderTracking() {
  // ─── Fetch helpers ──────────────────────────────────────────────────────────

  async function loadActiveOrders(): Promise<Order[]> {
    try {
      const data = await api.get<{ orders: Record<string, unknown>[] }>("/api/orders");
      return (data.orders ?? []).map(mapOrder);
    } catch {
      return [];
    }
  }

  async function loadCompletedOrders(limit = 50): Promise<Order[]> {
    try {
      const data = await api.get<{ orders: Record<string, unknown>[] }>("/api/orders/history");
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
    const data = await api.post<{ order: Record<string, unknown> }>("/api/orders", payload);
    return mapOrder(data.order);
  }

  async function updateOrderStatusApi(id: string, status: Order["status"]): Promise<Order> {
    const data = await api.patch<{ order: Record<string, unknown> }>(`/api/orders/${id}`, { status });
    return mapOrder(data.order);
  }

  // ─── Mapper: API response → frontend Order ──────────────────────────────────

  function mapOrder(doc: Record<string, unknown>): Order {
    const rawItems = typeof doc.items === "string"
      ? (() => { try { return JSON.parse(doc.items); } catch { return []; } })()
      : doc.items;
    const items = Array.isArray(rawItems) ? rawItems : [];
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
