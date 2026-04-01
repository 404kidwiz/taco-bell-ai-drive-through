/**
 * Registration API Route
 * Stubbed — requires backend DB setup to function
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error: "Registration is disabled. Database backend not configured.",
      hint: "Set up the backend database to enable user registration.",
    },
    { status: 503 }
  );
}
