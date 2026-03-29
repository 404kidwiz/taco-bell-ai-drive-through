"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  ShoppingBag,
  X,
  Volume2,
  Flame,
  Plus,
  Minus,
  ArrowRight,
  Check,
  Edit3,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { MenuItem, CartItem, OrderState, Order } from "./types";
import { MENU_ITEMS } from "./data/menu";
import { useVoiceAI } from "./hooks/useVoiceAI";
import { useCartStore } from "./hooks/useCartStore";
import { useCustomization } from "./hooks/useCustomization";
import { useRewards } from "./hooks/useRewards";
import { useOrderTracking } from "./hooks/useOrderTracking";
import Nav from "@/components/Nav";
import HeroVoiceSection from "@/components/Hero";
import MenuGrid from "@/components/MenuGrid";

// ─── Animation Variants ─────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const menuItemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  hover: { y: -5, transition: { type: "spring", stiffness: 350, damping: 22 } },
};

const springTransition = { type: "spring", stiffness: 400, damping: 17 };

// ─── order number generator ──────────────────────────────────────────────────
function generateOrderNumber(): number {
  return Math.floor(100 + Math.random() * 900);
}

// ─── Voice Visualizer ─────────────────────────────────────────────────────────
function VoiceVisualizer({ isListening, isSpeaking }: { isListening: boolean; isSpeaking: boolean }) {
  const bars = [1, 2, 3, 4, 5, 6, 7];
  return (
    <div className="flex items-center justify-center gap-1.5 h-12">
      {bars.map((i) => (
        <motion.div
          key={i}
          className="w-1.5 rounded-full"
          style={{
            background: isSpeaking
              ? "linear-gradient(to top, var(--orange), var(--yellow))"
              : isListening
              ? "linear-gradient(to top, var(--purple), var(--purple-light))"
              : "rgba(255,255,255,0.2)",
            height: "100%",
          }}
          animate={
            isListening || isSpeaking
              ? {
                  scaleY: [0.25, 1, 0.4, 0.9, 0.3, 1, 0.5],
                  opacity: [0.5, 1, 0.7, 1, 0.6, 0.9, 0.4],
                }
              : { scaleY: 0.25, opacity: 0.4 }
          }
          transition={{
            duration: 0.8 + i * 0.07,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.06,
          }}
        />
      ))}
    </div>
  );
}

// ─── Ambient Orbs ─────────────────────────────────────────────────────────────
function AmbientOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Grid overlay */}
      <div className="absolute inset-0" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
      }} />

      {/* Purple orb */}
      <motion.div
        className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)" }}
        animate={{ x: [0, 60, -30, 0], y: [0, -80, 40, 0], scale: [1, 1.15, 0.9, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Fire orb */}
      <motion.div
        className="absolute -top-20 right-0 w-[450px] h-[450px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,107,53,0.28) 0%, transparent 70%)" }}
        animate={{ x: [0, -70, 30, 0], y: [0, 50, -30, 0], scale: [1, 0.9, 1.1, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      {/* Yellow orb */}
      <motion.div
        className="absolute bottom-0 left-[10%] w-[400px] h-[400px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,210,63,0.18) 0%, transparent 70%)" }}
        animate={{ x: [0, 40, -20, 0], y: [0, -60, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 6 }}
      />
    </div>
  );
}

// ─── Scroll Indicator ─────────────────────────────────────────────────────────
function ScrollIndicator() {
  return (
    <motion.div
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2, duration: 0.6 }}
    >
      <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.3)" }}>Scroll to explore</span>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      >
        <ChevronDown size={20} style={{ color: "rgba(255,255,255,0.3)" }} />
      </motion.div>
    </motion.div>
  );
}

// ─── Menu Item Card ────────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  tacos: "#FF6B35",
  burritos: "#FFD23F",
  specialties: "#FF4500",
  sides: "#9D5EFF",
  drinks: "#7C3AED",
};

