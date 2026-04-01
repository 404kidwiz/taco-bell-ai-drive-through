"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  BarChart3,
  Star,
} from "lucide-react";
import Nav from "@/components/Nav";
import { api } from "../lib/api";

const C = {
  void: "#151022",
  voidLight: "#1E192B",
  voidElevated: "#221D2F",
  surfaceHighest: "#373245",
  purple: "#6D28FF",
  purpleLight: "#CEBDFF",
  orange: "#FF6A1F",
  yellow: "#FFC247",
  green: "#12D7F2",
  red: "#EF4444",
  white: "#FFFFFF",
  readableBody: "#CBC3DA",
  muted: "#948DA3",
  dim: "#948DA3",
  border: "rgba(255,255,255,0.08)",
};

type Period = 7 | 14 | 30;

interface OrderForTable {
  id: string;
  orderNumber: number;
  items: Array<{ name: string }>;
  total: number;
  status: string;
  createdAt: number;
}

interface Analytics {
  orderCount: number;
  revenue: number;
  avgOrderValue: number;
  completionRate: number;
  todaysOrderCount: number;
  todaysRevenue: number;
  ordersByHour: Record<number, number>;
  topItems: Array<{ name: string; quantity: number }>;
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  accent,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subtext?: string;
  accent: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden"
      style={{
        background: "#221D2F",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "20px",
        padding: "1.5rem",
      }}
    >
      {/* Accent glow */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
          transform: "translate(30%, -30%)",
        }}
      />

      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: `${accent}22`, border: `1px solid ${accent}33` }}
        >
          <Icon className="w-6 h-6" style={{ color: accent }} />
        </div>
      </div>

      <p className="text-xs font-bold uppercase tracking-wider mb-1 font-body" style={{ color: C.muted }}>
        {label}
      </p>
      <p className="text-3xl font-black text-white mb-1 font-display">{value}</p>
      {subtext && (
        <p className="text-xs font-body" style={{ color: C.dim }}>{subtext}</p>
      )}
    </motion.div>
  );
}

function HourBar({ hour, count, max }: { hour: number; count: number; max: number }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  const label = `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}${hour >= 12 ? "PM" : "AM"}`;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-mono w-8 text-right flex-shrink-0" style={{ color: C.dim }}>
        {label}
      </span>
      <div className="flex-1 h-6 rounded-md overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-md"
          style={{
            background: `linear-gradient(90deg, ${C.purple}88, ${C.purpleLight}aa)`,
          }}
        />
      </div>
      <span className="text-xs font-mono w-5 text-left flex-shrink-0" style={{ color: C.muted }}>
        {count}
      </span>
    </div>
  );
}

