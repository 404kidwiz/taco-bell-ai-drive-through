"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Phone, Car, ArrowRight } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0612] flex flex-col">
      {/* Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 px-6 py-5 flex items-center justify-between"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#6D28FF] to-[#FF6B35] flex items-center justify-center">
            <span className="text-white font-black text-sm">4T</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-sm tracking-tight">404 Technologies</h1>
            <p className="text-[10px] text-[#948DA3] font-medium uppercase tracking-[0.15em]">AI Restaurant Demos</p>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-12">
        {/* Hero Text */}
        <motion.div
          className="text-center mb-12 max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#6D28FF] mb-4">
            Voice AI • Real-Time Ordering • Full Stack
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-none mb-4">
            AI-Powered<br />
            <span className="bg-gradient-to-r from-[#6D28FF] via-[#FF6B35] to-[#e63946] bg-clip-text text-transparent">
              Restaurant Demos
            </span>
          </h2>
          <p className="text-[#948DA3] text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
            Two live demonstrations of conversational AI taking real food orders — one at the drive-through window, one over the phone.
          </p>
        </motion.div>

        {/* Demo Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* Taco Bell Card */}
          <motion.div variants={item}>
            <Link href="/taco-bell" className="group block">
              <div className="relative overflow-hidden rounded-2xl border border-[#6D28FF]/20 bg-gradient-to-br from-[#1a1030] to-[#0d0820] p-8 h-full transition-all duration-500 hover:border-[#6D28FF]/50 hover:shadow-[0_0_40px_rgba(109,40,255,0.15)]">
                {/* Glow */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#6D28FF]/10 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-[#6D28FF]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Car className="text-[#6D28FF]" size={28} />
                  </div>

                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6D28FF] mb-2">Demo 01</p>
                  <h3 className="text-2xl font-black text-white tracking-tight mb-2">
                    Taco Bell<br />AI Drive-Through
                  </h3>
                  <p className="text-[#948DA3] text-sm leading-relaxed mb-6">
                    Pull up to the window. Speak your order. AI handles the rest — real-time voice, smart menu, instant confirmation.
                  </p>

                  <div className="flex items-center gap-2 text-[#6D28FF] text-sm font-bold group-hover:gap-3 transition-all">
                    Try the Drive-Through
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* OrderFlow Pizza Card */}
          <motion.div variants={item}>
            <Link href="/pizza" className="group block">
              <div className="relative overflow-hidden rounded-2xl border border-[#e63946]/20 bg-gradient-to-br from-[#1a0d10] to-[#0d0608] p-8 h-full transition-all duration-500 hover:border-[#e63946]/50 hover:shadow-[0_0_40px_rgba(230,57,70,0.15)]">
                {/* Glow */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#e63946]/10 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-[#e63946]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Phone className="text-[#e63946]" size={28} />
                  </div>

                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e63946] mb-2">Demo 02</p>
                  <h3 className="text-2xl font-black text-white tracking-tight mb-2">
                    OrderFlow Pizza<br />AI Phone Ordering
                  </h3>
                  <p className="text-[#948DA3] text-sm leading-relaxed mb-4">
                    Call in. AI answers 24/7. Takes your order, confirms every detail, sends you a text — all hands-free.
                  </p>

                  <div className="flex items-center gap-2 mb-6 px-4 py-2.5 rounded-lg bg-[#e63946]/10 border border-[#e63946]/20">
                    <Phone size={14} className="text-[#e63946]" />
                    <a
                      href="tel:+17705255393"
                      className="text-[#e63946] font-mono text-sm font-bold tracking-wide"
                      onClick={(e) => e.stopPropagation()}
                    >
                      +1 (770) 525-5393
                    </a>
                  </div>

                  <div className="flex items-center gap-2 text-[#e63946] text-sm font-bold group-hover:gap-3 transition-all">
                    See the Phone Demo
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Footer note */}
        <motion.p
          className="text-[#948DA3]/50 text-xs mt-10 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Built by 404 Technologies · Powered by Voice AI
        </motion.p>
      </div>
    </div>
  );
}
