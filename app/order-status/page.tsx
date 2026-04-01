"use client";

import Nav from "@/components/Nav";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { API_BASE, api } from "../lib/api";
import { useOrderTracking } from "../hooks/useOrderTracking";
import { playSound, type SoundName } from "../lib/sounds";
import { MuteToggle } from "../components/MuteToggle";

// ── Demo order data ────────────────────────────────────────────────────────────
const DEMO_ORDER_TACO_BELL = {
  id: "demo-tb-001",
  orderNumber: 42,
  items: [
    { id: "1", name: "Crunchwrap Supreme", price: 4.99, quantity: 1, options: [] },
    { id: "2", name: "Doritos Locos Taco", price: 2.49, quantity: 2, options: ["Nacho Cheese"] },
    { id: "3", name: "Baja Blast Freeze", price: 2.99, quantity: 1, options: [] },
  ],
  total: 14.96,
  status: "pending" as const,
  type: "taco-bell" as const,
};

const DEMO_ORDER_PIZZA = {
  id: "demo-pz-001",
  orderNumber: 17,
  items: [
    { id: "1", name: "Large Pepperoni Pizza", price: 14.99, quantity: 1, options: ["Extra Cheese"] },
    { id: "2", name: "Garlic Knots (6pc)", price: 4.99, quantity: 1, options: [] },
    { id: "3", name: "2L Coke", price: 3.49, quantity: 1, options: [] },
  ],
  total: 23.47,
  status: "pending" as const,
  type: "pizza" as const,
};

// ── Types ──────────────────────────────────────────────────────────────────────
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  options?: string[];
}

type OrderType = "taco-bell" | "pizza";

// ── Stage definitions ──────────────────────────────────────────────────────────
interface StageInfo {
  icon: string;
  label: string;
  tacoBellMsg: string;
  pizzaMsg: string;
  tacoBellDetail: string;
  pizzaDetail: string;
}

const STAGES: StageInfo[] = [
  {
    icon: "receipt_long",
    label: "Order Received",
    tacoBellMsg: "Order Received",
    pizzaMsg: "Order Received",
    tacoBellDetail: "Pull forward to Window 1",
    pizzaDetail: "Your order has been sent to the kitchen",
  },
  {
    icon: "restaurant",
    label: "Preparing",
    tacoBellMsg: "Your order is being prepared",
    pizzaMsg: "Your order is being prepared",
    tacoBellDetail: "Pull forward to Window 2",
    pizzaDetail: "Our chefs are making your pizza fresh",
  },
  {
    icon: "inventory_2",
    label: "Ready for Pickup",
    tacoBellMsg: "Ready for Pickup",
    pizzaMsg: "Ready for Pickup",
    tacoBellDetail: "Pull forward to Window 3",
    pizzaDetail: "Your order will be at the counter shortly",
  },
  {
    icon: "check_circle",
    label: "Complete",
    tacoBellMsg: "Enjoy your meal! 🎉",
    pizzaMsg: "Enjoy your meal! 🎉",
    tacoBellDetail: "Thanks for choosing Taco Bell!",
    pizzaDetail: "Thanks for choosing OrderFlow Pizza!",
  },
];