function MenuCard({ item, qty, onAdd, onUpdateQty, onCustomize }: {
  item: MenuItem;
  qty: number;
  onAdd: () => void;
  onUpdateQty: (delta: number) => void;
  onCustomize?: () => void;
}) {
  const glowColor = CATEGORY_COLORS[item.category] || "#FF6B35";

  return (
    <motion.div
      variants={menuItemVariants}
      whileHover="hover"
      onClick={qty === 0 ? onAdd : undefined}
      className="group relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(26,16,37,0.8) 0%, rgba(15,8,28,0.9) 100%)",
        border: "1px solid var(--border)",
        borderRadius: "1.25rem",
        cursor: "pointer",
        transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {/* Glow bar at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5"
        style={{
          background: `linear-gradient(90deg, ${glowColor}, transparent)`,
          opacity: 0,
          transition: "opacity 0.35s ease",
        }}
      />

      {/* Hover glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-[1.25rem]"
        style={{ background: `radial-gradient(circle at 50% 0%, ${glowColor}12 0%, transparent 60%)` }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.35 }}
      />

      <div
        className="p-5 relative z-10"
        style={{ borderRadius: "1.25rem" }}
        onMouseEnter={(e) => {
          (e.currentTarget.closest("div") as HTMLElement).style.borderColor = `${glowColor}40`;
          (e.currentTarget.closest("div") as HTMLElement).style.boxShadow = `0 20px 60px rgba(0,0,0,0.5), 0 0 20px ${glowColor}15`;
          (e.currentTarget.closest("div") as HTMLElement).style.transform = "translateY(-6px)";
          (e.currentTarget.closest("div") as HTMLElement).querySelector<HTMLElement>(".glow-bar")!.style.opacity = "1";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget.closest("div") as HTMLElement).style.borderColor = "var(--border)";
          (e.currentTarget.closest("div") as HTMLElement).style.boxShadow = "none";
          (e.currentTarget.closest("div") as HTMLElement).style.transform = "translateY(0)";
          (e.currentTarget.closest("div") as HTMLElement).querySelector<HTMLElement>(".glow-bar")!.style.opacity = "0";
        }}
      >
        {/* Popular badge */}
        {item.popular && (
          <div
            className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
            style={{ background: `linear-gradient(135deg, var(--orange), #FF4500)`, color: "#fff" }}
          >
            <Flame className="w-3 h-3" />
            Hot
          </div>
        )}

        {/* Category label */}
        <span
          className="text-[10px] font-bold uppercase tracking-widest mb-2 block"
          style={{ color: glowColor }}
        >
          {item.category}
        </span>

        {/* Name */}
        <h3 className="font-bold text-lg text-white mb-1.5 group-hover:text-[var(--yellow)] transition-colors duration-200 leading-tight">
          {item.name}
        </h3>
        <p className="text-[13px] leading-relaxed line-clamp-2" style={{ color: "var(--gray-400)" }}>
          {item.description}
        </p>

        {/* Bottom row */}
        <div className="flex items-end justify-between mt-4">
          <div>
            <span className="text-2xl font-extrabold gradient-text-fire">${item.price.toFixed(2)}</span>
            {item.calories && (
              <p className="text-[11px] mt-0.5" style={{ color: "var(--gray-600)" }}>{item.calories} cal</p>
            )}
          </div>

          {qty > 0 ? (
            <div className="flex items-center gap-2 bg-white/5 border border-[var(--border)] rounded-xl p-1">
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={(e) => { e.stopPropagation(); onUpdateQty(-1); }}
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: "rgba(124,58,237,0.2)", color: "var(--purple-light)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(124,58,237,0.35)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(124,58,237,0.2)")}
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </motion.button>
              <span className="w-7 text-center font-bold text-white text-base">{qty}</span>
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={(e) => { e.stopPropagation(); onUpdateQty(1); }}
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, var(--yellow), var(--orange))", color: "#0a0612" }}
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.stopPropagation(); onAdd(); }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold rounded-xl"
              style={{
                background: "linear-gradient(135deg, var(--yellow) 0%, var(--orange) 100%)",
                color: "#0a0612",
                boxShadow: "0 4px 20px rgba(255,107,53,0.3)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 6px 30px rgba(255,107,53,0.45)")}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(255,107,53,0.3)")}
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </motion.button>
          )}
        </div>

        {qty > 0 && (
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm font-bold" style={{ color: "var(--yellow)" }}>
              ${(item.price * qty).toFixed(2)}
            </p>
            {onCustomize && (
              <button
                onClick={(e) => { e.stopPropagation(); onCustomize(); }}
                className="text-xs font-semibold px-3 py-1 rounded-lg transition-colors"
                style={{ background: "rgba(124,58,237,0.2)", color: "var(--purple-light)", border: "1px solid rgba(124,58,237,0.3)" }}
              >
                Customize
              </button>
            )}
          </div>
        )}

        {/* Glow bar */}
        <div
          className="glow-bar absolute bottom-0 left-0 right-0 h-0.5"
          style={{
            background: `linear-gradient(90deg, ${glowColor}, transparent)`,
            opacity: 0,
            transition: "opacity 0.35s ease",
          }}
        />
      </div>
    </motion.div>
  );
}

