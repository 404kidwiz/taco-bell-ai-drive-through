"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Bot,
  Loader2,
  BarChart3,
  PieChart,
} from "lucide-react";

const mockAnalytics = {
  totalOrders: 2847,
  totalRevenue: 785432,
  avgOrderValue: 2758,
  avgResponseTime: 1340,
  misunderstandingRate: 4.2,
  upsellSuccessRate: 23.5,
  positiveSentiment: 78,
  neutralSentiment: 17,
  negativeSentiment: 5,
  topItems: [
    { name: "Crunchy Taco", quantity: 892, revenue: 177508 },
    { name: "Burrito Supreme", quantity: 654, revenue: 489846 },
    { name: "Mexican Pizza", quantity: 423, revenue: 211077 },
    { name: "Nachos Bell Grande", quantity: 389, revenue: 252461 },
    { name: "Chicken Quesadilla", quantity: 312, revenue: 171228 },
  ],
  revenueByDay: [
    { day: "Mon", revenue: 98540 },
    { day: "Tue", revenue: 102340 },
    { day: "Wed", revenue: 115670 },
    { day: "Thu", revenue: 108920 },
    { day: "Fri", revenue: 142350 },
    { day: "Sat", revenue: 156780 },
    { day: "Sun", revenue: 135060 },
  ],
  ordersByHour: [
    { hour: "9AM", orders: 45 },
    { hour: "10AM", orders: 78 },
    { hour: "11AM", orders: 156 },
    { hour: "12PM", orders: 234 },
    { hour: "1PM", orders: 189 },
    { hour: "2PM", orders: 145 },
    { hour: "3PM", orders: 112 },
    { hour: "4PM", orders: 134 },
    { hour: "5PM", orders: 178 },
    { hour: "6PM", orders: 212 },
    { hour: "7PM", orders: 198 },
    { hour: "8PM", orders: 167 },
  ],
  lastWeekOrders: 267,
  lastWeekRevenue: 734560,
};

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

