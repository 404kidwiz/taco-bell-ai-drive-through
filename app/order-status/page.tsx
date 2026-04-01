"use client";

import Nav from "@/components/Nav";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { API_BASE, api } from "../lib/api";
import { useOrderTracking } from "../hooks/useOrderTracking";

// ── ETA Display Component ──────────────────────────────────────────────────────
function ETADisplay({ orderId, status }: { orderId: string; status: string }) {
  const [eta, setEta] = useState<string>("4-6 MINS");

  useEffect(() => {
    if (status === "completed" || status === "ready") {
      setEta("Ready");
      return;
    }

    const fetchETA = async () => {
      try {
        const data = await api.get<{ eta: string }>(`/api/orders/${orderId}/eta`);
        setEta(data.eta);
      } catch {
        // Fallback to default
      }
    };

    fetchETA();
    // Refresh ETA every 30 seconds
    const interval = setInterval(fetchETA, 30000);
    return () => clearInterval(interval);
  }, [orderId, status]);

  return (
    <>
      <span className="font-headline font-bold text-2xl text-secondary-container">{eta}</span>
      <span className="font-label text-[10px] uppercase tracking-widest text-[#CBC3DA]">Estimated Wait</span>
    </>
  );
}

// ── Order Types ───────────────────────────────────────────────────────────────
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  options?: string[];
}

interface Order {
  id: string;
  orderNumber: number;
  items: OrderItem[];
  total: number;
  status: "pending" | "in-progress" | "bagging" | "ready" | "completed";
  specialInstructions?: string;
  customerPhone?: string;
  createdAt: string;
}

