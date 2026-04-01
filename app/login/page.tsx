"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const { signIn, signInWithGoogle, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await signIn(email, password);

    if (result.success) {
      router.push(callbackUrl);
    } else {
      setError(result.error || "Sign in failed");
    }
    setIsSubmitting(false);
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsSubmitting(true);
    try {
      await signInWithGoogle(callbackUrl);
    } catch (err: any) {
      setError(err.message || "Google sign in failed");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--surface)" }}>
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full opacity-10" style={{ background: "var(--primary-container)" }} />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full opacity-5" style={{ background: "var(--secondary-container)" }} />
      </div>

      <div className="relative w-full max-w-md px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: "var(--primary-container)" }}>
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black" style={{ fontFamily: "Space Grotesk, sans-serif", color: "var(--text)" }}>
              Welcome Back
            </h1>
            <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
              Sign in to your OrderFlow account
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-6 p-4 rounded-xl flex items-center gap-3"
              style={{ background: "var(--error-container)", border: "1px solid var(--error)" }}
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: "var(--error)" }} />
              <p className="text-sm" style={{ color: "var(--error)" }}>{error}</p>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#948DA3]" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl py-3 pl-12 pr-4 text-sm"
                  style={{
                    background: "var(--surface-low)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                  }}
                  placeholder="mario@orderflow.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#948DA3]" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl py-3 pl-12 pr-4 text-sm"
                  style={{
                    background: "var(--surface-low)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                  }}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || authLoading}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ background: "var(--primary-container)" }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: "var(--border)" }} />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 text-xs font-bold" style={{ background: "var(--surface)", color: "var(--text-muted)" }}>
                or continue with
              </span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting || authLoading}
            className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-3 hover:opacity-90 transition-opacity"
            style={{ background: "var(--surface-low)", border: "1px solid var(--border)", color: "var(--text)" }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Footer */}
          <p className="text-center text-sm mt-6" style={{ color: "var(--text-muted)" }}>
            Don&apos;t have an account?{" "}
            <a href="/register" className="font-bold" style={{ color: "var(--primary)" }}>
              Sign up
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--surface)", color: "var(--text)" }}>
        <div className="animate-pulse text-sm" style={{ color: "var(--text-muted)" }}>Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
