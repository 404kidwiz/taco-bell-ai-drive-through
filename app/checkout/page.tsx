"use client";

import { useState, useEffect, useRef } from "react";
import Nav from "@/components/Nav";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "../hooks/useCartStore";
import { useOrderTracking } from "../hooks/useOrderTracking";
import { useRewards } from "../hooks/useRewards";

// ── Progress Tracker ──────────────────────────────────────────────────────────
function ProgressTracker({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center justify-center mb-12">
      <div className="flex items-center gap-4 bg-surface-container-low px-8 py-4 rounded-full">
        {/* Step 1 */}
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 1 ? "bg-primary-container text-white" : "bg-surface-variant text-[#494457]"}`}>
            {step > 1 ? <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "FILL 1" }}>check</span> : "01"}
          </div>
          <span className={`text-xs font-bold uppercase tracking-widest ${step >= 1 ? "text-primary" : "text-[#494457]"}`}>Ordering</span>
        </div>
        <div className={`w-12 h-px ${step >= 2 ? "bg-primary" : "bg-outline-variant"}`} />
        {/* Step 2 */}
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 2 ? "bg-tertiary text-[#412d00] shadow-[0_0_15px_rgba(249,189,66,0.4)]" : "bg-surface-variant text-[#494457]"}`}>
            {step > 2 ? <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "FILL 1" }}>check</span> : "02"}
          </div>
          <span className={`text-xs font-bold uppercase tracking-widest ${step === 2 ? "text-tertiary" : step > 2 ? "text-primary" : "text-[#494457]"}`}>Review</span>
        </div>
        <div className={`w-12 h-px ${step >= 3 ? "bg-primary" : "bg-outline-variant"}`} />
        {/* Step 3 */}
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 3 ? "bg-primary-container text-white" : "bg-surface-variant text-[#494457]"}`}>
            03
          </div>
          <span className={`text-xs font-bold uppercase tracking-widest ${step >= 3 ? "text-primary" : "text-[#494457]"}`}>Pickup</span>
        </div>
      </div>
    </div>
  );
}

// ── Order Item Row ─────────────────────────────────────────────────────────────
function OrderItemRow({ name, price, qty, options }: { name: string; price: number; qty: number; options?: string[] }) {
  return (
    <div className="flex gap-5 items-start">
      <div className="w-20 h-20 rounded-lg bg-surface-container-highest flex-shrink-0 overflow-hidden flex items-center justify-center">
        <span className="material-symbols-outlined text-3xl text-primary/20">fastfood</span>
      </div>
      <div className="flex-grow">
        <div className="flex justify-between">
          <h3 className="font-headline text-lg font-bold uppercase tracking-tight text-white">{name}</h3>
          <span className="font-headline font-bold text-tertiary text-lg">${price.toFixed(2)}</span>
        </div>
        {options && options.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {options.map((opt) => (
              <span key={opt} className="px-2 py-0.5 bg-surface-variant text-[#CBC3DA] text-[10px] font-label font-bold uppercase tracking-widest rounded-full border border-outline/20">
                {opt}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── AI Voice Card ──────────────────────────────────────────────────────────────
function AIVoiceCard({ message }: { message: string }) {
  return (
    <div className="bg-surface-container-high rounded-xl p-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4">
        <span className="flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-baja-cyan opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-baja-cyan" />
        </span>
      </div>
      <h3 className="text-baja-cyan text-[10px] font-black uppercase tracking-[0.3em] mb-4">AI Assistant Active</h3>
      {/* Voice waveform bars */}
      <div className="flex items-end gap-1 h-12 mb-6 justify-center">
        {[4, 8, 12, 9, 14, 12, 6, 10].map((h, i) => (
          <div
            key={i}
            className="w-1.5 rounded-full bg-baja-cyan animate-pulse"
            style={{ height: `${h * 3}px`, animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <div className="p-3 bg-surface-container-lowest rounded-lg border-l-4 border-baja-cyan">
        <p className="text-[#CBC3DA] text-sm italic font-label">&ldquo;{message}&rdquo;</p>
      </div>
    </div>
  );
}

// ── Rewards Summary ─────────────────────────────────────────────────────────────
function RewardsSummary({ earned }: { earned: number }) {
  return (
    <div className="p-5 bg-primary-container/10 border border-primary-container/20 rounded-xl flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(109,40,255,0.4)]">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "FILL 1" }}>stars</span>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Rewards Points</p>
          <p className="font-headline font-bold text-white">+ {earned} Points Earned</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[10px] font-bold text-[#CBC3DA] uppercase tracking-widest">Next Reward</p>
        <div className="w-28 h-1.5 bg-surface-variant rounded-full mt-1 overflow-hidden">
          <div className="h-full bg-primary" style={{ width: "85%" }} />
        </div>
      </div>
    </div>
  );
}

// ── Mobile Order Review ─────────────────────────────────────────────────────────
function MobileCheckout() {
  const [step, setStep] = useState<1 | 2 | 3>(2);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { items: cart, clearCart } = useCartStore();
  const router = useRouter();
  const hasAttemptedSubmit = useRef(false);

  useEffect(() => {
    if (cart.length === 0 && !hasAttemptedSubmit.current) router.replace("/menu");
  }, [cart.length, router]);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = cartTotal * 0.085;
  const total = cartTotal + tax;
  const earnedPoints = Math.floor(total * 10);
  const { createOrder } = useOrderTracking();
  const { addPoints } = useRewards();

  const handleSubmit = async () => {
    if (cart.length === 0) {
      setError("Your cart is empty");
      hasAttemptedSubmit.current = true;
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create order
      const order = await createOrder({
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total: total,
        specialInstructions: specialInstructions,
      });

      // Add rewards points
      addPoints(earnedPoints);

      // Clear cart
      clearCart();

      // Redirect to order status page
      router.push(`/order-status?order=${order.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create order");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="md:hidden min-h-screen bg-surface-dim pb-32">
      {/* Top App Bar */}
      <header className="sticky top-0 z-50 bg-surface-container border-b border-outline/10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/menu" className="text-primary active:scale-95 transition-transform">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="font-headline font-black uppercase tracking-tighter text-xl text-primary">Review Order</h1>
        </div>
        <span className="material-symbols-outlined text-primary">notifications</span>
      </header>

      <div className="px-6 pt-4 space-y-6">
        {/* Progress */}
        <section className="flex items-center justify-between px-2">
          <div className={`flex flex-col items-center gap-1 flex-1 ${step >= 1 ? "opacity-100" : "opacity-30"}`}>
            <div className={`h-1 w-full rounded-full ${step >= 1 ? "bg-primary-container" : "bg-outline-variant"}`} />
            <span className="font-label text-[9px] font-bold uppercase tracking-widest">Ordering</span>
          </div>
          <div className="w-3" />
          <div className={`flex flex-col items-center gap-1 flex-1 ${step >= 2 ? "opacity-100" : "opacity-30"}`}>
            <div className={`h-1 w-full rounded-full ${step >= 2 ? "bg-secondary-container" : "bg-outline-variant"}`} />
            <span className="font-label text-[9px] font-bold uppercase tracking-widest text-secondary-container">Review</span>
          </div>
          <div className="w-3" />
          <div className={`flex flex-col items-center gap-1 flex-1 ${step >= 3 ? "opacity-100" : "opacity-30"}`}>
            <div className={`h-1 w-full rounded-full ${step >= 3 ? "bg-primary-container" : "bg-outline-variant"}`} />
            <span className="font-label text-[9px] font-bold uppercase tracking-widest">Pickup</span>
          </div>
        </section>

        {/* AI Status */}
        <section className="bg-surface-container-low rounded-lg p-4 flex items-center gap-4 border-l-4 border-baja-cyan baja-glow-full">
          <div className="flex items-center gap-1">
            <div className="w-1 h-4 bg-baja-cyan rounded-full animate-pulse" />
            <div className="w-1 h-8 bg-baja-cyan rounded-full animate-pulse" style={{ animationDelay: "0.1s" }} />
            <div className="w-1 h-5 bg-baja-cyan rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
          </div>
          <div>
            <p className="font-label text-[10px] text-baja-cyan font-extrabold uppercase tracking-widest">AI Status</p>
            <p className="font-body text-sm font-medium text-[#e8def8]">Reviewing your order...</p>
          </div>
        </section>

        {/* Order Ticket */}
        <article className="bg-surface-container-low rounded-xl overflow-hidden shadow-xl border border-outline/10">
          <div className="bg-surface-container-highest px-6 py-4 flex justify-between items-center">
            <h2 className="font-headline text-lg font-bold tracking-tight uppercase text-white">Your Order</h2>
            <span className="font-label text-xs font-black bg-primary-container text-white px-3 py-1 rounded-full">TICKET #4029</span>
          </div>
          <div className="p-6 space-y-6">
            {cart.map((item) => (
              <OrderItemRow
                key={item.id}
                name={item.name}
                price={item.price}
                qty={item.quantity}
                options={[]}
              />
            ))}
            {/* Special Instructions */}
            <div className="pt-4 border-t border-outline/20">
              <label className="font-label text-[10px] font-bold uppercase tracking-widest text-outline block mb-2">Special Instructions</label>
              <textarea
                className="w-full bg-surface-container-lowest border-none rounded-lg p-4 text-sm focus:ring-2 focus:ring-secondary-container min-h-[80px] placeholder:text-outline-variant font-label"
                placeholder="e.g., Please leave at the pick-up shelf..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
              />
            </div>
          </div>
        </article>

        {/* Summary */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 w-fit">
            <span className="material-symbols-outlined text-tertiary text-sm" style={{ fontVariationSettings: "FILL 1" }}>stars</span>
            <span className="font-label text-[10px] font-extrabold uppercase tracking-widest text-primary">+{earnedPoints} POINTS EARNED</span>
          </div>
          <div className="space-y-2 px-2">
            <div className="flex justify-between text-sm text-[#CBC3DA]">
              <span className="font-label">Subtotal</span>
              <span className="font-label">${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-[#CBC3DA]">
              <span className="font-label">Tax</span>
              <span className="font-label">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-baseline pt-4 border-t border-outline/10">
              <span className="font-headline text-lg font-bold">TOTAL</span>
              <span className="font-headline text-3xl font-extrabold text-secondary-container neon-glow-secondary">${total.toFixed(2)}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-between gap-4 px-6 pb-10 bg-[#2C273A]/60 backdrop-blur-xl rounded-t-[2rem] pt-4 shadow-[0_-10px_30px_rgba(109,40,255,0.15)]">
        <Link href="/menu" className="flex flex-col items-center justify-center text-[#CBC3DA] bg-surface-bright rounded-full py-4 px-6 w-full hover:brightness-110 transition-all active:scale-98">
          <span className="material-symbols-outlined mb-1">edit</span>
          <span className="font-body font-extrabold uppercase tracking-widest text-xs">Edit Order</span>
        </Link>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || cart.length === 0}
          className={`flex flex-col items-center justify-center bg-gradient-to-br from-primary to-primary-container text-white rounded-full py-4 px-6 w-full shadow-[0_0_20px_rgba(109,40,255,0.5)] hover:brightness-110 transition-all active:scale-98 ${isSubmitting ? "opacity-50" : ""}`}
        >
          {isSubmitting ? "Processing..." : "Confirm & Fire"}
          <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: "FILL 1" }}>local_fire_department</span>
        </button>
      </nav>

      {/* Floating Add More */}
      <div className="fixed bottom-28 right-6 z-40">
        <button className="bg-surface-bright p-4 rounded-full shadow-lg border border-outline/20 flex items-center gap-2 hover:bg-surface-container-highest transition-colors">
          <span className="material-symbols-outlined text-primary">add_circle</span>
          <span className="font-label text-xs font-bold uppercase tracking-widest pr-2">Add More</span>
        </button>
      </div>
    </div>
  );
}