// ── ETA Countdown Component ────────────────────────────────────────────────────
function ETACountdown({ currentStage, orderType }: { currentStage: number; orderType: OrderType }) {
  const baseTime = orderType === "taco-bell" ? 300 : 1200; // 5 min vs 20 min
  const [secondsLeft, setSecondsLeft] = useState(baseTime - currentStage * (baseTime / 4));

  useEffect(() => {
    setSecondsLeft(baseTime - currentStage * (baseTime / 4));
  }, [currentStage, baseTime]);

  useEffect(() => {
    if (currentStage >= 3) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentStage]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  if (currentStage >= 3) {
    return (
      <div className="text-center">
        <span className="font-headline font-bold text-2xl text-green-400">
          {currentStage === 3 ? "Ready for Pickup!" : "Enjoy your meal! 🎉"}
        </span>
      </div>
    );
  }

  return (
    <div className="text-center">
      <span className="font-label text-[10px] uppercase tracking-widest text-[#CBC3DA] block mb-1">
        {orderType === "taco-bell" ? "Ready in" : "Pickup in"}
      </span>
      <span className="font-headline font-bold text-3xl text-white tabular-nums">
        ~{mins}:{secs.toString().padStart(2, "0")}
      </span>
      {secondsLeft === 0 && (
        <span className="block mt-1 text-sm text-green-400 font-bold">
          Your order should be ready!
        </span>
      )}
    </div>
  );
}

// ── Animated Progress Bar ───────────────────────────────────────────────────────
function AnimatedProgress({ currentStage, timestamps }: { currentStage: number; timestamps: string[] }) {
  return (
    <section className="relative py-8">
      {/* Background track */}
      <div className="absolute top-[28px] left-[40px] right-[40px] h-1 bg-surface-container-highest rounded-full" />

      {/* Animated fill */}
      <div
        className="absolute top-[28px] left-[40px] h-1 rounded-full transition-all duration-1000 ease-out"
        style={{
          width: `calc(${currentStage >= 1 ? ((Math.min(currentStage, 3)) / 3) * 100 : 0}% - 80px + 80px)`,
          background: "linear-gradient(90deg, #6D28FF, #F46216)",
          boxShadow: "0 0 12px rgba(109,40,255,0.5)",
        }}
      />

      {/* Stage nodes */}
      <div className="relative flex justify-between px-6">
        {STAGES.map((stage, i) => {
          const isDone = i < currentStage;
          const isCurrent = i === currentStage;
          const isFuture = i > currentStage;

          return (
            <div key={stage.label} className="flex flex-col items-center gap-2 w-1/4">
              {/* Icon circle */}
              <div
                className={`
                  w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-700
                  ${isDone
                    ? "bg-green-500/20 border-green-400 text-green-400 shadow-[0_0_15px_rgba(74,222,128,0.3)]"
                    : isCurrent
                    ? "bg-primary/20 border-primary text-white shadow-[0_0_20px_rgba(109,40,255,0.5)] ring-4 ring-primary/20 animate-pulse"
                    : "bg-surface-container-highest/50 border-[#494457] text-[#494457]"
                  }
                `}
              >
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: isDone || isCurrent ? "FILL 1" : "FILL 0" }}>
                  {isDone ? "check" : stage.icon}
                </span>
              </div>

              {/* Label */}
              <span className={`font-label text-[10px] font-bold uppercase tracking-widest text-center transition-colors duration-500 ${
                isDone ? "text-green-400" : isCurrent ? "text-primary" : "text-[#494457]"
              }`}>
                {stage.label}
              </span>

              {/* Timestamp */}
              {timestamps[i] && (
                <span className="text-[9px] text-[#948DA3] font-mono">{timestamps[i]}</span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Step Details ────────────────────────────────────────────────────────────────
function StepDetails({ currentStage, order, orderType }: { currentStage: number; order: typeof DEMO_ORDER_TACO_BELL | typeof DEMO_ORDER_PIZZA; orderType: OrderType }) {
  const stage = STAGES[currentStage];
  if (!stage) return null;

  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
  const total = order.items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div className="bg-surface-container-low rounded-xl p-6 border border-outline/10 space-y-4">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "FILL 1" }}>
          {stage.icon}
        </span>
        <div>
          <h3 className="font-headline font-bold text-lg text-white">
            {orderType === "taco-bell" ? stage.tacoBellMsg : stage.pizzaMsg}
          </h3>
          <p className="text-[#CBC3DA] text-sm">
            {orderType === "taco-bell" ? stage.tacoBellDetail : stage.pizzaDetail}
          </p>
        </div>
      </div>

      {/* Stage-specific details */}
      {currentStage === 0 && (
        <div className="pl-9 space-y-2">
          <p className="text-sm text-[#CBC3DA]">
            {itemCount} items — <span className="text-tertiary font-bold">${total.toFixed(2)}</span>
          </p>
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-[#948DA3]">{item.quantity}× {item.name}</span>
              <span className="text-white">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      {currentStage === 1 && (
        <div className="pl-9">
          <p className="text-sm text-[#CBC3DA]">
            {order.items[0]
              ? `Your ${order.items[0].name} is being prepared with care`
              : "Your food is being prepared"}
          </p>
          {orderType === "taco-bell" && (
            <p className="text-xs text-primary mt-1">🔥 Kitchen is fired up</p>
          )}
        </div>
      )}

      {currentStage === 2 && (
        <div className="pl-9">
          <p className="text-sm text-[#CBC3DA]">
            {orderType === "taco-bell"
              ? "Pull forward to Window 3 — your order is bagged and waiting"
              : "Head to the counter — your order is boxed up"}
          </p>
        </div>
      )}

      {currentStage === 3 && (
        <div className="pl-9">
          <p className="text-lg">🎉</p>
          <p className="text-sm text-green-400 font-bold">
            {orderType === "taco-bell" ? "Thanks for hitting the Bell!" : "Thanks for choosing OrderFlow Pizza!"}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Order Status Content ────────────────────────────────────────────────────────
function OrderStatusContent() {
  const searchParams = useSearchParams();
  const orderType = (searchParams.get("type") as OrderType) || "taco-bell";
  const demoOrder = orderType === "taco-bell" ? DEMO_ORDER_TACO_BELL : DEMO_ORDER_PIZZA;

  const [currentStage, setCurrentStage] = useState(0);
  const [timestamps, setTimestamps] = useState<string[]>([new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), "", "", ""]);
  const [autoProgress, setAutoProgress] = useState(true);
  const prevStageRef = useRef(0);

  const advanceStage = useCallback(() => {
    if (currentStage >= 3) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setTimestamps((prev) => {
      const next = [...prev];
      next[currentStage + 1] = now;
      return next;
    });
    setCurrentStage((prev) => Math.min(prev + 1, 3));
  }, [currentStage]);

  // Auto-progression
  useEffect(() => {
    if (!autoProgress || currentStage >= 3) return;
    const delay = 15000 + Math.random() * 5000;
    const timer = setTimeout(advanceStage, delay);
    return () => clearTimeout(timer);
  }, [currentStage, autoProgress, advanceStage]);

  // Play sound on stage change
  useEffect(() => {
    if (prevStageRef.current !== currentStage && currentStage > 0) {
      playSound("stage-transition");
      prevStageRef.current = currentStage;
    }
  }, [currentStage]);

  const earnedPoints = Math.floor(demoOrder.total * 10);

  return (
    <div className="min-h-screen bg-surface-dim">
      <Nav />

      {/* Sound toggle - top right */}
      <div className="fixed top-20 right-6 z-50">
        <MuteToggle />
      </div>

      <main className="pt-24 px-4 sm:px-6 pb-32 max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <section className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-container/20 rounded-full border border-primary-container/30">
            <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "FILL 1" }}>check_circle</span>
            <span className="font-label text-xs font-extrabold tracking-[0.2em] uppercase text-primary">
              {currentStage >= 3 ? "Order Complete" : "Order In Progress"}
            </span>
          </div>
          <h1 className="font-headline text-5xl sm:text-7xl font-black tracking-tighter italic text-white drop-shadow-[0_0_15px_rgba(109,40,255,0.5)]">
            #{orderType === "taco-bell" ? "DRV" : "PZA"}-{demoOrder.orderNumber}
          </h1>
          <p className="text-[#CBC3DA] text-lg max-w-md mx-auto">
            {currentStage < 3
              ? orderType === "taco-bell"
                ? "We're firing up the kitchen. Your cravings are on the way."
                : "Your pizza is being made fresh. Hang tight!"
              : "All done! Enjoy."}
          </p>
        </section>

        {/* ETA + Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-surface-container-high rounded-xl p-6 flex items-center gap-5 border-l-4 border-tertiary">
            <div className="w-14 h-14 rounded-full bg-tertiary-container/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-tertiary text-3xl">schedule</span>
            </div>
            <ETACountdown currentStage={currentStage} orderType={orderType} />
          </div>
          <div className="bg-surface-container-high rounded-xl p-6 flex items-center gap-5 border-l-4 border-secondary-container">
            <div className="w-14 h-14 rounded-full bg-secondary-container/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary-container text-3xl">
                {orderType === "taco-bell" ? "drive_eta" : "storefront"}
              </span>
            </div>
            <div>
              <h3 className="font-label text-[10px] font-bold text-[#CBC3DA] uppercase tracking-widest mb-1">
                {orderType === "taco-bell" ? "Pickup Window" : "Pickup Location"}
              </h3>
              <p className="font-headline text-2xl font-bold text-white">
                {orderType === "taco-bell" ? `WINDOW ${Math.min(currentStage + 1, 3)}` : "FRONT COUNTER"}
              </p>
            </div>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="bg-surface-container-low rounded-xl p-6 border border-outline/10">
          <AnimatedProgress currentStage={currentStage} timestamps={timestamps} />
        </div>

        {/* Step Details */}
        <StepDetails currentStage={currentStage} order={demoOrder} orderType={orderType} />

        {/* Demo Controls */}
        <div className="bg-surface-container-low rounded-xl p-5 border border-outline/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-label text-[10px] font-bold uppercase tracking-widest text-[#948DA3]">Demo Controls</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-[#CBC3DA]">Auto-progress</span>
              <button
                onClick={() => setAutoProgress(!autoProgress)}
                className={`w-10 h-5 rounded-full transition-colors relative ${autoProgress ? "bg-primary" : "bg-surface-container-highest"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${autoProgress ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </label>
          </div>
          <div className="flex gap-2">
            <button
              onClick={advanceStage}
              disabled={currentStage >= 3}
              className="px-4 py-2 rounded-lg bg-secondary-container text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-30"
            >
              Skip to Next Stage →
            </button>
            <button
              onClick={() => {
                setCurrentStage(0);
                setTimestamps([new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), "", "", ""]);
                prevStageRef.current = 0;
              }}
              className="px-4 py-2 rounded-lg bg-surface-container-highest text-[#CBC3DA] text-sm font-bold hover:text-white transition-colors"
            >
              Reset Demo
            </button>
            <Link
              href={`/order-status?type=${orderType === "taco-bell" ? "pizza" : "taco-bell"}`}
              className="px-4 py-2 rounded-lg bg-primary/20 text-primary text-sm font-bold hover:bg-primary/30 transition-colors"
            >
              Switch to {orderType === "taco-bell" ? "Pizza" : "Taco Bell"}
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <section className="bg-surface-container-low rounded-xl p-6 border border-outline/10">
          <h3 className="font-headline text-xl font-black uppercase tracking-tight text-white mb-4">Order Summary</h3>
          <div className="space-y-3">
            {demoOrder.items.map((item, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-outline/10 last:border-0">
                <div>
                  <p className="font-bold text-white text-sm">{item.quantity}× {item.name}</p>
                  {item.options && item.options.length > 0 && (
                    <p className="text-xs text-[#948DA3]">{item.options.join(", ")}</p>
                  )}
                </div>
                <span className="font-headline font-bold text-tertiary">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between items-baseline pt-2">
              <span className="text-[#CBC3DA] font-label text-sm">Total with Tax</span>
              <span className="font-headline text-xl font-bold text-white">
                ${(demoOrder.total * 1.085).toFixed(2)}
              </span>
            </div>
          </div>
        </section>

        {/* Rewards */}
        <section className="bg-gradient-to-br from-primary-container to-surface-container rounded-xl p-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="material-symbols-outlined text-8xl text-white">military_tech</span>
          </div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
              <span className="material-symbols-outlined text-tertiary text-3xl" style={{ fontVariationSettings: "FILL 1" }}>military_tech</span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Points Earned</p>
              <p className="font-headline text-3xl font-black text-white">+{earnedPoints} PTS</p>
              <p className="text-xs text-white/50">You&apos;re 50 pts from a free item!</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function OrderStatusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface-dim flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary-container/20 flex items-center justify-center animate-pulse">
            <span className="material-symbols-outlined text-4xl text-primary-container">hourglass_top</span>
          </div>
          <p className="font-label text-[#CBC3DA] text-sm uppercase tracking-widest">Loading your order...</p>
        </div>
      </div>
    }>
      <OrderStatusContent />
    </Suspense>
  );
}
