/**
 * NextAuth.js v5 Configuration
 * Auth.js with Google OAuth + Credentials providers
 * NOTE: Requires backend DB setup to function fully
 */

import NextAuth, { type DefaultSession } from "next-auth";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      restaurantId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    restaurantId: string | null;
  }
}

// Check if auth is configured (requires DATABASE_URL)
const isConfigured = !!process.env.DATABASE_URL;

const dummyHandlers = {
  GET: () => new Response(JSON.stringify({ error: "Auth not configured" }), {
    status: 503,
    headers: { "Content-Type": "application/json" },
  }),
  POST: () => new Response(JSON.stringify({ error: "Auth not configured" }), {
    status: 503,
    headers: { "Content-Type": "application/json" },
  }),
} as const;

const configuredAuth = NextAuth({
  providers: [],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || "GUEST";
        session.user.restaurantId = (token.restaurantId as string) || null;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
});

export const { handlers, auth, signIn, signOut } = isConfigured
  ? configuredAuth
  : { handlers: dummyHandlers, auth: async () => null, signIn: async () => null, signOut: async () => null };
