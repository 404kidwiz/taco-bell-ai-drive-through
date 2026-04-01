"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, User, Store, Loader2, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    restaurantName: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        setIsSubmitting(false);
        return;
      }

      setSuccess(true);
      // Redirect to login after short delay
      setTimeout(() => {
        router.push("/login?registered=true");
      }, 2000);
    } catch {
      setError("An error occurred. Please try again.");
    }

    setIsSubmitting(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0612] flex flex-col items-center justify-center px-6">
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#6D28FF]/10 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center relative z-10"
        >
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-400" size={32} />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Account Created!</h2>
          <p className="text-[#948DA3]">Redirecting you to login...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0612] flex flex-col items-center justify-center px-6 py-12">
      {/* Background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#6D28FF]/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6D28FF] to-[#FF6B35] flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-black text-lg">4T</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Create Account</h1>
          <p className="text-[#948DA3] text-sm mt-2">Set up your restaurant dashboard</p>
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3"
          >
            <AlertCircle className="text-red-400 flex-shrink-0" size={18} />
            <p className="text-red-400 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Register form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#e8def8] mb-2">
              Your Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#948DA3]" size={18} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Smith"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#1e192b] border border-[#494457] text-white placeholder-[#948DA3] focus:outline-none focus:border-[#6D28FF] transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#e8def8] mb-2">
              Restaurant Name
            </label>
            <div className="relative">
              <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-[#948DA3]" size={18} />
              <input
                type="text"
                name="restaurantName"
                value={formData.restaurantName}
                onChange={handleChange}
                placeholder="My Taco Shop"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#1e192b] border border-[#494457] text-white placeholder-[#948DA3] focus:outline-none focus:border-[#6D28FF] transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#e8def8] mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#948DA3]" size={18} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#1e192b] border border-[#494457] text-white placeholder-[#948DA3] focus:outline-none focus:border-[#6D28FF] transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#e8def8] mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#948DA3]" size={18} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#1e192b] border border-[#494457] text-white placeholder-[#948DA3] focus:outline-none focus:border-[#6D28FF] transition-colors"
                required
                minLength={8}
              />
            </div>
            <p className="text-[#948DA3] text-xs mt-2">Minimum 8 characters</p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 mt-6 rounded-xl bg-gradient-to-r from-[#6D28FF] to-[#7c3aed] text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Creating account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Login link */}
        <p className="text-center text-[#948DA3] text-sm mt-8">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-[#cebdff] hover:text-[#e8ddff] font-medium transition-colors"
          >
            Sign in
          </a>
        </p>
      </motion.div>
    </div>
  );
}
