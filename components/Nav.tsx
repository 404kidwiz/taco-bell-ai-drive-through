"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Menu", href: "#menu" },
  { label: "Kitchen", href: "/kitchen" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className={`
          fixed top-0 inset-x-0 z-50 transition-all duration-500
          ${scrolled
            ? "bg-surface-low/90 backdrop-blur-xl border-b border-white/6"
            : "bg-transparent"}
        `}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #6D28FF 0%, #CEBDFF 100%)" }}>
              <span className="font-display text-[#151022] text-lg font-bold leading-none">TB</span>
              {/* Glow */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ boxShadow: "0 0 16px rgba(109,40,255,0.5)" }} />
            </div>
            <span className="font-display text-white text-xl tracking-widest hidden sm:block">TACO BELL</span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-semibold tracking-wider uppercase text-readable-body hover:text-white transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#voice"
              className="px-5 py-2 rounded-full text-sm font-bold tracking-wider uppercase transition-all duration-200"
              style={{
                background: "#6D28FF",
                color: "white",
                boxShadow: "0 0 20px rgba(109,40,255,0.35)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 0 30px rgba(109,40,255,0.55)")}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 0 20px rgba(109,40,255,0.35)")}
            >
              Order Now
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            aria-label="Toggle menu"
            className="md:hidden p-2 rounded-xl text-white"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 z-40 pt-20 pb-8 px-6 md:hidden"
            style={{ background: "rgba(21,16,34,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex flex-col gap-6">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-2xl font-display tracking-widest uppercase text-readable-body hover:text-white transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#voice"
                className="mt-2 px-6 py-4 rounded-full text-center font-bold text-lg"
                style={{ background: "#6D28FF", color: "white" }}
                onClick={() => setMobileOpen(false)}
              >
                Order Now
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
