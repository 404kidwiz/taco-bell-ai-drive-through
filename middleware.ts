import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/taco-bell",
  "/pizza",
  "/widget-demo",
  "/login",
  "/register",
  "/api/auth",
  "/kitchen",
  "/kds",
];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow all requests through for now
  // Auth middleware requires backend DB setup
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
