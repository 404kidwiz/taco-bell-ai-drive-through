"use client";

import Nav from "@/components/Nav";
import Link from "next/link";

// ── Status Progress Rail (Desktop) ──────────────────────────────────────────────
function StatusRail({ step }: { step: 1 | 2 | 3 | 4 }) {
  const steps = [
    { icon: "check", label: "Received", active: false, done: true },
    { icon: "restaurant", label: "In Kitchen", active: true, done: false },
    { icon: "inventory_2", label: "Bagging", active: false, done: false },
    { icon: "sports_motorsports", label: "Ready", active: false, done: false },
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
        <div className="flex-1 bg-primary rounded-full" />
        <div className="w-14" />
        <div className="flex-1 bg-surface-container-highest rounded-full" />
        <div className="w-14" />
        <div className="flex-1 bg-surface-container-highest rounded-full" />
      </div>
    </section>
  );
}

// ── Mobile Status Progress ──────────────────────────────────────────────────────
function MobileStatusProgress() {
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
        <div className="absolute top-4 left-0 w-[40%] h-1 bg-primary-container shadow-[0_0_10px_#6D28FF]" />
        {/* Steps */}
        {[
          { icon: "check", label: "Received", done: true },
          { icon: "restaurant", label: "In Kitchen", active: true },
          { icon: "inventory_2", label: "Bagging" },
          { icon: "check_circle", label: "Ready" },
        ].map((step, i) => (
          <div key={step.label} className="relative flex flex-col items-center gap-3 z-10">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step.done
                  ? "bg-primary-container text-white"
                  : step.active
                  ? "bg-primary-container text-white ring-4 ring-primary-container/20"
                  : "bg-surface-container-highest text-[#494457]"
              }`}
            >
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "FILL 1" }}>
                {step.icon}
              </span>
            </div>
            <span className={`font-label text-[9px] font-bold uppercase tracking-widest ${
              step.done ? "text-primary" : step.active ? "text-primary" : "text-[#494457]"
            }`}>
              {step.label}
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
    { num: "02", text: "Have your order #7742 ready on your screen or tell our team your name." },
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
function RewardsCard() {
  return (
    <div className="bg-gradient-to-br from-primary-container to-surface-container rounded-xl p-6 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <span className="material-symbols-outlined text-8xl text-white">military_tech</span>
      </div>
      <div className="relative z-10 space-y-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 inline-block">
          <span className="font-label text-[10px] font-black text-white uppercase tracking-widest">+150 POINTS</span>
        </div>
        <h3 className="font-headline text-2xl font-bold text-white leading-none">TASTY GAINS EARNED</h3>
        <p className="text-[#e3d7ff] text-sm">You're only 50 points away from a FREE Cheesy Gordita Crunch.</p>
        <button className="w-full py-3 bg-tertiary text-[#412d00] font-label font-black uppercase tracking-widest rounded-full hover:scale-105 transition-transform">
          Save as Favorite
        </button>
      </div>
    </div>
  );
}

// ── Desktop Order Status Page ────────────────────────────────────────────────────
function DesktopOrderStatus() {
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
            #DRV-7742
          </h1>
          <p className="font-body text-xl text-[#CBC3DA] max-w-md mx-auto">
            We're firing up the kitchen. <span className="text-secondary-container font-bold">Your cravings are on the way.</span>
          </p>
        </section>

        {/* Status Rail */}
        <StatusRail step={2} />

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
            <RewardsCard />
          </div>
        </div>

        {/* Order Summary Accordion */}
        <section className="glass-panel rounded-xl p-8 border border-outline/10">
          <button className="w-full flex justify-between items-center mb-6">
            <span className="font-headline text-2xl font-black uppercase tracking-tight text-white">Order Summary</span>
            <span className="material-symbols-outlined text-[#CBC3DA]">expand_more</span>
          </button>
          <div className="space-y-4">
            {[
              { name: "Crunchwrap Supreme", detail: "Beef, No Tomatoes, Extra Sour Cream", price: "$5.49" },
              { name: "Large Baja Blast", detail: "With Ice", price: "$3.19" },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-outline/10 last:border-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg text-primary/30">fastfood</span>
                  </div>
                  <div>
                    <p className="font-bold text-white">{item.name}</p>
                    <p className="text-xs text-[#CBC3DA]">{item.detail}</p>
                  </div>
                </div>
                <span className="font-headline font-bold text-tertiary">{item.price}</span>
              </div>
            ))}
            <div className="flex justify-between items-baseline pt-2">
              <span className="text-[#CBC3DA] font-label">Total with Tax</span>
              <span className="font-headline text-2xl font-bold text-white">$9.24</span>
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
function MobileOrderStatus() {
  return (
    <div className="md:hidden min-h-screen bg-surface-dim pb-32">
      {/* Top App Bar */}
      <header className="flex justify-between items-center px-6 py-4 w-full bg-gradient-to-b from-[#1E192B] to-transparent shadow-[0_20px_40px_rgba(109,40,255,0.12)] sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/checkout" className="text-primary active:scale-95 transition-transform">
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
            #DRV-7742
          </h2>
          <div className="mt-8 flex justify-center gap-3">
            <div className="glass-panel px-6 py-4 rounded-lg flex flex-col items-center border-l-4 border-secondary-container">
              <span className="font-headline font-bold text-2xl text-secondary-container">4-6 MINS</span>
              <span className="font-label text-[10px] uppercase tracking-widest text-[#CBC3DA]">Estimated Wait</span>
            </div>
            <div className="glass-panel px-6 py-4 rounded-lg flex flex-col items-center border-l-4 border-tertiary">
              <span className="font-headline font-bold text-2xl text-tertiary">WINDOW 2</span>
              <span className="font-label text-[10px] uppercase tracking-widest text-[#CBC3DA]">Pickup Lane</span>
            </div>
          </div>
        </section>

        {/* Status Progress */}
        <MobileStatusProgress />

        {/* What Happens Next */}
        <section className="bg-gradient-to-br from-surface-container-high to-surface-container-low p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-[120px] text-tertiary">forward</span>
          </div>
          <div className="relative z-10">
            <h3 className="font-headline font-bold text-lg mb-2 uppercase">What Happens Next</h3>
            <p className="text-[#CBC3DA] text-sm leading-relaxed mb-4">
              Slowly pull forward into <span className="text-white font-bold">LANE 1</span>. Watch the overhead HUD for your <span className="text-secondary-container font-bold">Token #7742</span>.
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
              <p className="text-tertiary font-black text-xl">+150 POINTS</p>
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
            <span className="font-label text-xs text-[#CBC3DA]">2 ITEMS</span>
          </div>
          <div className="space-y-3">
            {[
              { name: "Crunchwrap Supreme", detail: "Beef, Nacho Cheese, Sour Cream", price: "$5.49" },
              { name: "Large Baja Blast", detail: "Refreshing tropical lime soda", price: "$2.89" },
            ].map((item, i) => (
              <div key={i} className="bg-surface-container-high/40 p-4 rounded-xl flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl text-primary/20">fastfood</span>
                </div>
                <div className="flex-1">
                  <h5 className="font-headline font-bold text-sm uppercase">{item.name}</h5>
                  <p className="text-xs text-[#CBC3DA]">{item.detail}</p>
                </div>
                <span className="font-headline font-bold text-white">{item.price}</span>
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

// ── Main Order Status Page ─────────────────────────────────────────────────────
export default function OrderStatusPage() {
  return (
    <>
      <DesktopOrderStatus />
      <MobileOrderStatus />
    </>
  );
}