// ── Desktop Checkout ────────────────────────────────────────────────────────────
function DesktopCheckout() {
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { items: cart, clearCart } = useCartStore();
  const router = useRouter();
  const hasAttemptedSubmit = useRef(false);

  useEffect(() => {
    if (cart.length === 0 && !hasAttemptedSubmit.current) router.replace("/menu");
  }, [cart.length, router]);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = cartTotal * 0.085;
  const total = cartTotal + tax;
  const earnedPoints = Math.floor(total * 10);
  const { createOrder } = useOrderTracking();
  const { addPoints } = useRewards();

  const handleSubmit = async () => {
    if (cart.length === 0) {
      setError("Your cart is empty");
      hasAttemptedSubmit.current = true;
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create order
      const order = await createOrder({
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total: total,
        specialInstructions: specialInstructions,
      });

      // Add rewards points
      addPoints(earnedPoints);

      // Clear cart
      clearCart();

      // Redirect to order status page
      router.push(`/order-status?order=${order.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create order");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="hidden md:block min-h-screen bg-surface-dim">
      <Nav />

      <main className="pt-32 pb-40 px-6 md:px-12 max-w-7xl mx-auto w-full">
        {/* Progress Tracker */}
        <ProgressTracker step={2} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Order Summary */}
          <div className="lg:col-span-7 space-y-8">
            {/* Order Card */}
            <div className="bg-surface-container-low rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
              <div className="px-8 py-6 border-b border-outline/20 flex justify-between items-end">
                <h2 className="font-headline text-4xl font-black uppercase tracking-tighter text-primary">Your Order</h2>
                <span className="text-[#CBC3DA] text-sm font-label uppercase tracking-widest">Ticket #4029</span>
              </div>
              <div className="p-8 space-y-10">
                {cart.length > 0 ? (
                  cart.map((item) => (
                    <OrderItemRow key={item.id} name={item.name} price={item.price} qty={item.quantity} options={[]} />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <span className="material-symbols-outlined text-4xl text-[#494457]">shopping_cart</span>
                    <p className="mt-2 text-sm text-[#494457] font-label">No items yet. <a href="/menu" className="text-primary underline">Browse the menu</a></p>
                  </div>
                )}
              </div>

              {/* Special Instructions */}
              <div className="px-8 pb-8">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-outline mb-3">Special Instructions</label>
                <div className="relative">
                  <textarea
                    className="w-full bg-surface-container-lowest border-none rounded-xl p-4 text-[#e8def8] placeholder:text-outline/40 focus:ring-2 focus:ring-secondary-container transition-all min-h-[80px] resize-none font-label"
                    placeholder="E.g., Leave at the third window, extra napkins..."
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                  />
                  <div className="absolute bottom-3 right-3 opacity-20">
                    <span className="material-symbols-outlined text-4xl">edit_note</span>
                  </div>
                </div>
              </div>

              {/* Rewards Summary */}
              <div className="mx-8 mb-8 p-5 bg-primary-container/10 border border-primary-container/20 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(109,40,255,0.4)]">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "FILL 1" }}>stars</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Rewards Points</p>
                    <p className="text-[#e8def8] font-headline font-bold">+ {earnedPoints} Points Earned</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-[#CBC3DA] uppercase tracking-widest">Next Reward</p>
                  <div className="w-32 h-1.5 bg-surface-variant rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: "85%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: AI + Payment */}
          <div className="lg:col-span-5 space-y-6">
            {/* AI Voice Card */}
            <AIVoiceCard message="Reviewing your order for one Cheesy Gordita Crunch with extra cheese, no tomatoes, and a large Baja Blast with light ice. Does everything look correct?" />

            {/* Payment Breakdown */}
            <div className="bg-surface-container-low rounded-xl p-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-outline mb-6">Order Total</h4>
              <div className="space-y-4">
                <div className="flex justify-between text-[#CBC3DA]">
                  <span className="text-sm font-label uppercase tracking-widest">Subtotal</span>
                  <span className="font-bold font-label">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#CBC3DA]">
                  <span className="text-sm font-label uppercase tracking-widest">Tax (8.5%)</span>
                  <span className="font-bold font-label">${tax.toFixed(2)}</span>
                </div>
                <div className="pt-4 border-t border-outline/30 flex justify-between items-end">
                  <span className="text-lg font-headline font-bold uppercase tracking-tight text-white">Total</span>
                  <span className="text-4xl font-headline font-black text-tertiary tracking-tighter">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Primary CTA */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || cart.length === 0}
              className={`w-full py-6 rounded-full bg-gradient-to-br from-secondary-container to-secondary text-white font-headline text-2xl font-black uppercase tracking-widest shadow-[0_15px_40px_rgba(244,98,22,0.3)] hover:shadow-[0_20px_50px_rgba(244,98,22,0.5)] active:scale-[0.98] transition-all relative overflow-hidden group flex items-center justify-center gap-3 ${isSubmitting ? "opacity-50" : ""}`}
            >
              {isSubmitting ? "Processing..." : "Confirm & Fire"}
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "FILL 1" }}>local_fire_department</span>
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>

            {/* Secondary Actions */}
            <div className="flex gap-4">
              <Link href="/menu" className="flex-1 py-4 rounded-full bg-surface-bright border border-outline/20 text-[#CBC3DA] font-label text-xs font-extrabold uppercase tracking-widest hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-lg">edit</span>
                Edit Order
              </Link>
              <Link href="/menu" className="flex-1 py-4 rounded-full bg-surface-bright border border-outline/20 text-[#CBC3DA] font-label text-xs font-extrabold uppercase tracking-widest hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-lg">add</span>
                Add More
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Main Checkout Page ─────────────────────────────────────────────────────────
export default function CheckoutPage() {
  return (
    <>
      <DesktopCheckout />
      <MobileCheckout />
    </>
  );
}
