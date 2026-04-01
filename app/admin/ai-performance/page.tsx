"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Clock,
  AlertCircle,
  TrendingUp,
  CheckCircle,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  Minus,
  BarChart3,
  Zap,
  Globe,
  ChevronDown,
  ChevronUp,
  Filter,
  RefreshCw,
} from "lucide-react";
import Nav from "@/components/Nav";
import { api } from "../../lib/api";

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

// ─── Types ───────────────────────────────────────────────────────────────────

interface Metrics {
  totalConversations: number;
  avgDuration: number;
  completionRate: number;
  misunderstandingRate: number;
  upsellAttemptRate: number;
  upsellSuccessRate: number;
  avgResponseMs: number;
  totalValue: number;
  sentiment: { positive: number; neutral: number; negative: number };
}

interface DailyStat {
  date: string;
  conversations: number;
  completed: number;
  avgResponseMs: number;
  avgDuration: number;
  positive: number;
  negative: number;
}

interface ConversationRecord {
  id: string;
  restaurantId: string;
  conversationId: string;
  duration: number;
  completed: boolean;
  itemCount: number;
  totalValue: number;
  misunderstandingCount: number;
  upsellAttempted: boolean;
  upsellAccepted: boolean;
  avgResponseMs: number;
  sentiment: "positive" | "neutral" | "negative";
  language: string;
  createdAt: string;
}

interface UpsellFunnel {
  attempted: number;
  accepted: number;
}

interface LanguageBreakdown {
  language: string;
  count: number;
  avgDuration: number;
  completionRate: number;
}

