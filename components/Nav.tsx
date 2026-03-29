"use client";

import { useCartStore } from "@/app/hooks/useCartStore";
import { useRewards } from "@/app/hooks/useRewards";
import Link from "next/link";

export default function Nav() {
  const { items: cart } = useCartStore();
  const { points } = useRewards();
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <nav className="fixed top-0 w-full z-50 no-border bg-gradient-to-b from-[#1E192B] to-transparent shadow-[0_20px_40px_rgba(109,40,255,0.12)]">
      <div className="flex justify-between items-center px-8 py-6 w-full">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="font-headline font-black text-2xl italic text-primary tracking-tighter">
              NOCTURNAL
            </div>
          </Link>
          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            <Link className="text-[#CBC3DA] font-label text-[12px] font-bold uppercase tracking-widest hover:text-baja-cyan transition-colors duration-300" href="/menu">
              Menu
            </Link>
            <Link className="text-secondary-container font-label text-[12px] font-bold uppercase tracking-widest hover:text-baja-cyan transition-colors duration-300" href="/order-status">
              Order Status
            </Link>
            <Link className="text-[#CBC3DA] font-label text-[12px] font-bold uppercase tracking-widest hover:text-baja-cyan transition-colors duration-300" href="/checkout">
              Pickup
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Account */}
          <button className="scale-95 active:scale-90 transition-transform text-[#CBC3DA] hover:text-baja-cyan">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