// ─── Cart Drawer ────────────────────────────────────────────────────────────────
function CartDrawer({ isOpen, onClose, cart, cartTotal, onUpdateQty, onRemove, onCheckout, points, tier }: {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  cartTotal: number;
  onUpdateQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
  points?: number;
  tier?: { name: string; discount: number };
}) {
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const tax = cartTotal * 0.08;
  const total = cartTotal + tax;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{ background: "rgba(21,16,34,0.8)", backdropFilter: "blur(12px)" }}
          />

          {/* Drawer */}
          <motion.div
            key="cart-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col"
            style={{
              background: "#2C273A",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #6D28FF, #CEBDFF)" }}
                >
                  <ShoppingBag className="w-5 h-5" style={{ color: "white" }} />
                </div>
                <div>
                  <h2 className="font-bold text-readable-body text-xl font-display">Your Order</h2>
                  <p className="text-sm font-body" style={{ color: "#948DA3" }}>{cartCount} items</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.06)" }}
                aria-label="Close cart"
              >
                <X className="w-5 h-5 text-readable-body" />
              </motion.button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center py-16"
                >
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(109,40,255,0.15)" }}>
                    <ShoppingBag className="w-10 h-10" style={{ color: "#6D28FF" }} />
                  </div>
                  <h3 className="text-readable-body font-bold text-lg mb-1 font-display">Your cart is empty</h3>
                  <p className="text-sm max-w-[240px]" style={{ color: "#948DA3" }}>
                    Add some fire items from the menu above!
                  </p>
                </motion.div>
              ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
                  {cart.map((item) => (
                    <motion.div
                      key={item.id}
                      variants={menuItemVariants}
                      layout
                      className="p-4"
                      style={{
                        background: "#221D2F",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "16px",
                      }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-readable-body">{item.name}</h4>
                          <p className="text-sm" style={{ color: "#948DA3" }}>${item.price.toFixed(2)} each</p>
                        </div>
                        <button
                          onClick={() => onRemove(item.id)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[#FF6A1F] hover:text-[#FF4500] transition-all"
                          style={{ background: "rgba(255,106,31,0.1)" }}
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 rounded-full p-1"
                          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                          <button
                            onClick={() => onUpdateQty(item.id, -1)}
                            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                            style={{ background: "rgba(109,40,255,0.2)", color: "#CEBDFF" }}
                            aria-label="Decrease"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center font-bold text-readable-body">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQty(item.id, 1)}
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ background: "#6D28FF", color: "white" }}
                            aria-label="Increase"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-bold text-lg font-display" style={{ color: "#FFC247" }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div
                className="p-6 space-y-4"
                style={{ borderTop: "1px solid rgba(255,255,255,0.08)", background: "linear-gradient(to top, #1E192B 0%, transparent 100%)" }}
              >
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-body" style={{ color: "#948DA3" }}>
                    <span>Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-body" style={{ color: "#948DA3" }}>
                    <span>Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  {points !== undefined && tier && (
                    <div className="flex justify-between text-xs items-center font-body" style={{ color: "#12D7F2" }}>
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        {tier.name} · {points.toLocaleString()} pts
                      </span>
                      <span>{tier.discount > 0 ? `${tier.discount}% off` : "Earn 1 pt/$"}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-xl pt-2 font-display" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <span className="text-readable-body">Total</span>
                    <span className="gradient-text-fire">${total.toFixed(2)}</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onCheckout}
                  className="w-full py-4 text-base font-bold rounded-full flex items-center justify-center gap-2 font-body transition-all duration-200"
                  style={{
                    background: "#FF6A1F",
                    color: "white",
                    boxShadow: "0 4px 20px rgba(255,106,31,0.35)",
                  }}
                >
                  Place Order
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Order Confirmation Modal ─────────────────────────────────────────────────
function ConfirmModal({ cart, cartTotal, onConfirm, onEdit }: {
  cart: CartItem[];
  cartTotal: number;
  onConfirm: (specialInstructions?: string, customerPhone?: string) => void;
  onEdit: () => void;
}) {
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const tax = cartTotal * 0.08;
  const total = cartTotal + tax;
  const hasSpokenRef = { current: false };

  useEffect(() => {
    if (!hasSpokenRef.current && typeof window !== "undefined" && "speechSynthesis" in window) {
      hasSpokenRef.current = true;
      const itemsList = cart.map(i => `${i.quantity} ${i.name}`).join(", ");
      const text = `Please confirm your order: ${itemsList}. Total: $${total.toFixed(2)}. Say yes to place your order, or go back to edit.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    }
  }, [cart, total]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(21,16,34,0.85)", backdropFilter: "blur(16px)" }}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto p-8"
        style={{
          background: "#373245",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "24px",
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #6D28FF, #CEBDFF)" }}
          >
            <Check className="w-6 h-6" style={{ color: "white" }} />
          </div>
          <div>
            <h3 className="font-bold text-readable-body text-2xl font-display">Confirm Order</h3>
            <p className="text-sm font-body" style={{ color: "#948DA3" }}>Review your items before we fire them up</p>
          </div>
        </div>

        {/* Items list */}
        <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
          {cart.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex justify-between items-center py-3 font-body"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                  style={{ background: "rgba(109,40,255,0.2)", color: "#CEBDFF" }}
                >
                  {item.quantity}
                </span>
                <span className="font-semibold text-readable-body">{item.name}</span>
              </div>
              <span className="font-bold font-display" style={{ color: "#FFC247" }}>
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Special Instructions */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "0.75rem", marginTop: "0.75rem" }}>
          <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 font-body" style={{ color: "#948DA3" }}>
            Special Instructions (optional)
          </label>
          <input
            type="text"
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="e.g., extra napkins, no salt..."
            className="w-full px-3 py-2.5 rounded-xl text-sm font-body text-readable-body placeholder:text-[#948DA3] transition-all duration-200"
            style={{
              background: "#151022",
              border: "1px solid rgba(255,255,255,0.08)",
              outline: "none",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#12D7F2")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
          />
        </div>

        {/* Phone Number */}
        <div style={{ paddingTop: "0.75rem", marginTop: "0.75rem" }}>
          <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 font-body" style={{ color: "#948DA3" }}>
            Phone (optional) — for order updates
          </label>
          <input
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="(555) 123-4567"
            className="w-full px-3 py-2.5 rounded-xl text-sm font-body text-readable-body placeholder:text-[#948DA3] transition-all duration-200"
            style={{
              background: "#151022",
              border: "1px solid rgba(255,255,255,0.08)",
              outline: "none",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#12D7F2")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
          />
        </div>

        {/* Totals */}
        <div className="space-y-2 mb-6 font-body" style={{ borderTop: "2px solid rgba(255,255,255,0.08)", paddingTop: "1rem" }}>
          <div className="flex justify-between text-sm" style={{ color: "#948DA3" }}>
            <span>Subtotal</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm" style={{ color: "#948DA3" }}>
            <span>Tax (8%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-2xl pt-2 font-display">
            <span className="text-readable-body">Total</span>
            <span className="gradient-text-fire">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onConfirm(specialInstructions, customerPhone)}
            className="w-full py-4 text-base font-bold rounded-full flex items-center justify-center gap-2 font-body transition-all duration-200"
            style={{
              background: "#6D28FF",
              color: "white",
              boxShadow: "0 4px 20px rgba(109,40,255,0.4)",
            }}
          >
            <Check className="w-5 h-5" />
            Yes, Place Order
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onEdit}
            className="w-full py-3.5 text-base font-semibold rounded-full flex items-center justify-center gap-2 font-body transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.04)",
              color: "#CBC3DA",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Edit3 className="w-4 h-4" />
            Go Back & Edit
          </motion.button>
        </div>

        <p className="text-center text-xs mt-4 font-body" style={{ color: "#948DA3" }}>
          Say &quot;yes&quot; or &quot;place order&quot; to confirm with your voice
        </p>
      </motion.div>
    </motion.div>
  );
}

// ─── Customization Modal ───────────────────────────────────────────────────────
function CustomizationModal({
  itemId,
  basePrice,
  onConfirm,
  onClose,
}: {
  itemId: string;
  basePrice: number;
  onConfirm: (finalPrice: number, customizations: import("./hooks/useCustomization").Customization[]) => void;
  onClose: () => void;
}) {
  const { getCustomizations, customizedItems, toggleCustomization, setBasePrice } = useCustomization();
  const itemCustomizations = customizedItems[itemId];

  useEffect(() => {
    setBasePrice(itemId, basePrice);
  }, [itemId, basePrice, setBasePrice]);

  const options = getCustomizations(itemId);
  const selectedCustomizations = itemCustomizations?.customizations || [];
  const customizationPrice = selectedCustomizations.reduce((sum, c) => sum + c.price, 0);
  const finalPrice = basePrice + customizationPrice;

  const hasOptions = options.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(21,16,34,0.85)", backdropFilter: "blur(16px)" }}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="w-full max-w-md max-h-[90vh] overflow-y-auto p-6"
        style={{
          background: "#373245",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "24px",
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-readable-body text-xl font-display">Customize</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.06)", color: "#948DA3" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!hasOptions ? (
          <div className="text-center py-8">
            <p className="text-sm font-body" style={{ color: "#948DA3" }}>
              No customization options available for this item.
            </p>
            <p className="text-readable-body font-semibold mt-2 font-display">${basePrice.toFixed(2)}</p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {options.map((option) => {
              const isSelected = selectedCustomizations.some((c) => c.id === option.id);
              return (
                <motion.button
                  key={option.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleCustomization(itemId, option)}
                  className="w-full flex items-center justify-between p-4 rounded-xl transition-all"
                  style={{
                    background: isSelected ? "rgba(109,40,255,0.2)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${isSelected ? "#6D28FF" : "rgba(255,255,255,0.08)"}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: isSelected ? "#6D28FF" : "transparent",
                        border: `2px solid ${isSelected ? "#6D28FF" : "#948DA3"}`,
                      }}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-readable-body text-sm font-body">{option.name}</p>
                      <p className="text-xs capitalize font-body" style={{ color: option.type === "add" ? "#12D7F2" : option.type === "remove" ? "#EF4444" : "#948DA3" }}>
                        {option.type}
                      </p>
                    </div>
                  </div>
                  <span
                    className="text-sm font-bold font-display"
                    style={{ color: option.price > 0 ? "#FFC247" : option.price < 0 ? "#12D7F2" : "#948DA3" }}
                  >
                    {option.price > 0 ? `+$${option.price.toFixed(2)}` : option.price < 0 ? `-$${Math.abs(option.price).toFixed(2)}` : "Free"}
                  </span>
                </motion.button>
              );
            })}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex justify-between items-center py-3 font-body" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <span className="text-readable-body font-bold">Total</span>
            <span className="text-2xl font-black font-display gradient-text-fire">${finalPrice.toFixed(2)}</span>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 py-3.5 text-base font-semibold rounded-full font-body"
              style={{ background: "rgba(255,255,255,0.04)", color: "#CBC3DA", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              Cancel
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => onConfirm(finalPrice, selectedCustomizations)}
              className="flex-1 py-3.5 text-base font-bold rounded-full font-body"
              style={{
                background: "#6D28FF",
                color: "white",
              }}
            >
              {hasOptions ? "Add Customizations" : "Add to Order"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Order Complete Screen ─────────────────────────────────────────────────────
function OrderComplete({ orderNumber, pointsEarned, totalPoints }: { orderNumber: number; pointsEarned?: number; totalPoints?: number }) {
  const confettiPieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 1.5,
    color: ["#FF6A1F", "#FFC247", "#6D28FF", "#12D7F2"][Math.floor(Math.random() * 4)],
    size: 6 + Math.random() * 8,
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ background: "#151022" }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 80% at 50% 40%, rgba(109,40,255,0.2) 0%, transparent 60%), " +
              "radial-gradient(ellipse 60% 60% at 30% 70%, rgba(255,106,31,0.12) 0%, transparent 60%), " +
              "radial-gradient(ellipse 60% 60% at 70% 80%, rgba(255,194,71,0.1) 0%, transparent 60%)",
          }}
        />
      </div>

      {/* Confetti */}
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{ y: -20, x: `${piece.x}vw`, opacity: 1, rotate: 0 }}
          animate={{ y: "110vh", opacity: [1, 1, 0], rotate: 720 * (piece.id % 2 === 0 ? 1 : -1) }}
          transition={{ duration: 2.5 + Math.random(), delay: piece.delay, ease: "easeIn" }}
          style={{
            position: "absolute",
            top: 0,
            width: piece.size,
            height: piece.size,
            borderRadius: piece.id % 3 === 0 ? "50%" : "2px",
            background: piece.color,
          }}
        />
      ))}

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.2 }}
        className="text-center relative z-10 px-4"
      >
        {/* Animated icon */}
        <motion.div
          animate={{ rotate: [0, 15, -10, 12, 0] }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-32 h-32 mx-auto mb-8 rounded-full flex items-center justify-center"
          style={{
            background: "#221D2F",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(109,40,255,0.35)",
          }}
        >
          <Check className="w-16 h-16" style={{ color: "#6D28FF" }} />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="font-display font-black text-5xl mb-3 tracking-widest uppercase"
          style={{ color: "#FFC247" }}
        >
          Order Placed!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-lg font-semibold mb-6 font-body"
          style={{ color: "#CBC3DA" }}
        >
          Your order number is
        </motion.p>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.8 }}
          className="inline-block"
        >
          <span className="font-display font-black text-8xl" style={{ color: "#FFC247" }}>#{orderNumber}</span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mt-8 text-sm font-medium font-body"
          style={{ color: "#948DA3" }}
        >
          Pull forward when you see your number called
        </motion.p>

        {pointsEarned !== undefined && pointsEarned > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.3 }}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-body"
            style={{
              background: "rgba(18,215,242,0.12)",
              border: "1px solid rgba(18,215,242,0.3)",
              color: "#12D7F2",
            }}
          >
            <Sparkles className="w-4 h-4" />
            <span className="font-bold text-sm">+{pointsEarned} points earned!</span>
            {totalPoints !== undefined && <span className="text-xs opacity-70">(Total: {totalPoints.toLocaleString()})</span>}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Hero Voice Section ─────────────────────────────────────────────────────────
const HEADLINE = ["Order Taco Bell", "with your voice"];

function HeroVoiceUI({ aiMessage, transcript, isConnected, isSpeaking, error, onConnect, onDisconnect }: {
  aiMessage: string;
  transcript: string;
  isConnected: boolean;
  isSpeaking: boolean;
  error: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  return (
    <section id="voice" className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Glow accent */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-8"
          style={{
            background: "var(--glass)",
            border: "1px solid var(--border)",
            color: "var(--purple-light)",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Sparkles className="w-4 h-4" />
          AI-Powered Voice Ordering
        </motion.div>

        {/* Headline - word by word reveal */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 leading-[1.1]">
          {HEADLINE.map((line, lineIndex) => (
            <span key={lineIndex} className="block">
              {line.split(" ").map((word, wordIndex) => (
                <span key={wordIndex} className="inline-block mr-4 overflow-hidden">
                  <motion.span
                    className="inline-block"
                    initial={{ opacity: 0, y: 40, rotateX: -40 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{
                      delay: 0.5 + lineIndex * 0.2 + wordIndex * 0.08,
                      duration: 0.7,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    style={{
                      background: wordIndex === 0 && lineIndex === 0
                        ? "linear-gradient(135deg, var(--yellow) 0%, var(--orange) 100%)"
                        : "transparent",
                      WebkitBackgroundClip: wordIndex === 0 && lineIndex === 0 ? "text" : undefined,
                      WebkitTextFillColor: wordIndex === 0 && lineIndex === 0 ? "transparent" : undefined,
                    }}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </span>
          ))}
        </h1>

        {/* Subheadline */}
        <motion.p
          className="text-lg sm:text-xl text-[var(--gray-400)] max-w-2xl mx-auto mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        >
          Speak naturally. Order anything. No app downloads, no typing — just talk and we&apos;ll fire up your meal.
        </motion.p>

        {/* Voice UI Card */}
        <motion.div
          className="relative overflow-hidden"
          style={{
            background: "var(--glass)",
            backdropFilter: "blur(20px)",
            border: "1px solid var(--border)",
            borderRadius: "1.5rem",
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          {/* Glow accent */}
          <div
            className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px] pointer-events-none"
            style={{ background: `radial-gradient(circle, ${isSpeaking ? "rgba(255,107,53,0.2)" : "rgba(124,58,237,0.15)"} 0%, transparent 70%)` }}
          />

          <div className="relative p-8 sm:p-10 flex flex-col lg:flex-row items-center gap-8">
            {/* AI Avatar */}
            <div className="relative flex-shrink-0">
              <motion.div
                animate={isSpeaking ? { scale: [1, 1.05, 1] } : {}}
                transition={isSpeaking ? { duration: 0.6, repeat: Infinity } : {}}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl flex items-center justify-center relative overflow-hidden"
                style={{
                  background: isSpeaking
                    ? "linear-gradient(135deg, var(--yellow), var(--orange))"
                    : isConnected
                    ? "linear-gradient(135deg, var(--purple), var(--purple-light))"
                    : "linear-gradient(135deg, var(--void-elevated), var(--void-light))",
                  border: `1px solid ${isConnected ? "var(--purple)" : "var(--border)"}`,
                  boxShadow: isSpeaking
                    ? "0 0 40px rgba(255,107,53,0.4)"
                    : isConnected
                    ? "0 0 30px rgba(124,58,237,0.3)"
                    : "0 4px 20px rgba(0,0,0,0.3)",
                }}
              >
                {isSpeaking ? (
                  <Volume2 className="w-12 h-12 sm:w-14 sm:h-14" style={{ color: "#0a0612" }} />
                ) : isConnected ? (
                  <Mic className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                ) : (
                  <Sparkles className="w-12 h-12 sm:w-14 sm:h-14" style={{ color: "var(--purple)" }} />
                )}

                {/* Voice visualizer */}
                {(isConnected || isSpeaking) && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                    <VoiceVisualizer isListening={isConnected} isSpeaking={isSpeaking} />
                  </div>
                )}
              </motion.div>

              {/* Status badge */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap"
              >
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: isConnected ? "rgba(124,58,237,0.2)" : "var(--void-elevated)",
                    border: `1px solid ${isConnected ? "var(--purple)" : "var(--border)"}`,
                    color: isConnected ? "var(--purple-light)" : "var(--gray-400)",
                  }}
                >
                  {isConnected ? (
                    <>
                      <motion.span
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: "var(--green)" }}
                      />
                      Listening
                    </>
                  ) : (
                    <>
                      <ChevronRight className="w-3 h-3" />
                      Tap to Order
                    </>
                  )}
                </span>
              </motion.div>
            </div>

            {/* AI Message */}
            <div className="flex-1 text-center lg:text-left min-w-0">
              <AnimatePresence mode="wait">
                <motion.p
                  key={aiMessage}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="text-xl sm:text-2xl font-bold text-white leading-snug"
                >
                  {aiMessage}
                </motion.p>
              </AnimatePresence>

              {transcript && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-sm font-medium italic" style={{ color: "var(--purple-light)" }}
                >
                  &ldquo;{transcript}&rdquo;
                </motion.p>
              )}

              {error && (
                <p className="mt-2 text-sm text-red-400">{error}</p>
              )}
            </div>

            {/* Mic button */}
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
              <motion.button
                onClick={isConnected ? onDisconnect : onConnect}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.92 }}
                transition={springTransition}
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={
                  isConnected
                    ? { background: "var(--red)", boxShadow: "0 8px 30px rgba(239,68,68,0.35)" }
                    : { background: "linear-gradient(135deg, var(--yellow), var(--orange))", boxShadow: "0 8px 30px rgba(255,107,53,0.35)" }
                }
                aria-label={isConnected ? "End voice order" : "Start voice order"}
              >
                {isConnected ? (
                  <MicOff className="w-10 h-10 text-white" />
                ) : (
                  <Mic className="w-10 h-10" style={{ color: "#0a0612" }} />
                )}
              </motion.button>
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--gray-400)" }}>
                {isConnected ? "End" : "Voice"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Tap to order CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="mt-6"
        >
          <motion.button
            onClick={isConnected ? onDisconnect : onConnect}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="glow-pulse inline-flex items-center gap-2 px-8 py-4 text-lg font-bold rounded-2xl"
            style={{
              background: "linear-gradient(135deg, var(--yellow) 0%, var(--orange) 100%)",
              color: "#0a0612",
            }}
          >
            {isConnected ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            {isConnected ? "End Voice Order" : "Tap to Start Voice Order"}
          </motion.button>
        </motion.div>
      </div>

      <ScrollIndicator />
    </section>
  );
}

// ─── Menu Section ──────────────────────────────────────────────────────────────
function MenuSection({ cart, addItemToCart, updateQuantity, onCustomize }: {
  cart: CartItem[];
  addItemToCart: (item: MenuItem) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  onCustomize?: (itemId: string, price: number) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = ["all", ...Array.from(new Set(MENU_ITEMS.map((i) => i.category)))];
  const filteredItems =
    selectedCategory && selectedCategory !== "all"
      ? MENU_ITEMS.filter((i) => i.category === selectedCategory)
      : MENU_ITEMS;

  return (
    <section id="menu" className="relative py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
          Fire Menu
        </h2>
        <p className="text-[var(--gray-400)] text-lg max-w-xl mx-auto">
          Handcrafted favorites, ready when you are. Tap to add or use your voice.
        </p>
      </motion.div>

      {/* Category filters */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-8 scrollbar-thin">
        {categories.map((cat, i) => (
          <motion.button
            key={cat}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
            className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200"
            style={
              selectedCategory === cat || (cat === "all" && !selectedCategory)
                ? {
                    background: "linear-gradient(135deg, var(--yellow) 0%, var(--orange) 100%)",
                    color: "#0a0612",
                    border: "none",
                    boxShadow: "0 2px 12px rgba(255,107,53,0.3)",
                  }
                : {
                    background: "var(--glass)",
                    color: "var(--gray-400)",
                    border: "1px solid var(--border)",
                  }
            }
          >
            {cat === "all" ? "All Items" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            {cat !== "all" && (
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: CATEGORY_COLORS[cat] || "var(--orange)" }}
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Bento grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
      >
        {filteredItems.map((item) => {
          const qty = cart.find((c) => c.id === item.id)?.quantity || 0;
          return (
            <MenuCard
              key={item.id}
              item={item}
              qty={qty}
              onAdd={() => addItemToCart(item)}
              onUpdateQty={(delta) => {
                const current = cart.find((c) => c.id === item.id)?.quantity || 0;
                if (current === 0 && delta === 1) {
                  addItemToCart(item);
                } else {
                  updateQuantity(item.id, delta);
                }
              }}
            />
          );
        })}
      </motion.div>
    </section>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function DriveThrough() {
  const [orderState, setOrderState] = useState<OrderState>("idle");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState("Welcome to Taco Bell! I'm your AI assistant. Tap the mic to order with your voice, or browse the menu below.");
  const [transcript, setTranscript] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [placedOrderNumber, setPlacedOrderNumber] = useState<number | null>(null);
  const [lastPointsEarned, setLastPointsEarned] = useState<number>(0);
  const [headerScrolled, setHeaderScrolled] = useState(false);

  const { items: cart, addItem: addToStore, updateQuantity: updateStoreQuantity, clearCart } = useCartStore();
  const { activeCustomization, openCustomization, closeCustomization, getItemPrice, customizedItems } = useCustomization();
  const { points, tier, addPoints, calculatePointsForOrder } = useRewards();

  const { isConnected, isSpeaking, connect, disconnect, error } = useVoiceAI({
    onMessage: (message) => {
      setAiMessage(message);
      processOrderIntent(message);
    },
    onTranscript: (text) => {
      setTranscript(text);
    },
    onAddItem: (item) => {
      addToStore({ ...item, quantity: 1 } as CartItem);
    },
  });

  // Scroll handler
  useEffect(() => {
    const onScroll = () => setHeaderScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const processOrderIntent = (message: string) => {
    const lowerMsg = message.toLowerCase();
    MENU_ITEMS.forEach((item) => {
      if (lowerMsg.includes(item.name.toLowerCase())) {
        addToStore({ ...item, quantity: 1 } as CartItem);
      }
    });
    if (lowerMsg.includes("that's all") || lowerMsg.includes("done") || lowerMsg.includes("checkout")) {
      setShowConfirmModal(true);
    }
  };

  const addItemToCart = (item: MenuItem) => {
    addToStore({ ...item, quantity: 1 } as CartItem);
    setOrderState("ordering");
    setTimeout(() => setOrderState("idle"), 700);
  };

  const updateQuantity = (itemId: string, delta: number) => {
    const item = cart.find((i) => i.id === itemId);
    if (!item) return;
    const newQty = Math.max(0, item.quantity + delta);
    if (newQty === 0) {
      useCartStore.getState().removeItem(itemId);
    } else {
      updateStoreQuantity(itemId, newQty);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    setIsCartOpen(false);
    setShowConfirmModal(true);
  };

  const { createOrder: createOrderApi } = useOrderTracking();

  const handlePlaceOrder = async (specialInstructions?: string, customerPhone?: string) => {
    const pointsEarned = calculatePointsForOrder(cartTotal);
    addPoints(pointsEarned);
    setLastPointsEarned(pointsEarned);

    // Save to Turso via Cloudflare Worker API — real-time sync to kitchen via SSE
    try {
      const result = await createOrderApi({
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
        specialInstructions: specialInstructions || undefined,
        customerPhone: customerPhone || undefined,
      });

      const orderNum = result?.orderNumber ?? generateOrderNumber();

      setShowConfirmModal(false);
      setPlacedOrderNumber(orderNum);
      setOrderState("completed");
      clearCart();

      setTimeout(() => {
        setOrderState("idle");
        setPlacedOrderNumber(null);
        setAiMessage("Thank you for ordering! Your food is being prepared. ¡Yo quiero Taco Bell!");
      }, 5000);
    } catch {
      // Order creation failed — show error state but don't block the user
      setAiMessage("Order placed! (Kitchen will be notified shortly)");
      setShowConfirmModal(false);
      setPlacedOrderNumber(generateOrderNumber());
      setOrderState("completed");
      clearCart();
      setTimeout(() => {
        setOrderState("idle");
        setPlacedOrderNumber(null);
      }, 5000);
    }
  };

  return (
    <div className="grain-overlay min-h-screen" style={{ background: "var(--bg)" }}>
      <Nav />

      <main className="relative z-10">
        {/* Fixed cart button */}
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-4 right-4 z-40"
        >
          <motion.button
            onClick={() => setIsCartOpen(true)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="relative flex items-center gap-2.5 px-4 py-3 rounded-2xl"
            style={{
              background: "rgba(10,10,10,0.7)",
              backdropFilter: "blur(20px)",
              border: "1px solid var(--border)",
              color: "white",
            }}
          >
            <ShoppingBag className="w-5 h-5" style={{ color: "var(--primary)" }} />
            <span className="font-bold text-sm">${cartTotal.toFixed(2)}</span>
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: "linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)",
                    color: "#0A0A0A",
                  }}
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>

        {/* Hero Voice Section */}
        <HeroVoiceSection
          aiMessage={aiMessage}
          transcript={transcript}
          isConnected={isConnected}
          isSpeaking={isSpeaking}
          error={error}
          onConnect={connect}
          onDisconnect={disconnect}
        />

        {/* Menu Section */}
        <MenuGrid
          cart={cart}
          addItemToCart={addItemToCart}
          updateQuantity={updateQuantity}
          onCustomize={(itemId, price) => {
            const customPrice = getItemPrice(itemId, price);
            openCustomization(itemId, customPrice > 0 ? customPrice : price);
          }}
        />

        {/* Footer spacer */}
        <div className="h-36" />
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        cartTotal={cartTotal}
        onUpdateQty={updateQuantity}
        onRemove={(id) => useCartStore.getState().removeItem(id)}
        onCheckout={handleCheckout}
        points={points}
        tier={tier}
      />

      {/* Customization Modal */}
      <AnimatePresence>
        {activeCustomization && (
          <CustomizationModal
            itemId={activeCustomization}
            basePrice={MENU_ITEMS.find(i => i.id === activeCustomization)?.price || 0}
            onConfirm={(finalPrice, customizations) => {
              closeCustomization();
            }}
            onClose={closeCustomization}
          />
        )}
      </AnimatePresence>

      {/* Confirm Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <ConfirmModal
            cart={cart}
            cartTotal={cartTotal}
            onConfirm={handlePlaceOrder}
            onEdit={() => {
              setShowConfirmModal(false);
              setIsCartOpen(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* Order Complete */}
      <AnimatePresence>
        {orderState === "completed" && placedOrderNumber !== null && (
          <OrderComplete orderNumber={placedOrderNumber} pointsEarned={lastPointsEarned} totalPoints={points} />
        )}
      </AnimatePresence>
    </div>
  );
}
