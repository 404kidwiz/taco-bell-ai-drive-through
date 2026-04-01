"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { DemoRecording, DemoEvent, getRecordingById, downloadRecordingAsJson } from "@/lib/session-recorder";

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function formatTime(ts: number, start: number): string {
  const diff = ts - start;
  return formatDuration(diff);
}

// ── Timeline Bar ─────────────────────────────────────────────────────────────
function Timeline({ events, startTime, endTime, currentIndex, onSeek }: {
  events: DemoEvent[];
  startTime: number;
  endTime: number;
  currentIndex: number;
  onSeek: (idx: number) => void;
}) {
  const total = endTime - startTime || 1;
  return (
    <div className="w-full bg-[#1a1525] rounded-full h-3 relative cursor-pointer" onClick={(e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      const targetIdx = Math.floor(pct * events.length);
      onSeek(Math.max(0, Math.min(events.length - 1, targetIdx)));
    }}>
      {/* Event markers */}
      {events.map((ev, i) => {
        const pct = ((ev.timestamp - startTime) / total) * 100;
        const color = ev.type === "user_message" ? "#6d28ff" : ev.type === "ai_response" ? "#4ade80" : ev.type === "order_placed" ? "#e63946" : "#948DA3";
        return (
          <div
            key={i}
            className="absolute top-0 h-full rounded-full"
            style={{ left: `${pct}%`, width: "3px", backgroundColor: color, opacity: i <= currentIndex ? 1 : 0.3 }}
          />
        );
      })}
      {/* Progress */}
      {currentIndex >= 0 && events[currentIndex] && (
        <div
          className="absolute top-0 h-full bg-primary/30 rounded-full"
          style={{ width: `${((events[currentIndex].timestamp - startTime) / total) * 100}%` }}
        />
      )}
    </div>
  );
}