// ── Status Progress Rail (Desktop) ──────────────────────────────────────────────
function StatusRail({ step }: { step: 1 | 2 | 3 | 4 }) {
  const steps = [
    { icon: "check", label: "Received", active: false, done: true },
    { icon: "restaurant", label: "In Kitchen", active: step >= 2, done: step > 2 },
    { icon: "inventory_2", label: "Bagging", active: step === 3, done: step > 3 },
    { icon: "sports_motorsports", label: "Ready", active: step === 4, done: false },
  ];

  return (
    <section className="bg-surface-container-low rounded-xl p-10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32" />
      <div className="relative flex justify-between items-center gap-4">
        {steps.map((s, i) => (
          <div key={s.label} className="flex flex-col items-center gap-3 z-10 flex-1">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all ${
                s.done
                  ? "bg-primary border-primary text-white shadow-[0_0_20px_rgba(109,40,255,0.4)]"
                  : s.active
                  ? "bg-secondary-container border-background text-white shadow-[0_0_20px_rgba(244,98,22,0.4)] ring-2 ring-secondary animate-pulse"
                  : "bg-surface-container-highest border-surface-container-highest text-[#494457]"
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: s.done || s.active ? "FILL 1" : "FILL 0" }}>
                {s.icon}
              </span>
            </div>
            <span className={`font-label text-[10px] font-black uppercase tracking-widest ${
              s.done ? "text-primary" : s.active ? "text-secondary-container" : "text-[#494457]"
            }`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
      {/* Progress lines between steps */}
      <div className="absolute top-7 left-[10%] right-[10%] h-[2px] flex">
        <div className={`flex-1 rounded-full ${step >= 2 ? "bg-primary" : "bg-surface-container-highest"}`} />
        <div className="w-14" />
        <div className={`flex-1 rounded-full ${step >= 3 ? "bg-primary" : "bg-surface-container-highest"}`} />
        <div className="w-14" />
        <div className={`flex-1 rounded-full ${step >= 4 ? "bg-primary" : "bg-surface-container-highest"}`} />
      </div>
    </section>
  );
}

// ── Mobile Status Progress ──────────────────────────────────────────────────────
function MobileStatusProgress({ step }: { step: 1 | 2 | 3 | 4 }) {
  return (
    <section className="bg-surface-container-low p-6 rounded-xl">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-headline font-bold text-lg uppercase tracking-tight text-white">Track Your Crave</h3>
        <span className="text-[12px] bg-secondary-container/20 text-secondary-container px-3 py-1 rounded-full font-bold">KITCHEN ACTIVE</span>
      </div>
      <div className="relative flex justify-between">
        {/* Background progress line */}
        <div className="absolute top-4 left-0 w-full h-1 bg-surface-container-highest" />
        {/* Active progress */}
        <div className="absolute top-4 left-0 h-1 bg-primary-container shadow-[0_0_10px_#6D28FF] transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }} />
        {/* Steps */}
        {[
          { icon: "check", label: "Received", done: true },
          { icon: "restaurant", label: "In Kitchen", active: step >= 2 },
          { icon: "inventory_2", label: "Bagging", active: step === 3 },
          { icon: "check_circle", label: "Ready", active: step === 4 },
        ].map((s, i) => (
          <div key={s.label} className="relative flex flex-col items-center gap-3 z-10">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                s.done || (step > i + 1)
                  ? "bg-primary-container text-white"
                  : s.active
                  ? "bg-primary-container text-white ring-4 ring-primary-container/20"
                  : "bg-surface-container-highest text-[#494457]"
              }`}
            >
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "FILL 1" }}>
                {s.icon}
              </span>
            </div>
            <span className={`font-label text-[9px] font-bold uppercase tracking-widest ${
              s.done || step > i + 1 ? "text-primary" : s.active ? "text-primary" : "text-[#494457]"
            }`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── What Happens Next ──────────────────────────────────────────────────────────
function WhatHappensNext() {
  const steps = [
    { num: "01", text: "Stay in the right-hand lane and follow the neon indicators toward Window 2." },
    { num: "02", text: "Have your order number ready on your screen or tell our team your name." },
    { num: "03", text: "Pro-tip: Our AI sensors will recognize your vehicle as you approach." },
  ];

  return (
    <div className="space-y-6">
      <h2 className="font-headline text-2xl font-black uppercase italic tracking-tight flex items-center gap-3">
        <span className="w-8 h-[2px] bg-primary" />
        What Happens Next
      </h2>
      <ul className="space-y-4">
        {steps.map((s) => (
          <li key={s.num} className="flex gap-4">
            <span className="font-headline text-primary-fixed-dim font-bold text-xl">{s.num}</span>
            <p className="text-[#CBC3DA] font-label">{s.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Rewards Mini Card ──────────────────────────────────────────────────────────
function RewardsCard({ points }: { points: number }) {
  return (
    <div className="bg-gradient-to-br from-primary-container to-surface-container rounded-xl p-6 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <span className="material-symbols-outlined text-8xl text-white">military_tech</span>
      </div>
      <div className="relative z-10 space-y-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 inline-block">
          <span className="font-label text-[10px] font-black text-white uppercase tracking-widest">+{points} POINTS</span>
        </div>
        <h3 className="font-headline text-2xl font-bold text-white leading-none">TASTY GAINS EARNED</h3>
        <p className="text-[#e3d7ff] text-sm">You&apos;re only 50 points away from a FREE Cheesy Gordita Crunch.</p>
        <button className="w-full py-3 bg-tertiary text-[#412d00] font-label font-black uppercase tracking-widest rounded-full hover:scale-105 transition-transform">
          Save as Favorite
        </button>
      </div>
    </div>
  );
}

// ── Desktop Order Status Page ────────────────────────────────────────────────────
function DesktopOrderStatus({ order, step, earnedPoints }: { order: Order | null; step: 1 | 2 | 3 | 4; earnedPoints: number }) {
  if (!order) {
    return (
      <div className="hidden md:flex min-h-screen bg-surface-dim items-center justify-center">
        <div className="text-center space-y-4">
          <span className="material-symbols-outlined text-6xl text-[#494457]">receipt_long</span>
          <h1 className="font-headline text-4xl font-black text-white">No Active Order</h1>
          <p className="text-[#CBC3DA] font-label">Head to the menu to start your order.</p>
          <Link href="/menu" className="inline-block py-3 px-8 bg-primary-container text-white font-label font-bold uppercase tracking-widest rounded-full">
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  const orderTotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = orderTotal * 0.085;
  const total = orderTotal + tax;

  return (
    <div className="hidden md:block min-h-screen bg-surface-dim">
      <Nav />

      <main className="pt-24 px-6 pb-32 max-w-6xl mx-auto space-y-10">
        {/* Hero: Order Number */}
        <section className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-container/20 rounded-full border border-primary-container/30">
            <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "FILL 1" }}>check_circle</span>
            <span className="font-label text-xs font-extrabold tracking-[0.2em] uppercase text-primary">Order Confirmed</span>
          </div>
          <h1 className="font-headline text-7xl lg:text-8xl font-black tracking-tighter italic text-white drop-shadow-[0_0_15px_rgba(109,40,255,0.5)]">
            #DRV-{order.orderNumber}
          </h1>
          <p className="font-body text-xl text-[#CBC3DA] max-w-md mx-auto">
            We&apos;re firing up the kitchen. <span className="text-secondary-container font-bold">Your cravings are on the way.</span>
          </p>
        </section>

        {/* Status Rail */}
        <StatusRail step={step} />

        {/* ETA + Lane Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-container-high rounded-xl p-6 flex items-center gap-6 border-l-4 border-tertiary">
            <div className="w-16 h-16 rounded-full bg-tertiary-container/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-tertiary text-4xl">schedule</span>
            </div>
            <div>
              <h3 className="font-label text-xs font-bold text-[#CBC3DA] uppercase tracking-widest mb-1">Pickup ETA</h3>
              <p className="font-headline text-3xl font-bold text-white">4-6 MINS</p>
            </div>
          </div>
          <div className="bg-surface-container-high rounded-xl p-6 flex items-center gap-6 border-l-4 border-secondary-container">
            <div className="w-16 h-16 rounded-full bg-secondary-container/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary-container text-4xl">lan</span>
            </div>
            <div>
              <h3 className="font-label text-xs font-bold text-[#CBC3DA] uppercase tracking-widest mb-1">Lane Guidance</h3>
              <p className="font-headline text-3xl font-bold text-white">WINDOW 2</p>
            </div>
          </div>
        </div>

        {/* What Happens Next + Rewards */}
        <div className="flex flex-col md:flex-row gap-10">
          <div className="flex-grow">
            <WhatHappensNext />
          </div>
          <div className="md:w-80">
            <RewardsCard points={earnedPoints} />
          </div>
        </div>

        {/* Order Summary Accordion */}
        <section className="glass-panel rounded-xl p-8 border border-outline/10">
          <button className="w-full flex justify-between items-center mb-6">
            <span className="font-headline text-2xl font-black uppercase tracking-tight text-white">Order Summary</span>
            <span className="material-symbols-outlined text-[#CBC3DA]">expand_more</span>
          </button>
          <div className="space-y-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-outline/10 last:border-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg text-primary/30">fastfood</span>
                  </div>
                  <div>
                    <p className="font-bold text-white">{item.name}</p>
                    {item.options && item.options.length > 0 && (
                      <p className="text-xs text-[#CBC3DA]">{item.options.join(", ")}</p>
                    )}
                  </div>
                </div>
                <span className="font-headline font-bold text-tertiary">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between items-baseline pt-2">
              <span className="text-[#CBC3DA] font-label">Total with Tax</span>
              <span className="font-headline text-2xl font-bold text-white">${total.toFixed(2)}</span>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-end px-4 pb-6 bg-[#1E192B]/60 backdrop-blur-xl rounded-t-[2rem] shadow-[0_-10px_30px_rgba(109,40,255,0.15)]">
        {[
          { icon: "restaurant", label: "Menu" },
          { icon: "military_tech", label: "Rewards" },
          { icon: "receipt_long", label: "Order", active: true },
          { icon: "person", label: "Profile" },
        ].map((item) => (
          <button
            key={item.label}
            className={`flex flex-col items-center justify-center p-3 transition-all duration-300 active:scale-110 ${
              item.active
                ? "bg-primary-container text-white rounded-full mb-2 shadow-[0_0_15px_rgba(109,40,255,0.6)]"
                : "text-[#CBC3DA] hover:text-baja-cyan"
            }`}
          >
            <span className="material-symbols-outlined text-xl">{item.icon}</span>
            <span className="font-['Manrope'] text-[10px] font-bold tracking-widest uppercase mt-1">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// ── Mobile Order Status Page ────────────────────────────────────────────────────
function MobileOrderStatus({ order, step, earnedPoints }: { order: Order | null; step: 1 | 2 | 3 | 4; earnedPoints: number }) {
  if (!order) {
    return (
      <div className="md:hidden min-h-screen bg-surface-dim flex items-center justify-center pb-32">
        <div className="text-center space-y-4 px-6">
          <span className="material-symbols-outlined text-6xl text-[#494457]">receipt_long</span>
          <h1 className="font-headline text-3xl font-black text-white">No Active Order</h1>
          <p className="text-[#CBC3DA] font-label text-sm">Head to the menu to start your order.</p>
          <Link href="/menu" className="inline-block py-3 px-8 bg-primary-container text-white font-label font-bold uppercase tracking-widest rounded-full">
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  const orderTotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = orderTotal * 0.085;
  const total = orderTotal + tax;

  return (
    <div className="md:hidden min-h-screen bg-surface-dim pb-32">
      {/* Top App Bar */}
      <header className="flex justify-between items-center px-6 py-4 w-full bg-gradient-to-b from-[#1E192B] to-transparent shadow-[0_20px_40px_rgba(109,40,255,0.12)] sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/menu" className="text-primary active:scale-95 transition-transform">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="font-headline uppercase tracking-tighter font-bold text-xl text-primary">Order Status</h1>
        </div>
        <span className="material-symbols-outlined text-primary">support_agent</span>
      </header>

      <main className="px-6 pt-4 space-y-6">
        {/* Hero: Order Identity */}
        <section className="text-center py-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-container/10 to-transparent opacity-30 blur-3xl -z-10" />
          <p className="font-headline font-bold text-[#CBC3DA] tracking-[0.2em] text-xs uppercase mb-2">Current Drive-Through Token</p>
          <h2 className="font-headline font-black text-5xl text-white tracking-tighter neon-glow-primary italic">
            #DRV-{order.orderNumber}
          </h2>
          <div className="mt-8 flex justify-center gap-3">
            <div className="glass-panel px-6 py-4 rounded-lg flex flex-col items-center border-l-4 border-secondary-container">
              <ETADisplay orderId={order.id} status={order.status} />
            </div>
            <div className="glass-panel px-6 py-4 rounded-lg flex flex-col items-center border-l-4 border-tertiary">
              <span className="font-headline font-bold text-2xl text-tertiary">WINDOW 2</span>
              <span className="font-label text-[10px] uppercase tracking-widest text-[#CBC3DA]">Pickup Lane</span>
            </div>
          </div>
        </section>

        {/* Status Progress */}
        <MobileStatusProgress step={step} />

        {/* What Happens Next */}
        <section className="bg-gradient-to-br from-surface-container-high to-surface-container-low p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-[120px] text-tertiary">forward</span>
          </div>
          <div className="relative z-10">
            <h3 className="font-headline font-bold text-lg mb-2 uppercase">What Happens Next</h3>
            <p className="text-[#CBC3DA] text-sm leading-relaxed mb-4">
              Slowly pull forward into <span className="text-white font-bold">LANE 1</span>. Watch the overhead HUD for your <span className="text-secondary-container font-bold">Token #{order.orderNumber}</span>.
            </p>
            <div className="flex items-center gap-3 text-tertiary">
              <span className="material-symbols-outlined text-sm">info</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Baja AI is monitoring your approach</span>
            </div>
          </div>
        </section>

        {/* Rewards Card */}
        <section className="bg-[#1E192B] border border-primary-container/20 p-5 rounded-xl flex items-center justify-between shadow-[inset_0_0_20px_rgba(109,40,255,0.05)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-tertiary/10 rounded-full flex items-center justify-center border border-tertiary/20">
              <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "FILL 1" }}>confirmation_number</span>
            </div>
            <div>
              <h4 className="font-headline font-bold text-sm uppercase">Tasty Gains Earned</h4>
              <p className="text-tertiary font-black text-xl">+{earnedPoints} POINTS</p>
            </div>
          </div>
          <button className="bg-surface-bright p-3 rounded-full hover:bg-primary-container transition-colors active:scale-90 duration-200">
            <span className="material-symbols-outlined text-[#e8def8]">favorite</span>
          </button>
        </section>

        {/* Compact Order Summary */}
        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <h3 className="font-headline font-bold text-lg uppercase tracking-tight">Order Details</h3>
            <span className="font-label text-xs text-[#CBC3DA]">{order.items.length} ITEMS</span>
          </div>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="bg-surface-container-high/40 p-4 rounded-xl flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl text-primary/20">fastfood</span>
                </div>
                <div className="flex-1">
                  <h5 className="font-headline font-bold text-sm uppercase">{item.name}</h5>
                  {item.options && item.options.length > 0 && (
                    <p className="text-xs text-[#CBC3DA]">{item.options.join(", ")}</p>
                  )}
                </div>
                <span className="font-headline font-bold text-white">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-[#1E192B]/60 backdrop-blur-xl rounded-t-[2rem] shadow-[0_-10px_40px_rgba(109,40,255,0.15)]">
        {[
          { icon: "restaurant", label: "Menu" },
          { icon: "shopping_bag", label: "Order" },
          { icon: "Confirmation_Number", label: "Rewards" },
          { icon: "sensors", label: "Track", active: true },
        ].map((item) => (
          <button
            key={item.label}
            className={`flex flex-col items-center justify-center p-3 transition-all active:scale-90 duration-300 ${
              item.active
                ? "bg-primary-container text-white rounded-full shadow-[0_0_15px_rgba(109,40,255,0.5)]"
                : "text-[#CBC3DA]"
            }`}
          >
            <span className="material-symbols-outlined text-xl">{item.icon}</span>
            <span className="font-['Manrope'] text-[10px] font-bold uppercase tracking-widest mt-1">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* AI Voice Bar */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-48 h-1 bg-tertiary opacity-80 rounded-full blur-[2px] animate-pulse" />
    </div>
  );
}

// ── Order Status Content (uses useSearchParams) ────────────────────────────────
function OrderStatusContent() {
  const searchParams = useSearchParams();
  const rawOrderId = searchParams.get("order");
  // Validate: only allow alphanumeric + hyphens, max 64 chars
  const orderId = rawOrderId && /^[a-zA-Z0-9-]{1,64}$/.test(rawOrderId) ? rawOrderId : null;
  const { loadActiveOrders } = useOrderTracking();
  const [order, setOrder] = useState<Order | null>(null);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const esRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 10;
  const BASE_RECONNECT_DELAY = 1000;
  const MAX_RECONNECT_DELAY = 30000;

  // Parse order data from API response
  const parseOrderData = useCallback((orderData: any): Order => {
    const items = typeof orderData.items === "string"
      ? (() => { try { return JSON.parse(orderData.items); } catch { return []; } })()
      : orderData.items;
    return {
      id: orderData.id,
      orderNumber: orderData.orderNumber,
      items: (Array.isArray(items) ? items : []).map((item: any) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        options: item.options || [],
      })),
      total: orderData.total,
      status: orderData.status,
      specialInstructions: orderData.specialInstructions,
      customerPhone: orderData.customerPhone,
      createdAt: new Date(orderData.createdAt).toISOString(),
    };
  }, []);

  // Fetch order on mount
  useEffect(() => {
    if (!orderId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchOrder = async () => {
      setIsLoading(true);
      try {
        const data = await api.get<{ order: Record<string, unknown> }>(`/api/orders/${orderId}`);
        if (cancelled) return;
        const mappedOrder = parseOrderData(data.order);
        if (!cancelled) {
          setOrder(mappedOrder);
          setEarnedPoints(Math.floor(mappedOrder.total * 10));
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch order:", error);
        if (!cancelled) {
          setOrder(null);
          setIsLoading(false);
        }
      }
    };

    fetchOrder();

    return () => {
      cancelled = true;
    };
  }, [orderId, parseOrderData]);

  // SSE connection with exponential backoff reconnection
  const connectSSE = useCallback(() => {
    if (!orderId) return;

    // Close existing connection
    esRef.current?.close();

    const eventSource = new EventSource(`${API_BASE}/api/orders/stream`);
    esRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if ((data.type === "update" || data.type === "new") && data.data.id === orderId) {
          setOrder((prev) => {
            if (!prev) return prev;
            return { ...prev, status: data.data.status };
          });
          // Reset reconnect attempts on successful message
          reconnectAttemptsRef.current = 0;
        }
      } catch (error) {
        console.error("Error parsing SSE event:", error);
      }
    };

    eventSource.onerror = () => {
      console.error("SSE connection lost, attempting reconnect...");
      eventSource.close();

      // Clear any existing reconnect timer
      if (reconnectTimerRef.current) return;

      // Check max attempts
      if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
        console.warn("Max SSE reconnect attempts reached");
        return;
      }

      // Exponential backoff: 1s, 2s, 4s, 8s, 16s, capped at 30s
      const delay = Math.min(
        BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current),
        MAX_RECONNECT_DELAY
      );
      reconnectAttemptsRef.current += 1;

      reconnectTimerRef.current = setTimeout(() => {
        reconnectTimerRef.current = null;
        connectSSE();
      }, delay);
    };
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      connectSSE();
    }
    return () => {
      esRef.current?.close();
      esRef.current = null;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };
  }, [orderId, connectSSE]);

  // Map status to step number
  useEffect(() => {
    if (!order) return;
    switch (order.status) {
      case "pending":
        setStep(1);
        break;
      case "in-progress":
        setStep(2);
        break;
      case "bagging":
        setStep(3);
        break;
      case "ready":
      case "completed":
        setStep(4);
        break;
      default:
        setStep(1);
    }
  }, [order?.status, order]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-dim flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary-container/20 flex items-center justify-center animate-pulse">
            <span className="material-symbols-outlined text-4xl text-primary-container">hourglass_top</span>
          </div>
          <p className="font-label text-[#CBC3DA] text-sm uppercase tracking-widest">Loading your order...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <DesktopOrderStatus order={order} step={step} earnedPoints={earnedPoints} />
      <MobileOrderStatus order={order} step={step} earnedPoints={earnedPoints} />
    </>
  );
}

// ── Main Order Status Page (wraps in Suspense for static export) ───────────────
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
