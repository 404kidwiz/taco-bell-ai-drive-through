"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Bot,
  Clock,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  avgOrderValue: number;
  avgResponseTime: number;
  recentOrders: Array<{
    id: string;
    items: Array<{ name: string; quantity: number }>;
    total: number;
    status: string;
    createdAt: string;
  }>;
  ordersByHour: Array<{ hour: string; orders: number }>;
}

const mockStats: DashboardStats = {
  todayOrders: 47,
  todayRevenue: 124750, // in cents
  avgOrderValue: 2654,
  avgResponseTime: 1240,
  recentOrders: [
    { id: "ORD-001", items: [{ name: "Crunchy Taco", quantity: 2 }], total: 498, status: "completed", createdAt: new Date().toISOString() },
    { id: "ORD-002", items: [{ name: "Burrito Supreme", quantity: 1 }], total: 749, status: "preparing", createdAt: new Date(Date.now() - 300000).toISOString() },
    { id: "ORD-003", items: [{ name: "Mexican Pizza", quantity: 2 }], total: 1198, status: "ready", createdAt: new Date(Date.now() - 600000).toISOString() },
    { id: "ORD-004", items: [{ name: "Nachos Bell Grande", quantity: 1 }], total: 649, status: "completed", createdAt: new Date(Date.now() - 900000).toISOString() },
    { id: "ORD-005", items: [{ name: "Chicken Quesadilla", quantity: 1 }], total: 549, status: "completed", createdAt: new Date(Date.now() - 1200000).toISOString() },
  ],
  ordersByHour: [
    { hour: "9AM", orders: 3 },
    { hour: "10AM", orders: 5 },
    { hour: "11AM", orders: 8 },
    { hour: "12PM", orders: 12 },
    { hour: "1PM", orders: 9 },
    { hour: "2PM", orders: 6 },
    { hour: "3PM", orders: 4 },
  ],
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatTime(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

function getStatusColor(status: string): string {
  switch (status) {
    case "completed":
      return "bg-green-500/20 text-green-400";
    case "preparing":
      return "bg-yellow-500/20 text-yellow-400";
    case "ready":
      return "bg-blue-500/20 text-blue-400";
    case "received":
      return "bg-[#6D28FF]/20 text-[#cebdff]";
    default:
      return "bg-[#494457]/20 text-[#948DA3]";
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading - in production, fetch from API
    const timer = setTimeout(() => {
      setStats(mockStats);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-[#6D28FF]" size={32} />
      </div>
    );
  }

  if (!stats) return null;

  const maxOrders = Math.max(...stats.ordersByHour.map((h) => h.orders));

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-black text-white">Dashboard</h1>
        <p className="text-[#948DA3] text-sm mt-1">
          Welcome back! Here&apos;s what&apos;s happening today.
        </p>
      </motion.div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={item}>
          <div className="bg-[#1e192b] border border-[#494457]/50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#6D28FF]/20 flex items-center justify-center">
                <ShoppingCart className="text-[#6D28FF]" size={20} />
              </div>
              <span className="text-xs text-green-400 font-medium">+12%</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.todayOrders}</p>
            <p className="text-[#948DA3] text-sm">Today&apos;s Orders</p>
          </div>
        </motion.div>

        <motion.div variants={item}>
          <div className="bg-[#1e192b] border border-[#494457]/50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <DollarSign className="text-green-400" size={20} />
              </div>
              <span className="text-xs text-green-400 font-medium">+8%</span>
            </div>
            <p className="text-2xl font-bold text-white">{formatCurrency(stats.todayRevenue)}</p>
            <p className="text-[#948DA3] text-sm">Today&apos;s Revenue</p>
          </div>
        </motion.div>

        <motion.div variants={item}>
          <div className="bg-[#1e192b] border border-[#494457]/50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <TrendingUp className="text-blue-400" size={20} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{formatCurrency(stats.avgOrderValue)}</p>
            <p className="text-[#948DA3] text-sm">Avg Order Value</p>
          </div>
        </motion.div>

        <motion.div variants={item}>
          <div className="bg-[#1e192b] border border-[#494457]/50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#12D7F2]/20 flex items-center justify-center">
                <Bot className="text-[#12D7F2]" size={20} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{formatTime(stats.avgResponseTime)}</p>
            <p className="text-[#948DA3] text-sm">AI Response Time</p>
          </div>
        </motion.div>
      </div>

      {/* Quick chart + recent orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by hour chart */}
        <motion.div variants={item} className="bg-[#1e192b] border border-[#494457]/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Orders by Hour</h2>
            <Clock className="text-[#948DA3]" size={18} />
          </div>
          <div className="flex items-end gap-3 h-32">
            {stats.ordersByHour.map((hour, index) => (
              <motion.div
                key={hour.hour}
                initial={{ height: 0 }}
                animate={{ height: "100%" }}
                transition={{ delay: index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <div className="w-full flex-1 bg-[#6D28FF]/20 rounded-t-lg relative overflow-hidden">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(hour.orders / maxOrders) * 100}%` }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#6D28FF] to-[#7c3aed] rounded-t-lg"
                  />
                </div>
                <span className="text-[#948DA3] text-xs">{hour.hour}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent orders */}
        <motion.div variants={item} className="bg-[#1e192b] border border-[#494457]/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-[#6D28FF] text-sm font-medium hover:text-[#cebdff] flex items-center gap-1"
            >
              View All
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between py-2 border-b border-[#494457]/30 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#494457]/30 flex items-center justify-center">
                    <ShoppingCart className="text-[#948DA3]" size={14} />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{order.id}</p>
                    <p className="text-[#948DA3] text-xs">
                      {order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white text-sm font-medium">{formatCurrency(order.total)}</p>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick links */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/admin/orders"
          className="bg-[#1e192b] border border-[#494457]/50 rounded-2xl p-5 hover:border-[#6D28FF]/50 transition-colors group"
        >
          <ShoppingCart className="text-[#6D28FF] mb-3" size={24} />
          <p className="text-white font-medium group-hover:text-[#cebdff] transition-colors">Manage Orders</p>
          <p className="text-[#948DA3] text-sm mt-1">View and process orders</p>
        </Link>
        <Link
          href="/admin/menu"
          className="bg-[#1e192b] border border-[#494457]/50 rounded-2xl p-5 hover:border-[#6D28FF]/50 transition-colors group"
        >
          <Utensils className="text-[#6D28FF] mb-3" size={24} />
          <p className="text-white font-medium group-hover:text-[#cebdff] transition-colors">Edit Menu</p>
          <p className="text-[#948DA3] text-sm mt-1">Update items and prices</p>
        </Link>
        <Link
          href="/admin/ai-settings"
          className="bg-[#1e192b] border border-[#494457]/50 rounded-2xl p-5 hover:border-[#6D28FF]/50 transition-colors group"
        >
          <Bot className="text-[#6D28FF] mb-3" size={24} />
          <p className="text-white font-medium group-hover:text-[#cebdff] transition-colors">AI Settings</p>
          <p className="text-[#948DA3] text-sm mt-1">Configure personality</p>
        </Link>
        <Link
          href="/admin/analytics"
          className="bg-[#1e192b] border border-[#494457]/50 rounded-2xl p-5 hover:border-[#6D28FF]/50 transition-colors group"
        >
          <BarChart3 className="text-[#6D28FF] mb-3" size={24} />
          <p className="text-white font-medium group-hover:text-[#cebdff] transition-colors">Analytics</p>
          <p className="text-[#948DA3] text-sm mt-1">View performance data</p>
        </Link>
      </motion.div>
    </motion.div>
  );
}

// Import icons for quick links
import { Utensils, BarChart3 } from "lucide-react";
