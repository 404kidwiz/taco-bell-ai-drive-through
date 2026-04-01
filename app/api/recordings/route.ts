import { NextRequest, NextResponse } from "next/server";

// In-memory store for server-side (supplements localStorage for the demo)
const recordingsStore: Map<string, object> = new Map();

export const dynamic = "force-static";

export async function POST(request: NextRequest) {
  try {
    const recording = await request.json();
    if (!recording.id) {
      return NextResponse.json({ error: "Missing recording id" }, { status: 400 });
    }
    recordingsStore.set(recording.id, recording);
    return NextResponse.json({ success: true, id: recording.id });
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}

export async function GET() {
  const recordings = Array.from(recordingsStore.values());
  const stats = {
    total: recordings.length,
    completed: recordings.filter((r: any) => r.completed).length,
    avgResponseTime:
      recordings.length > 0
        ? Math.round(
            recordings.reduce((sum: number, r: any) => sum + (r.avgResponseTimeMs || 0), 0) / recordings.length
          )
        : 0,
    avgOrderValue:
      recordings.length > 0
        ? Math.round(recordings.reduce((sum: number, r: any) => sum + (r.totalOrderValue || 0), 0) / recordings.length * 100) / 100
        : 0,
  };
  return NextResponse.json({ recordings, stats });
}