interface DashboardData {
  metrics: Metrics;
  recent: ConversationRecord[];
  dailyStats: DailyStat[];
  upsellFunnel: UpsellFunnel;
  languageBreakdown: LanguageBreakdown[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function formatMs(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function pct(n: number, d: number): string {
  if (d === 0) return "0%";
  return `${Math.round((n / d) * 100)}%`;
}

// ─── SVG Chart Components ────────────────────────────────────────────────────

function DonutChart({
  positive,
  neutral,
  negative,
  size = 160,
}: {
  positive: number;
  neutral: number;
  negative: number;
  size?: number;
}) {
  const total = positive + neutral + negative || 1;
  const r = size / 2 - 12;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  function segment(value: number, offset: number) {
    const pct = value / total;
    const dash = circumference * pct;
    const gap = circumference - dash;
    return `${dash} ${gap}`;
  }

  let offset = 0;
  const posPct = positive / total;
  const neuPct = neutral / total;
  const negPct = negative / total;

  const posDash = circumference * posPct;
  const posGap = circumference - posDash;

  const neuDash = circumference * neuPct;
  const neuGap = circumference - neuDash;

  const negDash = circumference * negPct;
  const negGap = circumference - negDash;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Positive segment */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={C.green}
        strokeWidth={20}
        strokeDasharray={`${posDash} ${posGap}`}
        strokeDashoffset={-0}
        opacity={positive > 0 ? 1 : 0.2}
      />
      {/* Neutral segment */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={C.muted}
        strokeWidth={20}
        strokeDasharray={`${neuDash} ${neuGap}`}
        strokeDashoffset={-(posDash + neuDash * 0.5 + neuGap * 0.5 + 0.01)}
        opacity={neutral > 0 ? 1 : 0.2}
      />
      {/* Negative segment */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={C.red}
        strokeWidth={20}
        strokeDasharray={`${negDash} ${negGap}`}
        strokeDashoffset={-(posDash + neuDash + negDash * 0.5 + negGap * 0.5 + 0.02)}
        opacity={negative > 0 ? 1 : 0.2}
      />
      <text x={cx} y={cy - 6} textAnchor="middle" fill="white" fontSize="22" fontWeight="900" fontFamily="inherit">
        {positive + neutral + negative}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill={C.muted} fontSize="11" fontFamily="inherit">
        conversations
      </text>
    </svg>
  );
}

function LineChart({
  data,
  accessor,
  color,
  height = 120,
  format,
}: {
  data: { date: string; [key: string]: any }[];
  accessor: (d: { date: string; [key: string]: any }) => number;
  color: string;
  height?: number;
  format: (v: number) => string;
}) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-24" style={{ color: C.dim, fontFamily: "inherit" }}>
        No data yet
      </div>
    );
  }
  const values = data.map(accessor);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const width = 100 / Math.max(data.length - 1, 1);

  const points = data.map((d, i) => {
    const x = i * width;
    const y = 100 - ((accessor(d) - min) / range) * 100;
    return `${x},${y}`;
  });

  const polyline = points.join(" ");

  const areaPoints = `0,100 ${polyline} 100,100`;

  return (
    <div className="relative" style={{ height }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill={`url(#grad-${color.replace('#', '')})`} />
        <polyline points={polyline} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {data.map((d, i) => {
          const x = i * width;
          const y = 100 - ((accessor(d) - min) / range) * 100;
          return (
            <circle key={i} cx={x} cy={y} r="3" fill={color} vectorEffect="non-scaling-stroke" />
          );
        })}
      </svg>
      <div className="flex justify-between mt-1" style={{ fontSize: "9px", color: C.dim, fontFamily: "inherit" }}>
        {data[0] && <span>{data[0].date.slice(5)}</span>}
        {data.length > 1 && <span>{data[data.length - 1].date.slice(5)}</span>}
      </div>
    </div>
  );
}

function UpsellFunnelChart({ attempted, accepted }: UpsellFunnel) {
  const maxWidth = 100;
  const attemptedPct = attempted > 0 ? 100 : 0;
  const acceptedPct = attempted > 0 ? (accepted / attempted) * 100 : 0;

  return (
    <div className="space-y-3">
      <div>
        <div className="flex justify-between text-xs mb-1" style={{ color: C.muted, fontFamily: "inherit" }}>
          <span>Attempted</span>
          <span style={{ color: C.purpleLight }}>{attempted}</span>
        </div>
        <div className="h-4 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${attemptedPct}%` }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${C.purple}88, ${C.purpleLight}aa)` }}
          />
        </div>
      </div>
      <div>
        <div className="flex justify-between text-xs mb-1" style={{ color: C.muted, fontFamily: "inherit" }}>
          <span>Accepted</span>
          <span style={{ color: C.green }}>{accepted}</span>
        </div>
        <div className="h-4 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${acceptedPct}%` }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${C.green}88, ${C.green}aa)` }}
          />
        </div>
      </div>
      {attempted > 0 && (
        <p className="text-xs text-center font-bold" style={{ color: C.green, fontFamily: "inherit" }}>
          {((accepted / attempted) * 100).toFixed(1)}% conversion
        </p>
      )}
    </div>
  );
}

// ─── Metric Card ─────────────────────────────────────────────────────────────

function MetricCard({
  icon: Icon,
  label,
  value,
  subtext,
  accent,
  delay,
  sparkline,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subtext?: string;
  accent: string;
  delay: number;
  sparkline?: React.ReactNode;
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
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`, transform: "translate(30%, -30%)" }}
      />
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: `${accent}22`, border: `1px solid ${accent}33` }}
        >
          <Icon className="w-6 h-6" style={{ color: accent }} />
        </div>
        {sparkline && <div className="w-20 h-10 opacity-60">{sparkline}</div>}
      </div>
      <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: C.muted }}>{label}</p>
      <p className="text-3xl font-black text-white mb-1" style={{ fontFamily: "inherit" }}>{value}</p>
      {subtext && <p className="text-xs" style={{ color: C.dim, fontFamily: "inherit" }}>{subtext}</p>}
    </motion.div>
  );
}

// ─── Sentiment Legend ─────────────────────────────────────────────────────────

function SentimentLegend({ positive, neutral, negative }: { positive: number; neutral: number; negative: number }) {
  const total = positive + neutral + negative || 1;
  return (
    <div className="flex items-center justify-center gap-4 mt-3">
      {[
        { label: "Positive", value: positive, color: C.green },
        { label: "Neutral", value: neutral, color: C.muted },
        { label: "Negative", value: negative, color: C.red },
      ].map(({ label, value, color }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: color }} />
          <span className="text-xs" style={{ color: C.muted, fontFamily: "inherit" }}>
            {label} {total > 0 ? `${Math.round((value / total) * 100)}%` : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AIPerformancePage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Filters
  const [restaurantId, setRestaurantId] = useState("");
  const [dateRange, setDateRange] = useState<"7d" | "14d" | "30d" | "all">("7d");
  const [languageFilter, setLanguageFilter] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState("");

  const [expandedConv, setExpandedConv] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (restaurantId) params.set("restaurantId", restaurantId);
      if (dateRange !== "all") {
        const days = dateRange === "7d" ? 7 : dateRange === "14d" ? 14 : 30;
        const start = new Date(Date.now() - days * 86400000).toISOString();
        params.set("startDate", start);
      }
      if (languageFilter) params.set("language", languageFilter);
      if (outcomeFilter) params.set("outcome", outcomeFilter);
      params.set("limit", "100");

      const res = await api.get<any>(`/api/conversation-analytics?${params}`);
      setData({
        metrics: res.metrics || {
          totalConversations: 0, avgDuration: 0, completionRate: 0,
          misunderstandingRate: 0, upsellAttemptRate: 0, upsellSuccessRate: 0,
          avgResponseMs: 0, totalValue: 0, sentiment: { positive: 0, neutral: 0, negative: 0 },
        },
        recent: res.recent || [],
        dailyStats: res.dailyStats || [],
        upsellFunnel: res.upsellFunnel || { attempted: 0, accepted: 0 },
        languageBreakdown: res.languageBreakdown || [],
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch AI analytics:", err);
    } finally {
      setLoading(false);
    }
  }, [restaurantId, dateRange, languageFilter, outcomeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const { metrics, recent, dailyStats, upsellFunnel, languageBreakdown } = data || {
    metrics: { totalConversations: 0, avgDuration: 0, completionRate: 0, misunderstandingRate: 0, upsellAttemptRate: 0, upsellSuccessRate: 0, avgResponseMs: 0, totalValue: 0, sentiment: { positive: 0, neutral: 0, negative: 0 } },
    recent: [], dailyStats: [], upsellFunnel: { attempted: 0, accepted: 0 }, languageBreakdown: [],
  };

  // Generate insights
  const insights: string[] = [];
  if (metrics.upsellSuccessRate > 0) {
    const rate = (metrics.upsellSuccessRate * 100).toFixed(0);
    insights.push(`Upsell conversion is ${rate}% — ${Number(rate) > 50 ? "that's excellent 💪" : "room to improve 📈"}`);
  }
  if (languageBreakdown.length > 1) {
    const sorted = [...languageBreakdown].sort((a, b) => b.count - a.count);
    const primary = sorted[0];
    const secondary = sorted[1];
    if (secondary) {
      insights.push(`${secondary.language === "es" ? "Spanish" : secondary.language} conversations are ${Math.round((primary.avgDuration / (secondary.avgDuration || 1) - 1) * 100)}% ${primary.avgDuration > secondary.avgDuration ? "longer" : "shorter"} on average`);
    }
  }
  if (metrics.avgResponseMs > 2000) {
    insights.push(`Avg response time of ${formatMs(metrics.avgResponseMs)} is above target — consider optimizing`);
  }
  if (metrics.completionRate < 0.7 && metrics.totalConversations > 10) {
    insights.push(`${((1 - metrics.completionRate) * 100).toFixed(0)}% abandonment rate needs attention`);
  }

  const dateRangeLabels = { "7d": "7 Days", "14d": "14 Days", "30d": "30 Days", all: "All Time" };

  return (
    <div className="min-h-screen" style={{ background: "#151022" }}>
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
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
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${C.purple}, ${C.purpleLight})`, boxShadow: `0 8px 24px ${C.purple}33` }}
            >
              <MessageSquare className="w-7 h-7" style={{ color: "#fff" }} />
            </motion.div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: "#CBC3DA" }}>AI Performance</h1>
              <p className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: C.dim }}>Conversation Quality Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs" style={{ color: C.dim }}>
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all"
              style={{ background: "rgba(255,255,255,0.06)", color: C.muted, border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <RefreshCw className="w-4 h-4" style={{ opacity: loading ? 0.7 : 1 }} />
              Refresh
            </motion.button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex flex-wrap gap-3 mb-8"
        >
          {/* Date range */}
          <div className="flex gap-2">
            {(["7d", "14d", "30d", "all"] as const).map((r) => (
              <motion.button
                key={r}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setDateRange(r)}
                className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                style={{
                  background: dateRange === r ? C.purple : "rgba(255,255,255,0.04)",
                  color: dateRange === r ? C.white : C.muted,
                  border: `1px solid ${dateRange === r ? C.purple : "rgba(255,255,255,0.08)"}`,
                }}
              >
                {dateRangeLabels[r]}
              </motion.button>
            ))}
          </div>

          {/* Language filter */}
          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ background: "rgba(255,255,255,0.04)", color: C.muted, border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <option value="">All Languages</option>
            <option value="en">English</option>
            <option value="es">Spanish</option>
          </select>

          {/* Outcome filter */}
          <select
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ background: "rgba(255,255,255,0.04)", color: C.muted, border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <option value="">All Outcomes</option>
            <option value="completed">Completed</option>
            <option value="abandoned">Abandoned</option>
          </select>

          {/* Restaurant ID */}
          <input
            type="text"
            placeholder="Restaurant ID (optional)"
            value={restaurantId}
            onChange={(e) => setRestaurantId(e.target.value)}
            className="px-3 py-1.5 rounded-full text-xs font-bold placeholder:font-normal"
            style={{ background: "rgba(255,255,255,0.04)", color: C.white, border: "1px solid rgba(255,255,255,0.08)" }}
          />
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-36 rounded-2xl animate-pulse" style={{ background: "#221D2F", border: "1px solid rgba(255,255,255,0.08)" }} />
            ))}
          </div>
        ) : (
          <>
            {/* Metric cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <MetricCard
                icon={Zap}
                label="Avg Response Time"
                value={formatMs(metrics.avgResponseMs)}
                subtext="First token latency"
                accent={C.yellow}
                delay={0.05}
              />
              <MetricCard
                icon={AlertCircle}
                label="Misunderstanding Rate"
                value={`${(metrics.misunderstandingRate * 100).toFixed(1)}%`}
                subtext="Per conversation"
                accent={C.red}
                delay={0.1}
              />
              <MetricCard
                icon={TrendingUp}
                label="Upsell Success"
                value={metrics.upsellSuccessRate > 0 ? `${(metrics.upsellSuccessRate * 100).toFixed(0)}%` : "—"}
                subtext="When attempted"
                accent={C.green}
                delay={0.15}
              />
              <MetricCard
                icon={CheckCircle}
                label="Completion Rate"
                value={`${(metrics.completionRate * 100).toFixed(1)}%`}
                subtext={`${metrics.totalConversations} total`}
                accent={C.purpleLight}
                delay={0.2}
              />
              <MetricCard
                icon={Clock}
                label="Avg Duration"
                value={formatDuration(metrics.avgDuration)}
                subtext="Per conversation"
                accent={C.orange}
                delay={0.25}
              />
              <MetricCard
                icon={ThumbsUp}
                label="Sentiment Score"
                value={metrics.sentiment.positive + metrics.sentiment.neutral + metrics.sentiment.negative > 0
                  ? `${Math.round((metrics.sentiment.positive / (metrics.sentiment.positive + metrics.sentiment.neutral + metrics.sentiment.negative)) * 100)}%`
                  : "—"}
                subtext="Positive rate"
                accent={C.green}
                delay={0.3}
              />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

              {/* Response time over time */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="p-6 rounded-2xl"
                style={{ background: "#221D2F", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: C.muted }}>
                  Response Time (ms)
                </h3>
                <LineChart
                  data={dailyStats}
                  accessor={(d) => d.avgResponseMs}
                  color={C.yellow}
                  format={(v) => `${Math.round(v)}ms`}
                />
              </motion.div>

              {/* Completion rate trend */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-6 rounded-2xl"
                style={{ background: "#221D2F", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: C.muted }}>
                  Completion Rate
                </h3>
                <LineChart
                  data={dailyStats}
                  accessor={(d) => d.conversations > 0 ? d.completed / d.conversations : 0}
                  color={C.purpleLight}
                  format={(v) => `${Math.round(v * 100)}%`}
                />
              </motion.div>

              {/* Sentiment distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="p-6 rounded-2xl flex flex-col items-center"
                style={{ background: "#221D2F", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <h3 className="text-sm font-bold uppercase tracking-wider mb-2 self-start" style={{ color: C.muted }}>
                  Sentiment Distribution
                </h3>
                <DonutChart
                  positive={metrics.sentiment.positive}
                  neutral={metrics.sentiment.neutral}
                  negative={metrics.sentiment.negative}
                />
                <SentimentLegend
                  positive={metrics.sentiment.positive}
                  neutral={metrics.sentiment.neutral}
                  negative={metrics.sentiment.negative}
                />
              </motion.div>
            </div>

            {/* Bottom row: upsell funnel + language breakdown + insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

              {/* Upsell funnel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-6 rounded-2xl"
                style={{ background: "#221D2F", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: C.muted }}>
                  Upsell Funnel
                </h3>
                <UpsellFunnelChart attempted={upsellFunnel.attempted} accepted={upsellFunnel.accepted} />
              </motion.div>

              {/* Language breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="p-6 rounded-2xl"
                style={{ background: "#221D2F", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: C.muted }}>
                  Language Breakdown
                </h3>
                {languageBreakdown.length === 0 ? (
                  <p className="text-sm" style={{ color: C.dim }}>No data yet</p>
                ) : (
                  <div className="space-y-3">
                    {languageBreakdown.map((lang) => (
                      <div key={lang.language}>
                        <div className="flex justify-between text-xs mb-1" style={{ color: C.muted }}>
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {lang.language === "es" ? "Spanish" : "English"}
                          </span>
                          <span style={{ color: C.purpleLight }}>{lang.count}</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(lang.count / Math.max(...languageBreakdown.map(l => l.count), 1)) * 100}%` }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full rounded-full"
                            style={{ background: `linear-gradient(90deg, ${C.purple}88, ${C.purpleLight}aa)` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs mt-0.5" style={{ color: C.dim }}>
                          <span>Avg {formatDuration(lang.avgDuration)}</span>
                          <span>{Math.round(lang.completionRate * 100)}% completion</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Auto-generated insights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="p-6 rounded-2xl"
                style={{ background: "#221D2F", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: C.muted }}>
                  AI Insights
                </h3>
                {insights.length === 0 ? (
                  <p className="text-sm" style={{ color: C.dim }}>
                    {metrics.totalConversations === 0
                      ? "Need more data to generate insights. Conversational analytics are recorded when orders are placed or abandoned."
                      : "Metrics look healthy — no urgent insights right now."}
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {insights.map((insight, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm" style={{ color: C.readableBody }}>
                        <span style={{ color: C.yellow }}>▸</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            </div>

            {/* Conversation Log */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="rounded-2xl overflow-hidden"
              style={{ background: "#221D2F", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="p-6 pb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: C.muted }}>
                  Conversation Log
                </h3>
                {recent.length === 0 ? (
                  <p className="text-sm text-center py-8" style={{ color: C.dim }}>No conversations recorded yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                          {["Time", "Duration", "Status", "Items", "Value", "Misunderstand", "Upsell", "Sentiment", "Lang"].map((h) => (
                            <th key={h} className="text-left py-2 px-3 font-bold uppercase tracking-wider text-xs" style={{ color: C.dim }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {recent.map((conv) => (
                          <>
                            <tr
                              key={conv.id}
                              className="cursor-pointer transition-colors"
                              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                              onClick={() => setExpandedConv(expandedConv === conv.id ? null : conv.id)}
                            >
                              <td className="py-2.5 px-3" style={{ color: "#CBC3DA" }}>{formatDate(conv.createdAt)}</td>
                              <td className="py-2.5 px-3" style={{ color: C.muted }}>{formatDuration(conv.duration)}</td>
                              <td className="py-2.5 px-3">
                                <span
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
                                  style={{
                                    background: conv.completed ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                                    color: conv.completed ? C.green : C.red,
                                    border: `1px solid ${conv.completed ? C.green : C.red}33`,
                                  }}
                                >
                                  {conv.completed ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                  {conv.completed ? "Completed" : "Abandoned"}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center" style={{ color: C.purpleLight }}>{conv.itemCount}</td>
                              <td className="py-2.5 px-3" style={{ color: C.yellow }}>${conv.totalValue.toFixed(2)}</td>
                              <td className="py-2.5 px-3 text-center" style={{ color: conv.misunderstandingCount > 0 ? C.red : C.muted }}>
                                {conv.misunderstandingCount > 0 ? <AlertCircle className="w-4 h-4 inline" /> : "—"}
                                {conv.misunderstandingCount > 0 ? ` ${conv.misunderstandingCount}` : ""}
                              </td>
                              <td className="py-2.5 px-3">
                                {conv.upsellAttempted ? (
                                  <span className="flex items-center gap-1" style={{ color: C.green }}>
                                    <TrendingUp className="w-3 h-3" />
                                    {conv.upsellAccepted ? "✓" : "✗"}
                                  </span>
                                ) : (
                                  <span style={{ color: C.dim }}>—</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3">
                                {conv.sentiment === "positive" && <ThumbsUp className="w-4 h-4 inline" style={{ color: C.green }} />}
                                {conv.sentiment === "negative" && <ThumbsDown className="w-4 h-4 inline" style={{ color: C.red }} />}
                                {conv.sentiment === "neutral" && <Minus className="w-4 h-4 inline" style={{ color: C.muted }} />}
                              </td>
                              <td className="py-2.5 px-3" style={{ color: C.dim }}>{conv.language.toUpperCase()}</td>
                            </tr>
                            {expandedConv === conv.id && (
                              <tr>
                                <td colSpan={9} className="px-4 py-3" style={{ background: "rgba(0,0,0,0.2)" }}>
                                  <div className="grid grid-cols-2 gap-4 text-xs" style={{ color: C.muted }}>
                                    <div>
                                      <span className="font-bold" style={{ color: C.dim }}>Conv ID:</span>{" "}
                                      <span className="font-mono" style={{ color: C.purpleLight }}>{conv.conversationId}</span>
                                    </div>
                                    <div>
                                      <span className="font-bold" style={{ color: C.dim }}>Restaurant:</span>{" "}
                                      <span>{conv.restaurantId || "default"}</span>
                                    </div>
                                    <div>
                                      <span className="font-bold" style={{ color: C.dim }}>Avg Response:</span>{" "}
                                      <span>{formatMs(conv.avgResponseMs)}</span>
                                    </div>
                                    <div>
                                      <span className="font-bold" style={{ color: C.dim }}>ID:</span>{" "}
                                      <span className="font-mono" style={{ color: C.dim }}>{conv.id}</span>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
