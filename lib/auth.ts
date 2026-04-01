/**
 * NextAuth.js v5 Configuration
 * Auth.js with Google OAuth + Credentials providers
 */

import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "../backend/src/db/index.js";
import { users, accounts } from "../backend/src/db/schema.js";
import { eq } from "drizzle-orm";

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

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Find user by email
        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
        });

        if (!user || !user.password) {
          return null;
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          restaurantId: user.restaurantId,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.restaurantId = user.restaurantId;
      }

      // If signing in with Google, link the account
      if (account?.provider === "google" && user) {
        // Check if account already exists
        const existingAccount = await db.query.accounts.findFirst({
          where: (accounts, { and, eq }) =>
            and(
              eq(accounts.provider, "google"),
              eq(accounts.providerAccountId, account.providerAccountId!)
            ),
        });

        if (!existingAccount) {
          await db.insert(accounts).values({
            id: crypto.randomUUID(),
            userId: user.id,
            provider: "google",
            providerAccountId: account.providerAccountId!,
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            expiresAt: account.expires_at,
          });
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.restaurantId = token.restaurantId as string | null;
      }
      return session;
    },

    async signIn({ user, account }) {
      // For credentials, allow direct sign in
      if (account?.provider === "credentials") {
        return true;
      }

      // For Google, ensure user exists in our DB
      if (account?.provider === "google" && user.email) {
        // Check if user exists
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, user.email),
        });

        if (!existingUser) {
          // Create new user
          const newUserId = crypto.randomUUID();
          await db.insert(users).values({
            id: newUserId,
            email: user.email,
            name: user.name,
            role: "OWNER",
            emailVerified: true,
          });
          user.id = newUserId;
        } else {
          user.id = existingUser.id;
        }
      }

      return true;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.AUTH_SECRET,
});
