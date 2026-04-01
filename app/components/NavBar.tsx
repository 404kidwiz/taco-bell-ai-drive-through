"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Utensils, ShoppingBag, ChefHat, Phone, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageToggle from "./LanguageToggle";

const tacoBellLinks = [
  { href: "#menu", label: "Menu", icon: Utensils },
  { href: "#voice", label: "Voice Order", icon: ShoppingBag },
  { href: "/kitchen", label: "Kitchen Display", icon: ChefHat },
];

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isTacoBell = pathname === "/taco-bell";
  const isPizza = pathname === "/pizza";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Don't show the Taco Bell NavBar on home or pizza pages
  if (!isTacoBell) return null;

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "py-3 glass border-b border-[var(--border)]"
          : "py-5"
      }`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-[#948DA3] hover:text-white transition-colors mr-3">
              <ArrowLeft size={16} />
              <span className="text-xs">Home</span>
            </Link>
            <div className="w-px h-6 bg-[var(--border)]" />
            <div className="flex items-center gap-3 ml-3 group">
              <div className="relative">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, var(--yellow), var(--orange))",
                    boxShadow: "0 4px 16px rgba(255,107,53,0.35)",
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 3C6.5 3 3 6.5 3 10c0 2.5 1.5 4.5 3.5 5.5L12 21l5.5-5.5c2-1 3.5-3 3.5-5.5 0-3.5-3.5-7-10-7z" fill="#0a0612" opacity="0.9"/>
                    <path d="M12 3C6.5 3 3 6.5 3 10c0 0.5 0.1 1 0.2 1.5C5 12 7 14 12 14s7-2 8.8-2.5c0.1-0.5.2-1 .2-1.5 0-3.5-3.5-7-10-7z" fill="#0a0612" opacity="0.7"/>
                    <circle cx="9" cy="9" r="1" fill="#FFD23F"/>
                    <circle cx="12" cy="10" r="1" fill="#FF6B35"/>
                    <circle cx="15" cy="9" r="1" fill="#FFD23F"/>
                  </svg>
                </div>
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  style={{ border: "2px solid var(--yellow)" }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-white leading-none">
                  TACO BELL
                </h1>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--purple)" }}>
                  AI Drive-Through
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {tacoBellLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-[var(--gray-400)] hover:text-white hover:bg-white/5 transition-all duration-200"
              >
                <link.icon size={16} />
                {link.label}
              </a>
            ))}
            <div className="ml-2">
              <LanguageToggle />
            </div>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)" }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="md:hidden glass border-t border-[var(--border)] mt-3 mx-4 rounded-2xl p-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {tacoBellLinks.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-white font-medium"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => setMobileOpen(false)}
              >
                <link.icon size={18} style={{ color: "var(--orange)" }} />
                {link.label}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
