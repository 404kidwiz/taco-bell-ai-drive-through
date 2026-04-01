"use client";

export type DemoEventType = "user_message" | "ai_response" | "cart_add" | "cart_remove" | "order_placed";

export interface DemoEvent {
  type: DemoEventType;
  timestamp: number;
  data: string;
  responseTimeMs?: number; // for ai_response events: time since last user_message
}

export interface DemoRecording {
  id: string;
  sessionId: string;
  restaurant: "taco-bell" | "pizza";
  startTime: number;
  endTime: number | null;
  events: DemoEvent[];
  completed: boolean;
  // computed stats
  totalDurationMs: number;
  avgResponseTimeMs: number;
  itemsOrdered: string[];
  totalOrderValue: number;
}

const STORAGE_KEY = "demo_recordings";

function generateId(): string {
  return `rec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export class SessionRecorder {
  private recording: DemoRecording;
  private lastUserMessageTime: number | null = null;
  private active = true;

  constructor(restaurant: "taco-bell" | "pizza") {
    this.recording = {
      id: generateId(),
      sessionId: generateId(),
      restaurant,
      startTime: Date.now(),
      endTime: null,
      events: [],
      completed: false,
      totalDurationMs: 0,
      avgResponseTimeMs: 0,
      itemsOrdered: [],
      totalOrderValue: 0,
    };
  }

  recordEvent(type: DemoEventType, data: string) {
    if (!this.active) return;

    const event: DemoEvent = {
      type,
      timestamp: Date.now(),
      data,
    };

    if (type === "user_message") {
      this.lastUserMessageTime = Date.now();
    }

    if (type === "ai_response" && this.lastUserMessageTime) {
      event.responseTimeMs = Date.now() - this.lastUserMessageTime;
    }

    this.recording.events.push(event);

    // Track cart items
    if (type === "cart_add") {
      // data format: "Item Name $X.XX"
      const match = data.match(/(.+?)\s*\$(\d+\.?\d*)/);
      if (match) {
        this.recording.itemsOrdered.push(match[1].trim());
        this.recording.totalOrderValue += parseFloat(match[2]);
      } else {
        this.recording.itemsOrdered.push(data);
      }
    }
    if (type === "cart_remove") {
      const match = data.match(/(.+?)\s*\$(\d+\.?\d*)/);
      if (match) {
        this.recording.totalOrderValue = Math.max(0, this.recording.totalOrderValue - parseFloat(match[2]));
      }
    }
    if (type === "order_placed") {
      this.recording.completed = true;
    }
  }

  stop(): DemoRecording {
    this.active = false;
    this.recording.endTime = Date.now();
    this.recording.totalDurationMs = this.recording.endTime - this.recording.startTime;

    // Calculate avg AI response time
    const responseTimes = this.recording.events
      .filter((e) => e.type === "ai_response" && e.responseTimeMs)
      .map((e) => e.responseTimeMs!);
    this.recording.avgResponseTimeMs =
      responseTimes.length > 0 ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 0;

    return { ...this.recording };
  }

  getId(): string {
    return this.recording.id;
  }

  isCompleted(): boolean {
    return this.recording.completed;
  }
}

// ── Storage helpers ──────────────────────────────────────────────────────────

export function saveRecording(recording: DemoRecording): void {
  const recordings = getRecordings();
  recordings.push(recording);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recordings));
  }
}

export function getRecordings(): DemoRecording[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getRecordingById(id: string): DemoRecording | null {
  return getRecordings().find((r) => r.id === id) || null;
}

export function deleteRecording(id: string): void {
  const recordings = getRecordings().filter((r) => r.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recordings));
  }
}

export function downloadRecordingAsJson(recording: DemoRecording): void {
  const blob = new Blob([JSON.stringify(recording, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `demo-${recording.restaurant}-${new Date(recording.startTime).toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
