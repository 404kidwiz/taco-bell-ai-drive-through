"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DemoRecording, getRecordings, deleteRecording } from "@/lib/session-recorder";

type SortKey = "startTime" | "totalDurationMs" | "totalOrderValue";
type RestaurantFilter = "all" | "taco-bell" | "pizza";

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function RecordingsPage() {
  const [recordings, setRecordings] = useState<DemoRecording[]>([]);
  const [filter, setFilter] = useState<RestaurantFilter>("all");
  const [sort, setSort] = useState<SortKey>("startTime");
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    setRecordings(getRecordings());
  }, []);

  const filtered = recordings
    .filter((r) => filter === "all" || r.restaurant === filter)
    .sort((a, b) => {
      const diff = a[sort] - b[sort];
      return sortAsc ? diff : -diff;
    });

  const totalSessions = filtered.length;
  const completedCount = filtered.filter((r) => r.completed).length;
  const avgCompletion = totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0;
  const avgOrderValue = totalSessions > 0 ? (filtered.reduce((s, r) => s + r.totalOrderValue, 0) / totalSessions).toFixed(2) : "0.00";
  const avgResponse = totalSessions > 0 ? Math.round(filtered.reduce((s, r) => s + r.avgResponseTimeMs, 0) / totalSessions) : 0;

  const handleDelete = (id: string) => {
    if (confirm("Delete this recording?")) {
      deleteRecording(id);
      setRecordings(getRecordings());
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0612]">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-[#2a2035]">
        <Link href="/" className="text-[#948DA3] hover:text-white text-sm transition-colors">← Home</Link>
        <h1 className="text-white font-bold text-lg">Demo Recordings</h1>
        <span className="text-[9px] text-[#948DA3]/40 uppercase tracking-widest">404 Technologies</span>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Sessions", value: totalSessions.toString() },
            { label: "Avg Completion", value: `${avgCompletion}%` },
            { label: "Avg Order Value", value: `$${avgOrderValue}` },
            { label: "Avg AI Response", value: `${avgResponse}ms` },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#0d0918] border border-[#2a2035] rounded-xl p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#948DA3] mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex gap-2">
            {(["all", "taco-bell", "pizza"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                  filter === f
                    ? "bg-primary text-white"
                    : "bg-[#1a1525] text-[#948DA3] border border-[#2a2035] hover:text-white"
                }`}
              >
                {f === "all" ? "All" : f === "taco-bell" ? "Taco Bell" : "Pizza"}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {(["startTime", "totalDurationMs", "totalOrderValue"] as const).map((s) => (
              <button
                key={s}
                onClick={() => { if (sort === s) setSortAsc(!sortAsc); else { setSort(s); setSortAsc(false); } }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  sort === s
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-[#1a1525] text-[#948DA3]/50 hover:text-[#948DA3]"
                }`}
              >
                {s === "startTime" ? "Date" : s === "totalDurationMs" ? "Duration" : "Value"} {sort === s ? (sortAsc ? "↑" : "↓") : ""}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#948DA3] text-lg mb-2">No recordings yet</p>
            <p className="text-[#948DA3]/50 text-sm">Complete a demo session to see it here</p>
          </div>
        ) : (
          <div className="bg-[#0d0918] border border-[#2a2035] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2a2035]">
                    {["Date", "Restaurant", "Duration", "Items", "Total", "AI Avg", "Completed", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#948DA3] text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((rec) => (
                    <tr key={rec.id} className="border-b border-[#1a1525] hover:bg-[#1a1525]/50 transition-colors">
                      <td className="px-4 py-3 text-xs text-[#CBC3DA]">{new Date(rec.startTime).toLocaleDateString()} {new Date(rec.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                      <td className="px-4 py-3 text-xs text-white font-bold">{rec.restaurant === "taco-bell" ? "🌮 Taco Bell" : "🍕 Pizza"}</td>
                      <td className="px-4 py-3 text-xs text-[#CBC3DA]">{formatDuration(rec.totalDurationMs)}</td>
                      <td className="px-4 py-3 text-xs text-[#CBC3DA]">{rec.itemsOrdered.length}</td>
                      <td className="px-4 py-3 text-xs text-white font-bold">${rec.totalOrderValue.toFixed(2)}</td>
                      <td className="px-4 py-3 text-xs text-[#4ade80]">{rec.avgResponseTimeMs}ms</td>
                      <td className="px-4 py-3 text-xs">{rec.completed ? "✅" : "❌"}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Link href={`/replay/${rec.id}`} className="text-[10px] font-bold text-primary hover:underline">Replay</Link>
                          <button onClick={() => handleDelete(rec.id)} className="text-[10px] text-[#e63946] hover:underline">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
