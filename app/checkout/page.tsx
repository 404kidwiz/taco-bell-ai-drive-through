"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useCartStore } from "../hooks/useCartStore";
import Nav from "@/components/Nav";

const MENU_TABS = [
  { id: "menu", label: "Menu", icon: "restaurant_menu" },
  { id: "tacos", label: "Tacos", icon: "tapas" },
  { id: "burritos", label: "Burritos", icon: "lunch_dining" },
  { id: "specials", label: "Specials", icon: "stars" },
  { id: "drinks", label: "Drinks", icon: "local_drink" },
  { id: "limited", label: "Limited Time", icon: "schedule" },
];

const ADD_ONS = [
  { name: "CHIPS & CHEESE", price: 2.19 },
  { name: "CINNAMON TWISTS", price: 1.50 },
  { name: "GUACAMOLE CUP", price: 1.20 },
  { name: "DIPPING SAUCE", price: 0.50 },
  { name: "STRAWBERRY FREEZE", price: 2.99 },
];

function FeaturedBox() {
  return (
    <div className="bg-gradient-to-r from-secondary-container to-primary-container rounded-xl p-4 flex items-center justify-between">
      <div>
        <span className="text-[10px] font-label font-bold uppercase tracking-widest text-secondary-fixed/70">Limited Time</span>
        <h3 className="font-headline font-bold text-white text-lg leading-tight mt-0.5">Ultimate Cravings Box</h3>
        <p className="text-secondary-fixed font-headline font-bold text-xl">$9.99</p>
      </div>
      <button className="px-5 py-2.5 rounded-full bg-white text-secondary-container font-label font-bold text-sm">
        Build Box
      </button>
    </div>
  );
}

function AddOnChip({ name, price, onAdd }: { name: string; price: number; onAdd: () => void }) {
  return (
    <div className="flex-shrink-0 flex items-center gap-3 bg-surface-container rounded-full px-4 py-2 border border-outline/10">
      <div>
        <p className="text-xs font-label font-bold text-on-surface whitespace-nowrap">{name}</p>
        <p className="text-[10px] text-on-surface-variant">${price.toFixed(2)}</p>
      </div>
      <button
        onClick={onAdd}
        className="w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center flex-shrink-0"
      >
        <span className="material-symbols-outlined text-xs text-white">add</span>
      </button>
    </div>
  );
}

function CartItemRow({ item, onUpdateQty, onRemove }: {
  item: { id: string; name: string; price: number; quantity: number };
  onUpdateQty: (delta: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-outline/10 last:border-0">
      <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-outlined text-lg text-primary">fastfood</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-label font-semibold text-on-surface text-sm truncate">{item.name}</p>
        <p className="text-xs text-on-surface-variant">${item.price.toFixed(2)} each</p>
      </div>
      <div className="flex items-center gap-2 bg-surface-container rounded-full px-1 py-0.5">
        <button
          onClick={() => onUpdateQty(-1)}
          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-xs text-on-surface">remove</span>
        </button>
        <span className="w-5 text-center font-label font-bold text-on-surface text-sm">{item.quantity}</span>
        <button
          onClick={() => onUpdateQty(1)}
          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-xs text-on-surface">add</span>
        </button>
      </div>
      <span className="font-headline font-bold text-tertiary text-sm w-14 text-right">
        ${(item.price * item.quantity).toFixed(2)}
      </span>
    </div>
  );
}

export default function CheckoutPage() {
  const [activeTab, setActiveTab] = useState("menu");
  const { items: cart, updateQuantity, removeItem } = useCartStore();

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = cartTotal * 0.08;
  const total = cartTotal + tax;

  return (
    <div className="min-h-screen bg-surface-dim">
      <Nav />

      <div className="max-w-xl mx-auto px-4 pt-20 pb-36">
        {/* Featured Box */}
        <FeaturedBox />

        {/* Category Tabs */}
        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar mt-5 -mx-4 px-4">
          {MENU_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-label font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-primary-container text-white"
                  : "bg-surface-container text-on-surface-variant"
              }`}
            >
              <span className="material-symbols-outlined text-xs">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Current Order Section */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-headline font-bold text-on-surface text-base">Current Order</h2>
            <span className="text-sm font-label text-on-surface-variant">
              {cartCount} {cartCount === 1 ? 'Item' : 'Items'} • ${cartTotal.toFixed(2)}
            </span>
          </div>

          <div className="bg-surface-container rounded-xl p-4">
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">shopping_cart</span>
                <p className="mt-2 text-sm text-on-surface-variant">Your cart is empty</p>
              </div>
            ) : (
              cart.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onUpdateQty={(delta) => {
                    const newQty = item.quantity + delta;
                    if (newQty <= 0) removeItem(item.id);
                    else updateQuantity(item.id, newQty);
                  }}
                  onRemove={() => removeItem(item.id)}
                />
              ))
            )}

            {cart.length > 0 && (
              <div className="mt-3 pt-3 border-t border-outline/10 flex justify-between items-center">
                <span className="text-xs text-on-surface-variant font-label">Tax (8%)</span>
                <span className="text-xs text-on-surface-variant font-label">${tax.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Finish The Vibe — Add-ons */}
        <div className="mt-6">
          <h3 className="font-headline font-bold text-on-surface text-base mb-1">Finish The Vibe</h3>
          <p className="text-xs text-on-surface-variant mb-3 font-label">Add-ons</p>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {ADD_ONS.map((ao) => (
              <AddOnChip
                key={ao.name}
                name={ao.name}
                price={ao.price}
                onAdd={() => {}}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Mic Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface-dim/95 backdrop-blur-xl border-t border-outline/10 px-4 py-3">
        <div className="flex items-center gap-4 max-w-xl mx-auto">
          <button className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center ai-breathe flex-shrink-0">
            <span className="material-symbols-outlined text-xl text-white">mic</span>
          </button>
          <div className="flex-1">
            <p className="text-xs font-label font-bold text-on-surface-variant">Listening...</p>
            <p className="text-[10px] text-on-surface-variant/70">Tap to speak</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-3 rounded-full bg-secondary-container text-white font-label font-bold text-sm">
            Review Order
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
