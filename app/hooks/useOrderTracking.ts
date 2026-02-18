"use client";

import { useState, useCallback, useEffect } from "react";

interface OrderStatus {
  id: string;
  status: "received" | "preparing" | "ready" | "completed";
  estimatedTime: number; // minutes
  items: string[];
  total: number;
  timestamp: number;
  updates: OrderUpdate[];
}

interface OrderUpdate {
  status: OrderStatus["status"];
  message: string;
  timestamp: number;
}

export function useOrderTracking() {
  const [activeOrders, setActiveOrders] = useState<OrderStatus[]>([]);
  const [orderHistory, setOrderHistory] = useState<OrderStatus[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("tacoOrders");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setActiveOrders(parsed.activeOrders || []);
        setOrderHistory(parsed.orderHistory || []);
      } catch (e) {
        console.error("Failed to load orders:", e);
      }
    }
  }, []);

  // Save to localStorage when orders change
  useEffect(() => {
    localStorage.setItem("tacoOrders", JSON.stringify({
      activeOrders,
      orderHistory,
    }));
  }, [activeOrders, orderHistory]);

  const createOrder = useCallback((items: string[], total: number): OrderStatus => {
    const order: OrderStatus = {
      id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      status: "received",
      estimatedTime: 15,
      items,
      total,
      timestamp: Date.now(),
      updates: [
        {
          status: "received",
          message: "Order received! We're getting it started.",
          timestamp: Date.now(),
        },
      ],
    };

    setActiveOrders(prev => [order, ...prev]);
    return order;
  }, []);

  const updateOrderStatus = useCallback((orderId: string, newStatus: OrderStatus["status"]) => {
    setActiveOrders(prev => {
      return prev.map(order => {
        if (order.id !== orderId) return order;

        const messages: Record<OrderStatus["status"], string> = {
          received: "Order received! We're getting it started.",
          preparing: "Your order is being prepared with love!",
          ready: "Your order is ready for pickup!",
          completed: "Order completed. Enjoy your meal!",
        };

        const updatedOrder: OrderStatus = {
          ...order,
          status: newStatus,
          updates: [
            ...order.updates,
            {
              status: newStatus,
              message: messages[newStatus],
              timestamp: Date.now(),
            },
          ],
        };

        // Move to history if completed
        if (newStatus === "completed") {
          setOrderHistory(h => [updatedOrder, ...h]);
          return null as any; // Will be filtered out
        }

        return updatedOrder;
      }).filter(Boolean);
    });
  }, []);

  const getOrderById = useCallback((orderId: string): OrderStatus | undefined => {
    return activeOrders.find(o => o.id === orderId) || orderHistory.find(o => o.id === orderId);
  }, [activeOrders, orderHistory]);

  const cancelOrder = useCallback((orderId: string): boolean => {
    const order = activeOrders.find(o => o.id === orderId);
    if (!order || order.status !== "received") return false;

    setActiveOrders(prev => prev.filter(o => o.id !== orderId));
    return true;
  }, [activeOrders]);

  // Simulate order progress
  useEffect(() => {
    const interval = setInterval(() => {
      activeOrders.forEach(order => {
        if (order.status === "received") {
          // Move to preparing after 2 minutes
          if (Date.now() - order.timestamp > 2 * 60 * 1000) {
            updateOrderStatus(order.id, "preparing");
          }
        } else if (order.status === "preparing") {
          // Move to ready after 10 minutes
          if (Date.now() - order.timestamp > 10 * 60 * 1000) {
            updateOrderStatus(order.id, "ready");
          }
        }
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [activeOrders, updateOrderStatus]);

  return {
    activeOrders,
    orderHistory,
    createOrder,
    updateOrderStatus,
    getOrderById,
    cancelOrder,
  };
}
