"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/app/hooks/useCartStore";
import { useRewards } from "@/app/hooks/useRewards";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const { items: cart } = useCartStore();
  const { points } = useRewards();

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`
        fixed top-0 inset-x-0 z-50 transition-all duration-300
        ${scrolled
          ? "bg-surface-low/90 glass-blur border-b border-outline/10"
          : "bg-transparent"}
      `}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #6D28FF 0%, #CEBDFF 100%)" }}
          >
            <span className="font-headline text-surface-dim text-lg font-bold leading-none">TB</span>
          </div>
          <span className="font-headline text-white text-xl tracking-widest hidden sm:block">
            TACO BELL
          </span>
        </div>

        {/* Right: Rewards + Cart */}
        <div className="flex items-center gap-4">
          {/* Rewards */}
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary-container text-lg">local_fire_department</span>
            <span className="font-headline font-bold text-on-surface text-sm">{points.toLocaleString()} PTS</span>
            <button className="text-[10px] font-label font-bold text-primary underline underline-offset-2 ml-1">
              REDEEM
            </button>
          </div>

          {/* Cart */}
          <button className="relative w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest transition-colors">
            <span className="material-symbols-outlined text-lg text-on-surface">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-secondary-container text-white text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