type TabType = "overview" | "ai-performance";

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [dateRange, setDateRange] = useState("7d");

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-[#6D28FF]" size={32} />
      </div>
    );
  }

  const maxRevenue = Math.max(...mockAnalytics.revenueByDay.map((d) => d.revenue));
  const maxOrders = Math.max(...mockAnalytics.ordersByHour.map((d) => d.orders));
  const weekOrderChange = ((mockAnalytics.totalOrders - mockAnalytics.lastWeekOrders) / mockAnalytics.lastWeekOrders * 100).toFixed(1);
  const weekRevenueChange = ((mockAnalytics.totalRevenue - mockAnalytics.lastWeekRevenue) / mockAnalytics.lastWeekRevenue * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Analytics</h1>
          <p className="text-[#948DA3] text-sm mt-1">Performance insights for your restaurant</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-[#1e192b] border border-[#494457] rounded-xl p-1">
            {["24h", "7d", "30d", "custom"].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${dateRange === range ? "bg-[#6D28FF] text-white" : "text-[#948DA3] hover:text-white"}`}
              >
                {range === "custom" ? <Calendar size={14} /> : range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#494457]/50">
        {[
          { id: "overview", label: "Overview", icon: BarChart3 },
          { id: "ai-performance", label: "AI Performance", icon: Bot },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === tab.id ? "border-[#6D28FF] text-white" : "border-transparent text-[#948DA3] hover:text-white"}`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1e192b] border border-[#494457]/50 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#6D28FF]/20 flex items-center justify-center">
                  <ShoppingCart className="text-[#6D28FF]" size={20} />
                </div>
                <span className="flex items-center gap-1 text-xs text-green-400">
                  <TrendingUp size={12} />
                  +{weekOrderChange}%
                </span>
              </div>
              <p className="text-2xl font-bold text-white">{formatNumber(mockAnalytics.totalOrders)}</p>
              <p className="text-[#948DA3] text-sm">Total Orders</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#1e192b] border border-[#494457]/50 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <DollarSign className="text-green-400" size={20} />
                </div>
                <span className="flex items-center gap-1 text-xs text-green-400">
                  <TrendingUp size={12} />
                  +{weekRevenueChange}%
                </span>
              </div>
              <p className="text-2xl font-bold text-white">{formatCurrency(mockAnalytics.totalRevenue)}</p>
              <p className="text-[#948DA3] text-sm">Total Revenue</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#1e192b] border border-[#494457]/50 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <TrendingUp className="text-blue-400" size={20} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{formatCurrency(mockAnalytics.avgOrderValue)}</p>
              <p className="text-[#948DA3] text-sm">Avg Order Value</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#1e192b] border border-[#494457]/50 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#12D7F2]/20 flex items-center justify-center">
                  <BarChart3 className="text-[#12D7F2]" size={20} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{formatNumber(mockAnalytics.ordersByHour.length)}</p>
              <p className="text-[#948DA3] text-sm">Peak Hour</p>
            </motion.div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue by day */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#1e192b] border border-[#494457]/50 rounded-2xl p-6"
            >
              <h2 className="text-lg font-bold text-white mb-6">Revenue by Day</h2>
              <div className="flex items-end gap-3 h-48">
                {mockAnalytics.revenueByDay.map((day, idx) => (
                  <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "100%" }}
                      transition={{ delay: idx * 0.1, duration: 0.5 }}
                      className="w-full rounded-t-lg relative overflow-hidden"
                    >
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#6D28FF] to-[#7c3aed] rounded-t-lg" style={{ height: `${(day.revenue / maxRevenue) * 100}%` }} />
                    </motion.div>
                    <span className="text-[#948DA3] text-xs">{day.day}</span>
                    <span className="text-white text-xs font-medium">{formatCurrency(day.revenue).replace("$", "")}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Orders by hour */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-[#1e192b] border border-[#494457]/50 rounded-2xl p-6"
            >
              <h2 className="text-lg font-bold text-white mb-6">Orders by Hour</h2>
              <div className="flex items-end gap-2 h-48">
                {mockAnalytics.ordersByHour.map((hour, idx) => (
                  <div key={hour.hour} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "100%" }}
                      transition={{ delay: idx * 0.05, duration: 0.5 }}
                      className="w-full rounded-t-lg relative overflow-hidden"
                    >
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#12D7F2] to-[#0891b2] rounded-t-lg" style={{ height: `${(hour.orders / maxOrders) * 100}%` }} />
                    </motion.div>
                    <span className="text-[#948DA3] text-xs">{hour.hour}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Top items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-[#1e192b] border border-[#494457]/50 rounded-2xl p-6"
          >
            <h2 className="text-lg font-bold text-white mb-6">Top Selling Items</h2>
            <div className="space-y-4">
              {mockAnalytics.topItems.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-lg bg-[#494457]/30 flex items-center justify-center text-[#948DA3] font-bold">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-white font-medium">{item.name}</p>
                    <p className="text-[#948DA3] text-sm">{item.quantity} sold</p>
                  </div>
                  <p className="text-[#cebdff] font-semibold">{formatCurrency(item.revenue)}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}

      {activeTab === "ai-performance" && (
        <div className="space-y-6">
          {/* AI metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1e192b] border border-[#494457]/50 rounded-2xl p-5"
            >
              <div className="w-10 h-10 rounded-xl bg-[#12D7F2]/20 flex items-center justify-center mb-3">
                <Bot className="text-[#12D7F2]" size={20} />
              </div>
              <p className="text-2xl font-bold text-white">{(mockAnalytics.avgResponseTime / 1000).toFixed(1)}s</p>
              <p className="text-[#948DA3] text-sm">Avg Response Time</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#1e192b] border border-[#494457]/50 rounded-2xl p-5"
            >
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center mb-3">
                <TrendingDown className="text-yellow-400" size={20} />
              </div>
              <p className="text-2xl font-bold text-white">{mockAnalytics.misunderstandingRate}%</p>
              <p className="text-[#948DA3] text-sm">Misunderstanding Rate</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#1e192b] border border-[#494457]/50 rounded-2xl p-5"
            >
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center mb-3">
                <TrendingUp className="text-green-400" size={20} />
              </div>
              <p className="text-2xl font-bold text-white">{mockAnalytics.upsellSuccessRate}%</p>
              <p className="text-[#948DA3] text-sm">Upsell Success Rate</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#1e192b] border border-[#494457]/50 rounded-2xl p-5"
            >
              <div className="w-10 h-10 rounded-xl bg-[#6D28FF]/20 flex items-center justify-center mb-3">
                <PieChart className="text-[#6D28FF]" size={20} />
              </div>
              <p className="text-2xl font-bold text-white">{mockAnalytics.positiveSentiment}%</p>
              <p className="text-[#948DA3] text-sm">Positive Sentiment</p>
            </motion.div>
          </div>

          {/* Sentiment breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#1e192b] border border-[#494457]/50 rounded-2xl p-6"
          >
            <h2 className="text-lg font-bold text-white mb-6">Conversation Sentiment</h2>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <div className="h-4 rounded-full overflow-hidden flex">
                  <div className="bg-green-500 w-[78%]" />
                  <div className="bg-yellow-500 w-[17%]" />
                  <div className="bg-red-500 w-[5%]" />
                </div>
                <div className="flex justify-between mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-[#948DA3]">Positive</span>
                    <span className="text-white font-medium">{mockAnalytics.positiveSentiment}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-[#948DA3]">Neutral</span>
                    <span className="text-white font-medium">{mockAnalytics.neutralSentiment}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-[#948DA3]">Negative</span>
                    <span className="text-white font-medium">{mockAnalytics.negativeSentiment}%</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
