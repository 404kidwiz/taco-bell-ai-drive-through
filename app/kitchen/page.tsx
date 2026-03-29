"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  CheckCircle,
  ChefHat,
  AlertTriangle,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { Order } from "../types";
import Nav from "../../components/Nav";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  void: "var(--void)",
  voidLight: "var(--void-light)",
  voidElevated: "var(--void-elevated)",
  orange: "#FF6B35",
  yellow: "#FFD23F",
  purple: "#7C3AED",
  purpleLight: "#9D5EFF",
  green: "#10B981",
  red: "#EF4444",
  warning: "#F59E0B",
  white: "#FFFFFF",
  muted: "#9CA3AF",
  dim: "#4B5563",
  border: "rgba(255,255,255,0.08)",
  borderHover: "rgba(255,255,255,0.15)",
};

// ─── Audio ────────────────────────────────────────────────────────────────────
function playNewOrderChime() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1108, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(1318, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
  } catch { /* noop */ }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function getOrderAgeMinutes(timestamp: number): number {
  return Math.floor((Date.now() - timestamp) / 60000);
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// ─── Ambient Background ────────────────────────────────────────────────────────
function AmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
      }} />

      <motion.div
        className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)" }}
        animate={{ x: [0, 50, 0], y: [0, -60, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute bottom-0 right-1/4 w-[450px] h-[450px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,107,53,0.1) 0%, transparent 70%)" }}
        animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      />

      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "200px 200px",
      }} />
    </div>
  );
}

// ─── Order Card ─────────────────────────────────────────────────────────────────
function OrderCard({ order, onUpdateStatus }: {
  order: Order;
  onUpdateStatus: (id: string, status: Order["status"]) => void;
}) {
  const ageMin = getOrderAgeMinutes(order.updatedAt);
  const isUrgent = ageMin >= 20;
  const isWarning = ageMin >= 15;
  const itemsTotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const grandTotal = itemsTotal * 1.08;

  const getStatusColor = () => {
    if (order.status === "pending") return { bg: "rgba(255,210,63,0.15)", color: C.yellow, border: "rgba(255,210,63,0.4)" };
    if (order.status === "in-progress") return { bg: "rgba(124,58,237,0.15)", color: C.purpleLight, border: "rgba(124,58,237,0.4)" };
    return { bg: "rgba(16,185,129,0.15)", color: C.green, border: "rgba(16,185,129,0.4)" };
  };
  const statusStyle = getStatusColor();

  const getCardGlow = () => {
    if (isUrgent) return { borderColor: C.red, boxShadow: `0 0 30px rgba(239,68,68,0.3), inset 0 0 20px rgba(239,68,68,0.05)` };
    if (isWarning) return { borderColor: C.warning, boxShadow: `0 0 25px rgba(245,158,11,0.2)` };
    return { borderColor: statusStyle.border, boxShadow: `0 0 15px rgba(124,58,237,0.1)` };
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.88, y: -10 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="relative overflow-hidden"
      style={{
        background: "var(--glass)",
        backdropFilter: "blur(20px)",
        border: "1px solid var(--border)",
        borderRadius: "1.25rem",
        padding: "1.25rem",
        ...getCardGlow(),
      }}
    >
      {isUrgent && (
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-[1.25rem]"
          animate={{ opacity: [0.05, 0.12, 0.05] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ background: `radial-gradient(circle at 50% 50%, rgba(239,68,68,0.15) 0%, transparent 70%)` }}
        />
      )}

      <div className="flex items-start justify-between mb-4">
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-black text-5xl leading-none text-white"
          >
            #{order.orderNumber}
          </motion.p>
          <p className="text-sm mt-1.5" style={{ color: C.muted }}>
            {formatTime(order.updatedAt)}
          </p>
        </div>

        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
          style={{
            background: statusStyle.bg,
            color: statusStyle.color,
            border: `1px solid ${statusStyle.border}`,
          }}
        >
          {order.status === "pending" && (
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: C.yellow }}
            />
          )}
          {order.status === "pending" ? "New" : order.status === "in-progress" ? "In Progress" : "Done"}
        </span>
      </div>

      {(isWarning || isUrgent) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg"
          style={{
            background: isUrgent ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)",
            border: `1px solid ${isUrgent ? "rgba(239,68,68,0.4)" : "rgba(245,158,11,0.4)"}`,
          }}
        >
          <AlertTriangle className="w-4 h-4" style={{ color: isUrgent ? C.red : C.warning }} />
          <span className="text-sm font-bold" style={{ color: isUrgent ? C.red : C.warning }}>
            {isUrgent ? "URGENT!" : "AGING!"} {ageMin} min
          </span>
        </motion.div>
      )}

      <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between items-start py-1.5" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-bold w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(124,58,237,0.25)", color: C.purpleLight }}
              >
                {item.quantity}
              </span>
              <span className="font-semibold text-sm text-white">{item.name}</span>
            </div>
            <span className="text-sm" style={{ color: C.muted }}>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      {order.specialInstructions && (
        <div className="mb-4 p-2.5 rounded-lg" style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.4)" }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: C.warning }}>Special Instructions</p>
          <p className="text-sm text-white">{order.specialInstructions}</p>
        </div>
      )}

      <div className="flex justify-between items-center pt-3 mb-4" style={{ borderTop: "2px solid var(--border)" }}>
        <span className="text-sm font-medium" style={{ color: C.muted }}>Total</span>
        <span className="text-xl font-black gradient-text-fire">${grandTotal.toFixed(2)}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {order.status === "pending" && (
          <>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onUpdateStatus(order.id, "in-progress")}
              className="py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider text-white transition-colors"
              style={{
                background: "linear-gradient(135deg, var(--purple), var(--purple-light))",
                boxShadow: "0 4px 14px rgba(124,58,237,0.3)",
              }}
            >
              Start
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onUpdateStatus(order.id, "completed")}
              className="py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider text-white transition-colors"
              style={{
                background: "var(--green)",
                boxShadow: "0 4px 14px rgba(16,185,129,0.3)",
              }}
            >
              Done
            </motion.button>
          </>
        )}
        {order.status === "in-progress" && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onUpdateStatus(order.id, "completed")}
            className="col-span-2 py-3 rounded-xl font-bold text-sm uppercase tracking-wider text-white flex items-center justify-center gap-2"
            style={{
              background: "var(--green)",
              boxShadow: "0 4px 14px rgba(16,185,129,0.3)",
            }}
          >
            <CheckCircle className="w-4 h-4" />
            Mark Complete
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Sound Toggle ─────────────────────────────────────────────────────────────
function SoundToggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      onClick={onToggle}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
      style={{
        background: enabled ? "rgba(124,58,237,0.2)" : "var(--void-elevated)",
        border: `1px solid ${enabled ? "var(--purple)" : "var(--border)"}`,
        color: enabled ? C.purpleLight : C.muted,
      }}
    >
      <motion.div animate={enabled ? { rotate: [0, 12, -8, 0] } : {}} transition={{ duration: 0.4 }}>
        {enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      </motion.div>
      {enabled ? "Sound On" : "Sound Off"}
    </motion.button>
  );
}

