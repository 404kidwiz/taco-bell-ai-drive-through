"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVoiceAI } from "./hooks/useVoiceAI";
import { useCartStore } from "./hooks/useCartStore";
import { useRewards } from "./hooks/useRewards";
import Nav from "@/components/Nav";

const QUICK_ADD_ITEMS = [
  { name: "Crunchy Taco", price: 1.99, icon: "tapas" },
  { name: "Baja Blast", price: 2.49, icon: "local_drink" },
  { name: "Value Meal", price: 5.99, icon: "egg_alt" },
];

const FEATURE_PILLS = [
  { icon: "chat_bubble", label: "Speak Naturally" },
  { icon: "auto_awesome", label: "Smart Suggestions" },
  { icon: "shutter_speed", label: "Ready for Pickup" },
];

const AI_WELCOME = "Welcome to Taco Bell! I see you're back. Would you like your usual?";

function VoiceSection({ onMicClick }: { onMicClick: () => void }) {
  return (
    <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
      {/* Tagline */}
      <h2 className="font-headline font-black text-white text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-none mb-2">
        CRUNCH NOW.<br />TALK LATER.
      </h2>

      {/* Mic Button */}
      <button
        onClick={onMicClick}
        className="mt-8 mb-3 w-20 h-20 rounded-full bg-secondary-container flex items-center justify-center neon-glow-secondary hover:scale-105 active:scale-95 transition-transform"
      >
        <span className="material-symbols-outlined text-3xl text-white">mic</span>
      </button>

      <p className="font-headline font-bold text-white text-base mb-4">START VOICE ORDER</p>

      {/* AI Active indicator */}
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant">
          AI Assistant Active
        </span>
      </div>

      {/* Speech bubble */}
      <div className="relative bg-surface-container rounded-xl rounded-tl-sm p-4 max-w-xs">
        <p className="text-sm font-label text-on-surface leading-relaxed">{AI_WELCOME}</p>
        <div className="absolute -bottom-2 left-6 w-4 h-4 bg-surface-container rotate-45" />
      </div>
    </div>
  );
}

function RewardsCard() {
  const { points } = useRewards();
  return (
    <div className="bg-surface-container rounded-xl p-5 border border-outline/10">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant">Rewards</span>
        <span className="material-symbols-outlined text-secondary-container text-lg">local_fire_department</span>
      </div>
      <p className="text-[10px] font-label text-on-surface-variant mb-0.5">Fire Points</p>
      <div className="flex items-baseline gap-1.5 mb-3">
        <span className="font-headline font-black text-on-surface text-4xl">{points.toLocaleString()}</span>
        <span className="text-sm font-label text-on-surface-variant">PTS</span>
      </div>
      <button className="text-xs font-label font-bold text-primary underline underline-offset-2">VIEW REWARDS</button>
    </div>
  );
}

function QuickAddItem({ name, price, icon }: { name: string; price: number; icon: string }) {
  return (
    <div className="flex items-center justify-between bg-surface-container rounded-full px-4 py-2">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-sm text-primary">{icon}</span>
        <span className="text-xs font-label font-semibold text-on-surface">{name}</span>
      </div>
      <button className="w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center hover:opacity-80 transition-opacity">
        <span className="material-symbols-outlined text-xs text-white">add</span>
      </button>
    </div>
  );
}

function FeaturePills() {
  return (
    <div className="flex flex-wrap gap-2">
      {FEATURE_PILLS.map((pill) => (
        <div
          key={pill.label}
          className="flex items-center gap-1.5 bg-surface-container rounded-full px-3 py-1.5 border border-outline/10"
        >
          <span className="material-symbols-outlined text-xs text-primary">{pill.icon}</span>
          <span className="text-[10px] font-label font-bold text-on-surface-variant">{pill.label}</span>
        </div>
      ))}
    </div>
  );
}

function BottomTabBar({ cartCount, cartTotal }: { cartCount: number; cartTotal: number }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface-dim/95 backdrop-blur-xl border-t border-outline/10 px-4 py-3">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <button className="flex flex-col items-center gap-1 text-primary">
          <span className="material-symbols-outlined text-xl">restaurant_menu</span>
          <span className="text-[10px] font-label font-bold uppercase tracking-wider">Menu</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-secondary-container">
          <span className="material-symbols-outlined text-xl relative">
            shopping_cart
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-secondary-container text-white text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </span>
          <span className="text-[10px] font-label font-bold uppercase tracking-wider">
            Order{cartCount > 0 ? ` (${cartCount})` : ''} • ${cartTotal.toFixed(2)}
          </span>
        </button>
        <button className="flex flex-col items-center gap-1 text-tertiary">
          <span className="material-symbols-outlined text-xl">star</span>
          <span className="text-[10px] font-label font-bold uppercase tracking-wider">Rewards</span>
        </button>
      </div>
    </div>
  );
}

export default function DriveThrough() {
  const [isListening, setIsListening] = useState(false);
  const { connect, disconnect } = useVoiceAI({ onMessage: () => {}, onTranscript: () => {} });
  const { items: cart, addItem } = useCartStore();
  const { points } = useRewards();

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleMicClick = () => {
    if (isListening) disconnect();
    else connect();
    setIsListening((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-surface-dim pb-20 overflow-hidden">
      <Nav />

      <div className="flex flex-col lg:flex-row min-h-screen pt-16">
        {/* ── LEFT SIDE (60%) ── */}
        <div className="flex-1 lg:w-[60%] flex flex-col justify-center px-8 lg:px-16 py-12">
          <VoiceSection onMicClick={handleMicClick} />
        </div>

        {/* ── RIGHT SIDE (40%) ── */}
        <div className="lg:w-[40%] p-6 lg:p-10 flex flex-col gap-6">
          {/* Rewards Card */}
          <Suspense fallback={<div className="h-40 bg-surface-container rounded-xl animate-pulse" />}>
            <RewardsCard />
          </Suspense>

          {/* Quick Add Items */}
          <div className="flex flex-col gap-2">
            {QUICK_ADD_ITEMS.map((item) => (
              <QuickAddItem key={item.name} {...item} />
            ))}
          </div>

          {/* Feature Pills */}
          <FeaturePills />
        </div>
      </div>

      <BottomTabBar cartCount={cartCount} cartTotal={cartTotal} />
    </div>
  );
}
