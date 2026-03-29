"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Order } from "../types";
import Nav from "@/components/Nav";

function getTimerColor(seconds: number): string {
  if (seconds < 120) return "text-green-400";
  if (seconds < 180) return "text-yellow-400";
  return "text-red-500";
}

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function StatusBadge({ status }: { status: Order["status"] }) {
  const configs = {
    pending: { label: "NEW", bg: "bg-primary-container", text: "text-white" },
    "in-progress": { label: "IN KITCHEN", bg: "bg-tertiary-container", text: "text-on-tertiary-container" },
    completed: { label: "READY", bg: "bg-baja-glow", text: "text-white" },
  };
  const cfg = configs[status] || configs.pending;
  return (
    <span className={`text-[10px] font-label font-bold uppercase px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

function OrderCard({ order, onUpdate }: {
  order: Order;
  onUpdate: (status: Order["status"]) => void;
}) {
  const ageSec = Math.floor((Date.now() - order.updatedAt) / 1000);
  const itemsTotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const grandTotal = itemsTotal * 1.08;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.88, y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="bg-surface-container-highest rounded-xl p-5 border border-outline/10"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-headline font-black text-secondary-container text-3xl leading-none">
            #{order.orderNumber}
          </p>
          <p className="text-[10px] font-label text-on-surface-variant mt-1.5 uppercase tracking-wider">
            DRIVE-THRU LANE 1
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge status={order.status} />
          <span className={`font-label font-black text-lg ${getTimerColor(ageSec)}`}>
            {formatTimer(ageSec)}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2 mb-4">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2 py-1.5 border-b border-outline/5 last:border-0">
            <span className="w-6 h-6 rounded-full bg-primary-container text-white text-[10px] font-label font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
              {item.quantity}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-label font-semibold text-on-surface text-sm">{item.name}</p>
              {order.specialInstructions && idx === 0 && (
                <p className="text-[10px] font-label text-tertiary mt-0.5 italic">
                  {order.specialInstructions}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex justify-between items-center mb-4 pt-3 border-t border-outline/10">
        <span className="text-xs font-label text-on-surface-variant">Total</span>
        <span className="font-headline font-black text-tertiary text-lg">
          ${grandTotal.toFixed(2)}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {order.status === "pending" && (
          <>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => onUpdate("in-progress")}
              className="py-3 rounded-xl bg-primary-container text-white font-label font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Bump to Kitchen
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => onUpdate("completed")}
              className="py-3 rounded-xl bg-surface-container text-on-surface-variant font-label font-bold text-sm hover:bg-surface-container-high transition-colors border border-outline/10"
            >
              Skip
            </motion.button>
          </>
        )}
        {order.status === "in-progress" && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onUpdate("completed")}
            className="col-span-2 py-3 rounded-xl bg-secondary-container text-white font-label font-bold text-sm hover:opacity-90 transition-opacity"
          >
            Bump to Bagging
          </motion.button>
        )}
        {order.status === "completed" && (
          <div className="col-span-2 flex items-center justify-center gap-2 py-3">
            <span className="material-symbols-outlined text-green-400 text-lg">check_circle</span>
            <span className="font-label font-bold text-green-400 text-sm">Order Complete</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Stats Row ────────────────────────────────────────────────────────────────
function StatsRow({ orderCount, avgPrep }: { orderCount: number; avgPrep: string }) {
  return (
    <div className="flex items-center gap-6 mb-4">
      <div className="flex items-center gap-2">
        <span className="text-3xl font-headline font-black text-tertiary">{orderCount}</span>
        <span className="text-xs font-label text-on-surface-variant">Active Orders</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-lg font-headline font-bold text-on-surface-variant">Avg Prep</span>
        <span className="text-lg font-headline font-black text-green-400">{avgPrep}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="material-symbols-outlined text-primary text-sm ai-breathe">sync</span>
        <span className="text-[10px] font-label text-on-surface-variant">Live</span>
      </div>
      <button className="ml-auto w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest transition-colors">
        <span className="material-symbols-outlined text-sm text-on-surface-variant">notifications</span>
      </button>
      <button className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest transition-colors">
        <span className="material-symbols-outlined text-sm text-on-surface-variant">settings</span>
      </button>
    </div>
  );
}

// ─── Main Kitchen Page ────────────────────────────────────────────────────────
export default function KitchenPage() {
  const [activeTab, setActiveTab] = useState("STATION 04");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const esRef = useRef<EventSource | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      const [activeRes, completedRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/orders/history"),
      ]);
      if (activeRes.ok) {
        const data = await activeRes.json();
        setOrders(data.orders ?? []);
      }
      if (completedRes.ok) {
        const data = await completedRes.json();
        setOrders((prev) => [...prev.filter((o) => o.status !== "completed"), ...(data.orders ?? [])]);
      }
    } catch {
      // keep stale data
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    const es = new EventSource("/api/orders/stream");
    esRef.current = es;
    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data);
        if (event.type === "new" || event.type === "update") loadOrders();
      } catch { /* noop */ }
    };
    return () => { es.close(); esRef.current = null; };
  }, [loadOrders]);

  const handleUpdate = async (orderId: string, newStatus: Order["status"]) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setOrders((prev) =>
        prev.map((o) => o.id === orderId ? { ...o, status: newStatus, updatedAt: Date.now() } : o)
      );
    } catch { /* noop */ }
  };

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const activeOrders = orders.filter((o) => o.status === "in-progress");

  return (
    <div className="min-h-screen bg-surface-dim">
      <Nav />

      <div className="max-w-5xl mx-auto px-4 pt-24 pb-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-headline font-black text-on-surface text-2xl tracking-tight">
              KDS COMMAND CENTER
            </h1>
          </div>
          <span className="text-sm font-label text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-full border border-outline/10">
            STATION 04
          </span>
        </div>

        {/* Stats Row */}
        <StatsRow orderCount={pendingOrders.length + activeOrders.length} avgPrep="2:45" />

        {/* Station Tabs */}
        <div className="flex gap-2 mb-6">
          {["STATION 04", "HISTORY", "ALERTS"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-label font-bold transition-all ${
                activeTab === tab
                  ? "bg-primary-container text-white"
                  : "bg-surface-container text-on-surface-variant border border-outline/10 hover:bg-surface-container-high"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Order Queue */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-56 rounded-xl animate-pulse bg-surface-container" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {orders
                .filter((o) => o.status !== "completed")
                .map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onUpdate={(status) => handleUpdate(order.id, status)}
                  />
                ))}
            </AnimatePresence>
          </div>
        )}

        {/* Recently Completed */}
        {!isLoading && orders.filter((o) => o.status === "completed").length > 0 && (
          <div className="mt-8">
            <h2 className="font-headline font-bold text-on-surface-variant text-sm uppercase tracking-wider mb-3">
              Recently Completed
            </h2>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              {orders
                .filter((o) => o.status === "completed")
                .slice(0, 10)
                .map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    className="flex-shrink-0 bg-surface-container rounded-xl px-4 py-3 text-center min-w-[80px]"
                  >
                    <p className="font-headline font-black text-tertiary text-lg">#{order.orderNumber}</p>
                    <p className="text-[9px] font-label text-green-400 mt-0.5">READY</p>
                  </motion.div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Live indicator */}
      <div className="fixed bottom-4 right-4 flex items-center gap-2 text-xs z-50 font-label" style={{ color: "#948da3" }}>
        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-2 h-2 rounded-full"
          style={{ background: "#12D7F2" }}
        />
        Live via SSE
      </div>
    </div>
  );
}
