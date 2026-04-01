"use client";

import { useState, useEffect } from "react";

interface HealthStatus {
  status: "online" | "degraded" | "offline";
  responseTime: number;
  openaiConfigured: boolean;
}

export function StatusBadge() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [checks, setChecks] = useState<{ ok: boolean; time: number }[]>([]);

  useEffect(() => {
    const checkHealth = async () => {
      const start = Date.now();
      try {
        // Try to reach the API — if it works, system is online
        const res = await fetch("/api/health", { signal: AbortSignal.timeout(5000) });
        const data = await res.json();
        const responseTime = Date.now() - start;
        const ok = data.status === "online" || data.status === "degraded";

        setHealth({
          status: data.status,
          responseTime,
          openaiConfigured: data.details?.openaiConfigured ?? true,
        });
        setChecks((prev) => [...prev.slice(-99), { ok, time: Date.now() }]);
      } catch {
        // API unreachable — check if we can at least reach the static site
        const responseTime = Date.now() - start;
        setHealth({
          status: "offline",
          responseTime,
          openaiConfigured: false,
        });
        setChecks((prev) => [...prev.slice(-99), { ok: false, time: Date.now() }]);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const uptime = checks.length > 0
    ? (checks.filter((c) => c.ok).length / checks.length) * 100
    : 100;

  const statusColor = health?.status === "online"
    ? "bg-green-400"
    : health?.status === "degraded"
    ? "bg-yellow-400"
    : "bg-red-400";

  const statusLabel = health?.status === "online"
    ? "AI Online"
    : health?.status === "degraded"
    ? "Degraded"
    : "Offline";

  return (
    <div className="relative">
      <button
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1a1030]/80 border border-[#6D28FF]/20 hover:border-[#6D28FF]/40 transition-colors backdrop-blur-sm"
      >
        <span className={`w-2 h-2 rounded-full ${statusColor} ${health?.status === "online" ? "animate-pulse" : ""}`} />
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#CBC3DA]">
          {statusLabel} — {uptime.toFixed(1)}%
        </span>
      </button>

      {expanded && health && (
        <div className="absolute top-full mt-2 right-0 w-64 bg-[#1a1030] rounded-xl border border-[#6D28FF]/20 shadow-2xl p-4 z-50 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-white">System Status</span>
            <span className={`text-[9px] font-bold uppercase tracking-wider ${
              health.status === "online" ? "text-green-400" : health.status === "degraded" ? "text-yellow-400" : "text-red-400"
            }`}>
              {health.status}
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#948DA3]">Response Time</span>
              <span className="text-white font-mono">{health.responseTime}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#948DA3]">Uptime</span>
              <span className="text-white font-mono">{uptime.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#948DA3]">Checks</span>
              <span className="text-white font-mono">{checks.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
