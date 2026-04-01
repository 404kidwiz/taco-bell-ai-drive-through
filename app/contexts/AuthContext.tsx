"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react";

interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  role: string;
  restaurantId: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  signIn: async () => ({ success: false }),
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") {
      setIsLoading(true);
    } else if (status === "authenticated" && session?.user) {
      setUser({
        id: session.user.id,
        email: session.user.email ?? null,
        name: session.user.name ?? null,
        role: (session.user as any).role ?? "OWNER",
        restaurantId: (session.user as any).restaurantId ?? null,
      });
      setIsLoading(false);
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, [session, status]);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await nextAuthSignIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        return { success: false, error: "Invalid email or password" };
      }

      return { success: true };
    } catch {
      return { success: false, error: "An error occurred during sign in" };
    }
  };

  const signInWithGoogle = async () => {
    await nextAuthSignIn("google", { callbackUrl: "/admin" });
  };

  const signOut = async () => {
    await nextAuthSignOut({ callbackUrl: "/" });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