// ─── Main Kitchen Page ──────────────────────────────────────────────────────────
export default function KitchenPage() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [seenOrderIds, setSeenOrderIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const prevPendingCount = useRef(0);
  const esRef = useRef<EventSource | null>(null);

  // ─── Load orders from API ──────────────────────────────────────────────────
  const loadOrders = useCallback(async () => {
    try {
      const [activeRes, completedRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/orders/history"),
      ]);
      if (activeRes.ok) {
        const data = await activeRes.json();
        setPendingOrders(data.orders ?? []);
      }
      if (completedRes.ok) {
        const data = await completedRes.json();
        setCompletedOrders(data.orders ?? []);
      }
    } catch {
      // Network error — keep showing stale data
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── SSE real-time subscription ──────────────────────────────────────────
  useEffect(() => {
    // Initial load
    loadOrders();

    // SSE stream — kitchen display subscribes to live order events
    const es = new EventSource("/api/orders/stream");
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data);
        if (event.type === "new" || event.type === "update") {
          loadOrders();
        }
      } catch {
        // Ignore parse errors
      }
    };

    es.onerror = () => {
      // Reconnect automatically via browser EventSource
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [loadOrders]);

  // ─── Play chime for new orders ─────────────────────────────────────────────
  useEffect(() => {
    const newIds = pendingOrders
      .filter((o) => !seenOrderIds.has(o.id))
      .map((o) => o.id);

    if (newIds.length > 0 && soundEnabled) {
      playNewOrderChime();
      setSeenOrderIds((prev) => new Set([...prev, ...newIds]));
    }
  }, [pendingOrders, seenOrderIds, soundEnabled]);

  // ─── Flash tab title on new orders ─────────────────────────────────────────
  useEffect(() => {
    const count = pendingOrders.length;
    if (count > prevPendingCount.current && count > 0) {
      document.title = `(${count}) Kitchen Display — Taco Bell AI`;
      const t = setTimeout(() => {
        document.title = "Kitchen Display — Taco Bell AI";
      }, 3000);
      return () => clearTimeout(t);
    }
    prevPendingCount.current = count;
  }, [pendingOrders]);

  // ─── Update order status via API ──────────────────────────────────────────
  const handleUpdateStatus = async (orderId: string, newStatus: Order["status"]) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await loadOrders();
      }
    } catch {
      // silently fail
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--void)" }}>
      <AmbientBackground />
      <Nav />

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-8">
        {/* ─── HEADER ─────────────────────────────────────────────────────── */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10"
        >
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, var(--yellow), var(--orange))",
                boxShadow: "0 8px 24px rgba(255,107,53,0.3)",
              }}
            >
              <ChefHat className="w-9 h-9" style={{ color: "#0a0612" }} />
            </motion.div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Kitchen Display
              </h1>
              <p className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: "var(--purple)" }}>
                Taco Bell AI Drive-Through
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <SoundToggle enabled={soundEnabled} onToggle={() => setSoundEnabled((p) => !p)} />

            <div className="ml-auto text-right">
              <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: C.dim }}>
                Active Orders
              </p>
              <motion.p
                key={pendingOrders.length}
                initial={{ scale: 1.3, color: C.orange }}
                animate={{ scale: 1, color: C.yellow }}
                className="text-4xl font-black"
              >
                {isLoading ? "—" : pendingOrders.length}
              </motion.p>
            </div>
          </div>
        </motion.header>

        {/* ─── PENDING ORDERS ──────────────────────────────────────────────── */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-5">
            <Clock className="w-5 h-5" style={{ color: C.muted }} />
            <h2 className="text-lg font-bold uppercase tracking-wider" style={{ color: C.muted }}>
              Pending & In Progress
            </h2>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(124,58,237,0.2)", color: C.purpleLight }}
            >
              {pendingOrders.length}
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-52 rounded-2xl animate-pulse"
                  style={{ background: "var(--glass)", border: "1px solid var(--border)" }}
                />
              ))}
            </div>
          ) : pendingOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-16 text-center"
              style={{
                background: "var(--glass)",
                backdropFilter: "blur(20px)",
                border: "1px solid var(--border)",
                borderRadius: "1.5rem",
              }}
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "rgba(124,58,237,0.15)" }}>
                <CheckCircle className="w-10 h-10" style={{ color: "var(--purple)" }} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">All caught up!</h3>
              <p className="text-sm" style={{ color: C.muted }}>
                No active orders right now. New orders will appear here automatically.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              <AnimatePresence>
                {pendingOrders.map((order, i) => (
                  <motion.div
                    key={order.id}
                    custom={i}
                    initial={{ opacity: 0, y: 30, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.88, y: -10 }}
                    transition={{
                      delay: i * 0.05,
                      type: "spring",
                      stiffness: 300,
                      damping: 22,
                    }}
                  >
                    <OrderCard order={order} onUpdateStatus={handleUpdateStatus} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* ─── COMPLETED ORDERS ────────────────────────────────────────────── */}
        {!isLoading && completedOrders.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-5">
              <CheckCircle className="w-5 h-5" style={{ color: C.dim }} />
              <h2 className="text-lg font-bold uppercase tracking-wider" style={{ color: C.dim }}>
                Completed
              </h2>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(16,185,129,0.2)", color: C.green }}
              >
                {completedOrders.length}
              </span>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2">
              {completedOrders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 0.6, scale: 1 }}
                  whileHover={{ opacity: 1, scale: 1.05 }}
                  className="flex-shrink-0 p-4 text-center min-w-[100px] cursor-pointer"
                  style={{
                    background: "var(--glass)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid var(--border)",
                    borderRadius: "1rem",
                  }}
                  onClick={() => handleUpdateStatus(order.id, "pending")}
                  title="Click to restore"
                >
                  <p className="font-black text-2xl text-white">#{order.orderNumber}</p>
                  <p className="text-xs mt-1" style={{ color: C.dim }}>{formatTime(order.updatedAt)}</p>
                  <p className="text-[10px] mt-1 font-medium" style={{ color: C.green }}>Done</p>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Real-time indicator */}
      <div className="fixed bottom-4 right-4 flex items-center gap-2 text-xs z-50" style={{ color: C.dim }}>
        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-2 h-2 rounded-full"
          style={{ background: C.green }}
        />
        Live via SSE
      </div>
    </div>
  );
}
