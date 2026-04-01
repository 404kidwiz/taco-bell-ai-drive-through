"use client";

import { useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingCart,
  Utensils,
  Bot,
  BarChart3,
  Settings,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Loader2,
} from "lucide-react";
import Link from "next/link";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { href: "/admin/menu", icon: Utensils, label: "Menu" },
  { href: "/admin/ai-settings", icon: Bot, label: "AI Settings" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/admin/conversations", icon: MessageSquare, label: "Conversations" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0612] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#6D28FF]" size={32} />
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0612] flex">
      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          flex flex-col
          bg-[#151022] border-r border-[#494457]/50
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? "w-20" : "w-64"}
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-[#494457]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6D28FF] to-[#FF6B35] flex items-center justify-center flex-shrink-0">
              <span className="text-white font-black text-sm">4T</span>
            </div>
            {!sidebarCollapsed && (
              <div className="overflow-hidden">
                <h2 className="text-white font-bold text-sm truncate">Admin</h2>
                <p className="text-[#948DA3] text-xs truncate">{user.email}</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden text-[#948DA3] hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl
                  transition-all duration-200
                  ${isActive
                    ? "bg-[#6D28FF]/20 text-[#cebdff]"
                    : "text-[#948DA3] hover:text-white hover:bg-[#1e192b]"
                  }
                `}
              >
                <item.icon size={20} className="flex-shrink-0" />
                {!sidebarCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="p-3 border-t border-[#494457]/50">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[#948DA3] hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm font-medium">Sign Out</span>}
          </button>
        </div>

        {/* Collapse toggle (desktop) */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#1e192b] border border-[#494457] items-center justify-center text-[#948DA3] hover:text-white"
        >
          {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-[#494457]/50 bg-[#151022]">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-[#948DA3] hover:text-white"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D28FF] to-[#FF6B35] flex items-center justify-center">
              <span className="text-white font-black text-xs">4T</span>
            </div>
            <span className="text-white font-bold">Admin</span>
          </div>
          <div className="w-10" />
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