function TopItemBar({ name, quantity, max }: { name: string; quantity: number; max: number }) {
  const pct = max > 0 ? (quantity / max) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-white w-36 truncate flex-shrink-0">{name}</span>
      <div className="flex-1 h-6 rounded-md overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-md"
          style={{
            background: `linear-gradient(90deg, ${C.orange}88, ${C.yellow}aa)`,
          }}
        />
      </div>
      <span className="text-xs font-mono w-8 text-right flex-shrink-0" style={{ color: C.muted }}>
        {quantity}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    pending: { bg: "rgba(255,210,63,0.15)", color: C.yellow, label: "Pending" },
    "in-progress": { bg: "rgba(124,58,237,0.15)", color: C.purpleLight, label: "In Progress" },
    completed: { bg: "rgba(16,185,129,0.15)", color: C.green, label: "Completed" },
  };
  const s = map[status] ?? map.pending;

  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}44` }}
    >
      {s.label}
    </span>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>(7);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderForTable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [analyticsData, ordersData] = await Promise.all([
          api.get<any>(`/api/analytics?days=${period}`),
          api.get<{ orders: any[] }>(`/api/orders/history?limit=50`),
        ]);
        setAnalytics(analyticsData);
        setRecentOrders(ordersData.orders ?? []);
      } catch {
        // network error — api wrapper handles retry
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [period]);

  const maxHourCount = analytics?.ordersByHour
    ? Math.max(...Object.values(analytics.ordersByHour), 1)
    : 1;
  const maxItemQty = analytics?.topItems?.[0]?.quantity ?? 1;

  const periodLabels: Record<Period, string> = { 7: "7 Days", 14: "14 Days", 30: "30 Days" };

  return (
    <div className="min-h-screen" style={{ background: "#151022" }}>
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <motion.div
          className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)" }}
          animate={{ x: [0, 60, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-[450px] h-[450px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,107,53,0.08) 0%, transparent 70%)" }}
          animate={{ x: [0, -40, 0], y: [0, 50, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 6 }}
        />
      </div>

      <Nav />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10"
        >
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${C.purple}, ${C.purpleLight})`,
                boxShadow: `0 8px 24px ${C.purple}33`,
              }}
            >
              <BarChart3 className="w-7 h-7" style={{ color: "#fff" }} />
            </motion.div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight" style={{ color: "#CBC3DA" }}>
                Analytics
              </h1>
              <p className="text-sm font-bold uppercase tracking-[0.2em] font-body" style={{ color: C.dim }}>
                Taco Bell AI Drive-Through
              </p>
            </div>
          </div>

          {/* Period selector */}
          <div className="flex gap-2">
            {([7, 14, 30] as Period[]).map((p) => (
              <motion.button
                key={p}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setPeriod(p)}
                className="px-4 py-2 rounded-full text-sm font-bold transition-all font-body"
                style={{
                  background: period === p ? C.purple : "rgba(255,255,255,0.04)",
                  color: period === p ? C.white : C.muted,
                  border: `1px solid ${period === p ? C.purple : "rgba(255,255,255,0.08)"}`,
                }}
              >
                {periodLabels[p]}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {loading ? (
          /* Loading skeleton */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-36 rounded-2xl animate-pulse"
                style={{ background: "#221D2F", border: "1px solid rgba(255,255,255,0.08)" }}
              />
            ))}
          </div>
        ) : !analytics ? (
          /* No data state */
          <div className="text-center py-20 font-body" style={{ color: C.dim }}>
            <p className="text-lg font-bold mb-2">No data available</p>
            <p className="text-sm">Place some orders to see analytics here.</p>
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={ShoppingBag}
                label="Total Orders"
                value={analytics.orderCount.toLocaleString()}
                subtext={`Last ${period} days`}
                accent={C.purple}
                delay={0.05}
              />
              <StatCard
                icon={DollarSign}
                label="Total Revenue"
                value={`$${analytics.revenue.toFixed(2)}`}
                subtext={`Last ${period} days`}
                accent="#FFC247"
                delay={0.1}
              />
              <StatCard
                icon={TrendingUp}
                label="Avg Order Value"
                value={`$${analytics.avgOrderValue.toFixed(2)}`}
                subtext="Per order"
                accent={C.orange}
                delay={0.15}
              />
              <StatCard
                icon={CheckCircle}
                label="Completion Rate"
                value={`${(analytics.completionRate * 100).toFixed(1)}%`}
                subtext="Orders completed"
                accent="#12D7F2"
                delay={0.2}
              />
            </div>

            {/* Today's snapshot */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="p-5 rounded-2xl font-body"
                style={{
                  background: "#221D2F",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4" style={{ color: C.muted }} />
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.muted }}>
                    Today
                  </span>
                </div>
                <p className="text-2xl font-black font-display" style={{ color: "#FFC247" }}>{analytics.todaysOrderCount}</p>
                <p className="text-sm" style={{ color: C.dim }}>orders</p>
                <p className="text-xl font-black mt-2" style={{ color: C.green }}>
                  ${analytics.todaysRevenue.toFixed(2)}
                </p>
                <p className="text-xs" style={{ color: C.dim }}>revenue</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-5 rounded-2xl col-span-2 font-body"
                style={{
                  background: "#221D2F",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-4 h-4" style={{ color: C.muted }} />
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.muted }}>
                    Top Items ({periodLabels[period]})
                  </span>
                </div>
                <div className="space-y-2">
                  {analytics.topItems.slice(0, 5).map((item, i) => (
                    <TopItemBar
                      key={i}
                      name={item.name}
                      quantity={item.quantity}
                      max={maxItemQty}
                    />
                  ))}
                  {analytics.topItems.length === 0 && (
                    <p className="text-sm" style={{ color: C.dim }}>No data yet</p>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Orders by hour + Recent orders */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
              {/* Hourly bar chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="lg:col-span-2 p-6 rounded-2xl font-body"
                style={{
                  background: "#221D2F",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: C.muted }}>
                  Orders by Hour
                </h3>
                <div className="space-y-1.5">
                  {Object.entries(analytics.ordersByHour)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([hour, count]) => (
                      <HourBar
                        key={hour}
                        hour={Number(hour)}
                        count={count as number}
                        max={maxHourCount}
                      />
                    ))}
                  {Object.keys(analytics.ordersByHour).length === 0 && (
                    <p className="text-sm" style={{ color: C.dim }}>No data yet</p>
                  )}
                </div>
              </motion.div>

              {/* Recent orders table */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-3 p-6 rounded-2xl overflow-hidden font-body"
                style={{
                  background: "#221D2F",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: C.muted }}>
                  Recent Orders
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                        <th className="text-left py-2 px-2 font-bold uppercase tracking-wider text-xs" style={{ color: C.dim }}>#</th>
                        <th className="text-left py-2 px-2 font-bold uppercase tracking-wider text-xs" style={{ color: C.dim }}>Time</th>
                        <th className="text-left py-2 px-2 font-bold uppercase tracking-wider text-xs" style={{ color: C.dim }}>Items</th>
                        <th className="text-right py-2 px-2 font-bold uppercase tracking-wider text-xs" style={{ color: C.dim }}>Total</th>
                        <th className="text-right py-2 px-2 font-bold uppercase tracking-wider text-xs" style={{ color: C.dim }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center py-8" style={{ color: C.dim }}>
                            No orders yet
                          </td>
                        </tr>
                      )}
                      {recentOrders.slice(0, 20).map((order) => {
                        const items = Array.isArray(order.items) ? order.items : [];
                        return (
                          <tr
                            key={order.id}
                            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                            className="hover:bg-white/5 transition-colors"
                          >
                            <td className="py-2.5 px-2 font-black font-display" style={{ color: "#FFC247" }}>#{order.orderNumber}</td>
                            <td className="py-2.5 px-2" style={{ color: "#948DA3" }}>
                              {formatDate(new Date(order.createdAt as number).toISOString())}
                            </td>
                            <td className="py-2.5 px-2 truncate max-w-[200px]" style={{ color: "#CBC3DA" }}>
                              {items.slice(0, 2).map((i: { name: string }) => i.name).join(", ")}
                              {items.length > 2 ? ` +${items.length - 2}` : ""}
                            </td>
                            <td className="py-2.5 px-2 text-right font-bold font-display" style={{ color: "#FFC247" }}>
                              ${(order.total as number).toFixed(2)}
                            </td>
                            <td className="py-2.5 px-2 text-right">
                              <StatusBadge status={order.status as string} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
