"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useCartStore } from "../hooks/useCartStore";
import { MENU_ITEMS } from "../data/menu";
import { MenuItem } from "../types";
import Nav from "@/components/Nav";

const CATEGORIES = [
  { id: "tacos", label: "Tacos", icon: "tapas" },
  { id: "burritos", label: "Burritos", icon: "wrap_text" },
  { id: "nachos", label: "Nachos", icon: "fastfood" },
  { id: "box", label: "Box", icon: "layers" },
  { id: "drinks", label: "Drinks", icon: "local_drink" },
  { id: "specialties", label: "Cravings", icon: "stars" },
  { id: "sides", label: "Sides", icon: "egg_alt" },
];

const FEATURED_ITEM = {
  name: "The Ultimate Cravings Box",
  description: "Your choice of protein, sides, and a drink — all in one blazing box.",
  price: 12.99,
  category: "specialties",
};

const AI_RECOMMENDATION = {
  name: "Mountain Dew Baja Blast Freeze",
  description: "Perfectly icy, perfectly refreshing. A fan favorite.",
  price: 3.49,
  category: "drinks",
};

function MenuItemCard({ item, onAdd }: { item: MenuItem; onAdd: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-container rounded-xl overflow-hidden border border-outline/10 hover:border-primary/30 transition-all duration-300 group"
    >
      {/* Image area */}
      <div className="h-32 relative overflow-hidden bg-gradient-to-br from-surface-container-high to-surface-container">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="material-symbols-outlined text-5xl text-primary/20">fastfood</span>
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
          <button
            onClick={onAdd}
            className="w-full py-2 rounded-lg bg-secondary-container text-white text-sm font-bold font-headline"
          >
            Add
          </button>
        </div>
      </div>
      {/* Content */}
      <div className="p-3">
        <h3 className="font-headline font-bold text-on-surface text-sm mb-1 leading-tight">{item.name}</h3>
        <p className="text-on-surface-variant text-xs leading-relaxed line-clamp-2 mb-2">{item.description}</p>
        <div className="flex items-center justify-between">
          <span className="font-headline font-bold text-tertiary text-base">${item.price.toFixed(2)}</span>
          <button
            onClick={onAdd}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-container-high hover:bg-primary-container transition-colors"
          >
            <span className="material-symbols-outlined text-sm text-on-surface">add</span>
          </button>
        </div>
      </div>
    </motion.div>
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
        <button className="flex flex-col items-center gap-1 text-on-surface-variant">
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
        <button className="flex flex-col items-center gap-1 text-on-surface-variant">
          <span className="material-symbols-outlined text-xl">star</span>
          <span className="text-[10px] font-label font-bold uppercase tracking-wider">Rewards</span>
        </button>
      </div>
    </div>
  );
}

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState("tacos");
  const { items: cart, addItem } = useCartStore();

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const filteredItems = MENU_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-surface-dim pb-24">
      <Nav />

      <div className="max-w-2xl mx-auto px-4 pt-20">
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar py-3 -mx-4 px-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-label font-bold transition-all duration-200 ${
                activeCategory === cat.id
                  ? "bg-primary-container text-white"
                  : "bg-surface-container text-on-surface-variant border border-outline/10"
              }`}
            >
              <span className="material-symbols-outlined text-sm">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Featured Section */}
        <div className="mt-6 bg-surface-container rounded-xl p-4 border border-secondary-container/30">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-secondary-container">Featured</span>
            <span className="text-[10px] font-label text-on-surface-variant">Combo</span>
          </div>
          <h2 className="font-headline font-bold text-on-surface text-xl mb-1">{FEATURED_ITEM.name}</h2>
          <p className="text-sm text-on-surface-variant mb-3">{FEATURED_ITEM.description}</p>
          <div className="flex items-center justify-between">
            <span className="font-headline font-bold text-tertiary text-2xl">${FEATURED_ITEM.price.toFixed(2)}</span>
            <button className="px-5 py-2 rounded-full bg-secondary-container text-white text-sm font-bold font-label">
              Build Your Box
            </button>
          </div>
        </div>

        {/* AI Recommendation Card */}
        <div className="mt-4 glass-panel baja-pulse rounded-xl p-4 border border-baja-cyan/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-sm text-tertiary">auto_awesome</span>
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-tertiary">AI Recommendation</span>
          </div>
          <p className="text-xs text-on-surface-variant mb-3">Matches Your Vibe</p>
          <div className="flex items-center gap-3 bg-surface-container rounded-xl p-3">
            <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-xl text-primary">local_drink</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-headline font-bold text-on-surface text-sm">{AI_RECOMMENDATION.name}</h3>
              <p className="text-xs text-on-surface-variant line-clamp-1">{AI_RECOMMENDATION.description}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="font-headline font-bold text-tertiary text-sm">${AI_RECOMMENDATION.price.toFixed(2)}</span>
              <button className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-primary-container transition-colors">
                <span className="material-symbols-outlined text-xs text-on-surface">add</span>
              </button>
              <button className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-error/20 transition-colors">
                <span className="material-symbols-outlined text-xs text-error">favorite</span>
              </button>
            </div>
          </div>
        </div>

        {/* Item Grid */}
        <div className="mt-6">
          <h3 className="font-headline font-bold text-on-surface text-base mb-3 capitalize">{activeCategory}</h3>
          <div className="grid grid-cols-2 gap-3">
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onAdd={() => addItem({ ...item, quantity: 1 })}
              />
            ))}
          </div>
        </div>
      </div>

      <BottomTabBar cartCount={cartCount} cartTotal={cartTotal} />
    </div>
  );
}