// ── Chat Bubble ──────────────────────────────────────────────────────────────
function ReplayBubble({ event, startTime }: { event: DemoEvent; startTime: number }) {
  const isUser = event.type === "user_message";
  const isAI = event.type === "ai_response";

  if (!isUser && !isAI) {
    // System events
    const icons: Record<string, string> = { cart_add: "🛒+", cart_remove: "🗑️", order_placed: "✅" };
    return (
      <div className="flex justify-center my-2">
        <div className="px-3 py-1.5 rounded-full bg-[#1a1525] border border-[#2a2035] text-[11px] text-[#948DA3]">
          {icons[event.type] || "⚡"} {event.data}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div className={`max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
        isUser
          ? "bg-[#6d28ff] text-white rounded-br-sm"
          : "bg-[#1a1525] border border-[#2a2035] text-[#CBC3DA] rounded-bl-sm"
      }`}>
        {isAI && (
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[9px] font-bold uppercase tracking-widest text-primary">AI</span>
            {event.responseTimeMs && (
              <span className="text-[9px] text-[#4ade80]">{event.responseTimeMs}ms</span>
            )}
          </div>
        )}
        {event.data}
        <div className="text-[9px] text-[#948DA3]/50 mt-1">{formatTime(event.timestamp, startTime)}</div>
      </div>
    </div>
  );
}

// ── Main Replay Page ─────────────────────────────────────────────────────────
export default function ReplayPage() {
  const params = useParams();
  const id = params.id as string;
  const [recording, setRecording] = useState<DemoRecording | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [speed, setSpeed] = useState<1 | 2 | 4>(1);
  const [copied, setCopied] = useState(false);
  const playRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const rec = getRecordingById(id);
    setRecording(rec || null);
    if (rec) setCurrentIndex(rec.events.length - 1);
  }, [id]);

  const stopPlay = useCallback(() => {
    setIsPlaying(false);
    if (playRef.current) clearTimeout(playRef.current);
  }, []);

  const startPlay = useCallback(() => {
    if (!recording) return;
    setIsPlaying(true);
    let idx = currentIndex < 0 ? 0 : currentIndex;
    setCurrentIndex(idx);

    const tick = () => {
      if (idx >= recording.events.length) {
        setIsPlaying(false);
        return;
      }
      setCurrentIndex(idx);
      idx++;

      if (idx < recording.events.length) {
        const delay = (recording.events[idx].timestamp - recording.events[idx - 1].timestamp) / speed;
        playRef.current = setTimeout(tick, Math.min(delay, 5000));
      } else {
        setIsPlaying(false);
      }
    };
    tick();
  }, [recording, currentIndex, speed]);

  useEffect(() => {
    return () => { if (playRef.current) clearTimeout(playRef.current); };
  }, []);

  if (!recording) {
    return (
      <div className="min-h-screen bg-[#0a0612] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#948DA3] text-lg mb-4">Recording not found</p>
          <Link href="/recordings" className="text-primary hover:underline">← Back to Recordings</Link>
        </div>
      </div>
    );
  }

  const visibleEvents = recording.events.slice(0, currentIndex + 1);
  const restaurantLabel = recording.restaurant === "taco-bell" ? "Taco Bell" : "Pizza";

  return (
    <div className="min-h-screen bg-[#0a0612]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-xl bg-[#0a0612]/80 border-b border-[#2a2035]">
        <Link href="/recordings" className="text-[#948DA3] hover:text-white text-sm transition-colors">← Recordings</Link>
        <div className="text-center">
          <p className="text-white font-bold text-sm">{restaurantLabel} Demo Replay</p>
          <p className="text-[9px] text-[#948DA3]">{new Date(recording.startTime).toLocaleString()}</p>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:opacity-90 transition-opacity"
        >
          {copied ? "✓ Copied!" : "Share"}
        </button>
      </header>

      <div className="pt-20 pb-40">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* Main chat area */}
          <div>
            {/* Timeline */}
            <div className="mb-6 bg-[#0d0918] border border-[#2a2035] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#948DA3]">Session Timeline</span>
                <span className="text-[10px] text-[#948DA3]">{currentIndex >= 0 ? formatTime(recording.events[currentIndex]?.timestamp || recording.startTime, recording.startTime) : "0:00"} / {formatDuration(recording.totalDurationMs)}</span>
              </div>
              <Timeline
                events={recording.events}
                startTime={recording.startTime}
                endTime={recording.endTime || recording.startTime + recording.totalDurationMs}
                currentIndex={currentIndex}
                onSeek={(idx) => { stopPlay(); setCurrentIndex(idx); }}
              />
              {/* Controls */}
              <div className="flex items-center justify-center gap-4 mt-4">
                <button onClick={() => { stopPlay(); setCurrentIndex(-1); }} className="text-[#948DA3] hover:text-white text-xs">⏮ Reset</button>
                <button
                  onClick={isPlaying ? stopPlay : startPlay}
                  className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                >
                  {isPlaying ? "⏸" : "▶"}
                </button>
                <button
                  onClick={() => { setSpeed((prev) => (prev === 1 ? 2 : prev === 2 ? 4 : 1)); stopPlay(); }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${speed !== 1 ? "bg-[#4ade80]/20 text-[#4ade80]" : "bg-[#1a1525] text-[#948DA3]"}`}
                >
                  {speed}x
                </button>
              </div>
            </div>

            {/* Chat replay */}
            <div className="bg-[#0d0918] border border-[#2a2035] rounded-xl p-4 min-h-[400px] max-h-[600px] overflow-y-auto">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#2a2035]">
                <div className={`w-2 h-2 rounded-full ${recording.completed ? "bg-[#4ade80]" : "bg-[#e63946]"}`} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#948DA3]">
                  {recording.completed ? "Completed" : "Abandoned"}
                </span>
              </div>
              {visibleEvents.map((ev, i) => (
                <ReplayBubble key={i} event={ev} startTime={recording.startTime} />
              ))}
              {visibleEvents.length === 0 && (
                <div className="text-center text-[#948DA3]/50 py-12 text-sm">Press play to start the replay</div>
              )}
            </div>
          </div>

          {/* Stats sidebar */}
          <div className="space-y-4">
            <div className="bg-[#0d0918] border border-[#2a2035] rounded-xl p-5">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4">Session Stats</h3>
              {[
                { label: "Duration", value: formatDuration(recording.totalDurationMs) },
                { label: "Avg AI Response", value: `${recording.avgResponseTimeMs}ms` },
                { label: "Items Ordered", value: recording.itemsOrdered.length.toString() },
                { label: "Order Value", value: `$${recording.totalOrderValue.toFixed(2)}` },
                { label: "Completed", value: recording.completed ? "✅ Yes" : "❌ No" },
                { label: "Total Events", value: recording.events.length.toString() },
                { label: "Restaurant", value: restaurantLabel },
              ].map((stat) => (
                <div key={stat.label} className="flex justify-between py-2 border-b border-[#1a1525] last:border-0">
                  <span className="text-xs text-[#948DA3]">{stat.label}</span>
                  <span className="text-xs text-white font-bold">{stat.value}</span>
                </div>
              ))}
            </div>

            {/* Items list */}
            {recording.itemsOrdered.length > 0 && (
              <div className="bg-[#0d0918] border border-[#2a2035] rounded-xl p-5">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">Items Ordered</h3>
                {recording.itemsOrdered.map((item, i) => (
                  <div key={i} className="text-xs text-[#CBC3DA] py-1">• {item}</div>
                ))}
              </div>
            )}

            <button
              onClick={() => downloadRecordingAsJson(recording)}
              className="w-full py-3 rounded-xl bg-[#1a1525] border border-[#2a2035] text-[#948DA3] text-xs font-bold hover:text-white hover:border-primary/30 transition-colors"
            >
              ↓ Download JSON
            </button>

            <div className="text-center py-3">
              <p className="text-[10px] text-[#948DA3]/30 uppercase tracking-widest">404 Technologies</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
