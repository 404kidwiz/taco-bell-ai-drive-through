"use client";

import { useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import { useCartStore } from "./hooks/useCartStore";
import { useRewards } from "./hooks/useRewards";

const AI_WELCOME = "Welcome to Taco Bell! I see you're back. Would you like your usual?";

const QUICK_ADD_ITEMS = [
  { name: "CRUNCHY TACO", price: 1.99, tag: "3 for $3.99" },
  { name: "BAJA BLAST FREEZE", price: 2.49, tag: "Cold & Refreshing" },
  { name: "NACHO FRIES BOX", price: 3.99, tag: "Crispy & Hot" },
];

const FEATURE_PILLS = [
  { icon: "chat_bubble", label: "Speak Naturally" },
  { icon: "auto_awesome", label: "AI Smart Menu" },
  { icon: "shutter_speed", label: "Ready for Pickup" },
];

const MENU_ITEMS_ARR = [
  { name: "CRUNCHWRAP SUPREME", price: 4.49, qty: 1 },
  { name: "CHEESY GORDITA CRUNCH", price: 4.29, qty: 1 },
  { name: "Baja Blast Freeze", price: 2.99, qty: 2 },
  { name: "NACHO FRIES", price: 2.99, qty: 1 },
];

// ── Desktop Left Voice Panel ─────────────────────────────────────────────────
function VoicePanel() {
  const [isListening, setIsListening] = useState(false);

  return (
    <div className="flex flex-col justify-center min-h-[calc(100vh-160px)] relative">
      {/* Background wave image effect */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(109,40,255,0.3) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10">
        {/* NOCTURNAL brand */}
        <div className="font-headline font-black text-primary text-xl italic tracking-widest mb-8 uppercase">
          Nocturnal Drive-Through
        </div>

        {/* Tagline */}
        <h1 className="font-headline font-black text-white text-5xl lg:text-6xl xl:text-7xl tracking-tight leading-none mb-6">
          CRUNCH NOW.<br />
          <span className="text-primary">TALK LATER.</span>
        </h1>

        {/* AI Sub tagline */}
        <p className="text-[#CBC3DA] font-label text-base mb-10 max-w-md leading-relaxed">
          Our AI assistant takes your order by voice — no app, no waiting, just fire.
        </p>

        {/* Mic Button Area */}
        <div className="flex flex-col items-start gap-4 mb-8">
          <button
            className="voice-btn-ring w-24 h-24 rounded-full bg-secondary-container flex items-center justify-center neon-glow-secondary hover:scale-105 active:scale-95 transition-transform"
            onClick={() => setIsListening(!isListening)}
          >
            <span className="material-symbols-outlined text-4xl text-white">
              {isListening ? "hearing" : "mic"}
            </span>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-label font-bold uppercase tracking-[0.2em] text-primary">
              {isListening ? "Listening..." : "Tap to Start Voice Order"}
            </span>
            <span className="flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-2 w-2 rounded-full ${isListening ? "bg-baja-cyan opacity-75" : "bg-primary opacity-0"}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isListening ? "bg-baja-cyan" : "bg-primary"}`} />
            </span>
          </div>

          {/* Voice bars (animated) */}
          {isListening && (
            <div className="flex items-end gap-1 h-16 mt-2">
              {[4, 8, 12, 9, 14, 11, 6, 10].map((h, i) => (
                <div
                  key={i}
                  className="w-2 rounded-full bg-baja-cyan animate-pulse"
                  style={{ height: `${h * 4}px`, animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Speech bubble */}
        <div className="relative bg-surface-container-low rounded-xl rounded-tl-sm p-5 max-w-sm border border-outline/10">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "FILL 1" }}>auto_awesome</span>
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-primary">AI Assistant</span>
          </div>
          <p className="text-sm font-label text-[#CBC3DA] leading-relaxed">{AI_WELCOME}</p>
          <div className="absolute -bottom-2 left-8 w-4 h-4 bg-surface-container-low rotate-45 border-b border-r border-outline/10" />
        </div>
      </div>
    </div>
  );
}

// ── Desktop Right Rewards Panel ───────────────────────────────────────────────
function RewardsPanel() {
  return (
    <div className="flex flex-col justify-center min-h-[calc(100vh-160px)] gap-8">
      {/* Rewards Card */}
      <div className="bg-surface-container-low rounded-xl p-6 border border-outline/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-label font-bold uppercase tracking-widest text-[#CBC3DA]">Rewards</span>
          <span className="material-symbols-outlined text-secondary-container text-xl">local_fire_department</span>
        </div>
        <p className="text-[10px] font-label text-[#948DA3] mb-0.5">Fire Points Balance</p>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-headline font-black text-white text-5xl tracking-tighter">
            2,450
          </span>
          <span className="text-sm font-label text-[#948DA3]">PTS</span>
        </div>
        {/* Progress to free item */}
        <div className="w-full h-1.5 bg-surface-container-highest rounded-full mt-2 overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: "85%" }} />
        </div>
        <p className="text-[10px] text-[#948DA3] mt-1.5 font-label">550 pts to next reward</p>

        {/* Quick-add menu items */}
        <div className="mt-6 space-y-3">
          <p className="text-[10px] font-label font-bold uppercase tracking-widest text-[#CBC3DA] mb-3">YOUR QUICK ADD</p>
          {MENU_ITEMS_ARR.map((item) => (
            <div key={item.name} className="flex items-center justify-between bg-surface-container rounded-lg px-4 py-3">
              <div>
                <p className="font-label font-bold text-xs text-white">{item.qty}x {item.name}</p>
                <p className="text-[10px] text-[#948DA3] font-label">${item.price.toFixed(2)}</p>
              </div>
              <button className="w-7 h-7 rounded-full bg-secondary-container flex items-center justify-center hover:opacity-80 transition-opacity">
                <span className="material-symbols-outlined text-xs text-white">add</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Pills */}
      <div className="flex flex-wrap gap-3">
        {FEATURE_PILLS.map((pill) => (
          <div
            key={pill.label}
            className="flex items-center gap-2 bg-surface-container-low rounded-full px-4 py-2.5 border border-outline/10"
          >
            <span className="material-symbols-outlined text-xs text-primary">{pill.icon}</span>
            <span className="text-[11px] font-label font-bold text-[#CBC3DA]">{pill.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Mobile Voice UI ───────────────────────────────────────────────────────────
function MobileVoiceUI() {
  const [isListening, setIsListening] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] gap-8 px-6">
      {/* Brand */}
      <div className="text-center">
        <div className="font-headline font-black text-primary text-lg italic tracking-widest uppercase mb-2">
          Nocturnal
        </div>
        <h1 className="font-headline font-black text-white text-4xl tracking-tight leading-none">
          CRUNCH NOW.<br />TALK LATER.
        </h1>
      </div>

      {/* Mic Button */}
      <button
        className="voice-btn-ring w-32 h-32 rounded-full bg-secondary-container flex items-center justify-center neon-glow-secondary hover:scale-105 active:scale-95 transition-transform"
        onClick={() => setIsListening(!isListening)}
      >
        <span className="material-symbols-outlined text-5xl text-white">
          {isListening ? "hearing" : "mic"}
        </span>
      </button>

      <div className="text-center">
        <p className="font-headline font-bold text-white text-xl mb-2">
          {isListening ? "Listening..." : "START VOICE ORDER"}
        </p>
        <p className="text-xs text-[#CBC3DA] font-label">
          {isListening ? "Speak naturally to order" : "Tap the button to begin"}
        </p>
      </div>

      {/* Voice bars */}
      {isListening && (
        <div className="flex items-end gap-1 h-14">
          {[6, 10, 14, 11, 16, 13, 8, 12].map((h, i) => (
            <div
              key={i}
              className="w-2 bg-baja-cyan rounded-full animate-pulse"
              style={{ height: `${h * 3}px`, animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </div>
      )}

      {/* AI Prompt */}
      <div className="relative bg-surface-container-low rounded-xl rounded-tl-sm p-4 max-w-xs border border-outline/10">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-primary text-xs">auto_awesome</span>
          <span className="text-[10px] font-label font-bold uppercase tracking-widest text-primary">AI</span>
        </div>
        <p className="text-xs font-label text-[#CBC3DA]">{AI_WELCOME}</p>
        <div className="absolute -bottom-2 left-8 w-3 h-3 bg-surface-container-low rotate-45 border-b border-r border-outline/10" />
      </div>
    </div>
  );
}

// ── Bottom Tab Bar ────────────────────────────────────────────────────────────
function BottomTabBar({ cartCount }: { cartCount: number }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1E192B]/60 backdrop-blur-xl rounded-t-[2rem] shadow-[0_-10px_30px_rgba(109,40,255,0.15)]">
      <div className="flex justify-around items-center px-6 pt-4 pb-8 w-full">
        <Link href="/menu" className="flex flex-col items-center justify-center text-[#CBC3DA] opacity-70 font-label text-[12px] font-bold uppercase tracking-widest active:scale-95 transition-all duration-200 hover:opacity-100 hover:text-baja-cyan">
          <span className="material-symbols-outlined text-2xl mb-1">restaurant_menu</span>
          Menu
        </Link>
        <button className="flex flex-col items-center justify-center bg-primary-container text-white rounded-full px-6 py-2.5 shadow-[0_0_15px_rgba(109,40,255,0.5)] font-label text-[12px] font-bold uppercase tracking-widest active:scale-95 transition-all duration-200">
          <span className="material-symbols-outlined text-2xl mb-1">receipt_long</span>
          Order
        </button>
        <button className="flex flex-col items-center justify-center text-[#CBC3DA] opacity-70 font-label text-[12px] font-bold uppercase tracking-widest active:scale-95 transition-all duration-200 hover:opacity-100 hover:text-baja-cyan">
          <span className="material-symbols-outlined text-2xl mb-1">directions_car</span>
          Pickup
        </button>
      </div>
    </div>
  );
}

// ── Main Landing Page ─────────────────────────────────────────────────────────
export default function LandingPage() {
  const { items: cart } = useCartStore();
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="min-h-screen bg-surface-dim pb-28 overflow-hidden">
      <Nav />

      {/* Desktop: split layout (md+) */}
      <div className="hidden md:flex flex-row min-h-screen pt-24">
        {/* Left 55% */}
        <div className="w-[55%] px-8 lg:px-16 xl:px-24">
          <VoicePanel />
        </div>
        {/* Right 45% */}
        <div className="w-[45%] px-6 lg:px-10 xl:px-16">
          <RewardsPanel />
        </div>
      </div>

      {/* Mobile: full-screen voice UI */}
      <div className="md:hidden pt-20">
        <MobileVoiceUI />
      </div>

      <BottomTabBar cartCount={cartCount} />
    </div>
  );
}
