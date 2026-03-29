"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MenuItem, CartItem } from "@/app/types";
import { MENU_ITEMS } from "@/app/data/menu";
import { Plus, Minus, ShoppingBag, Flame } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  tacos: "#FF6A1F",
  burritos: "#FFC247",
  drinks: "#12D7F2",
  sides: "#CEBDFF",
  specialties: "#6D28FF",
};

const CATEGORIES = ["all", ...Array.from(new Set(MENU_ITEMS.map((i) => i.category)))];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.055, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
  hover: {
    y: -5,
    transition: { type: "spring", stiffness: 380, damping: 24 },
  },
};

function MenuItemCard({
  item,
  qty,
  onAdd,
  onUpdateQty,
  onCustomize,
}: {
  item: MenuItem;
  qty: number;
  onAdd: () => void;
  onUpdateQty: (delta: number) => void;
  onCustomize?: (itemId: string, price: number) => void;
}) {
  const catColor = CATEGORY_COLORS[item.category] || "#6D28FF";

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className="group relative overflow-hidden cursor-pointer"
      style={{
        background: "#221D2F",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "20px",
        transition: "all 0.2s ease",
      }}
      onClick={qty === 0 ? onAdd : undefined}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "#2C273A";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 0 30px rgba(109,40,255,0.15)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "#221D2F";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      {/* Category glow bar */}
      <div
        className="h-0.5 w-full transition-all duration-300 group-hover:w-full"
        style={{ background: catColor }}
      />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {item.category === "specialties" && (
                <Flame className="w-3.5 h-3.5 text-[#FF6A1F] flex-shrink-0" />
              )}
              <span
                className="text-[10px] font-bold uppercase tracking-widest font-display"
                style={{ color: catColor }}
              >
                {item.category}
              </span>
            </div>
            <h3 className="font-bold text-readable-body text-base leading-tight">{item.name}</h3>
            <p className="text-xs mt-1 leading-relaxed line-clamp-2" style={{ color: "#948DA3" }}>
              {item.description}
            </p>
          </div>

          {/* Price */}
          <div className="flex-shrink-0 text-right">
            <span
              className="text-lg font-black font-display"
              style={{ color: "#FFC247" }}
            >
              ${item.price.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Image placeholder */}
        <div
          className="w-full h-36 rounded-xl mb-4 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(109,40,255,0.15) 0%, rgba(206,189,255,0.08) 100%)",
          }}
        >
          <div className="w-full h-full bg-gradient-to-t from-[#221D2F] via-transparent to-transparent" />
        </div>

        {/* Add / Qty controls */}
        <div className="flex items-center justify-between">
          {qty === 0 ? (
            <button
              onClick={(e) => { e.stopPropagation(); onAdd(); }}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-200"
              style={{
                background: "#6D28FF",
                color: "white",
                boxShadow: "0 4px 14px rgba(109,40,255,0.35)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow = "0 6px 20px rgba(109,40,255,0.55)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow = "0 4px 14px rgba(109,40,255,0.35)")
              }
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          ) : (
            <div
              className="flex items-center gap-3 px-3 py-1.5 rounded-full"
              style={{
                background: "rgba(109,40,255,0.12)",
                border: "1px solid rgba(109,40,255,0.25)",
              }}
            >
              <button
                onClick={(e) => { e.stopPropagation(); onUpdateQty(-1); }}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                style={{ background: "#2C273A", color: "#CBC3DA", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-base font-black text-readable-body w-5 text-center">{qty}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onUpdateQty(1); }}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                style={{ background: "#6D28FF", color: "white" }}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {qty > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold" style={{ color: "#6D28FF" }}>
                <ShoppingBag className="w-3.5 h-3.5 inline mr-1" />
                In cart
              </span>
              {onCustomize && (
                <button
                  onClick={(e) => { e.stopPropagation(); onCustomize(item.id, item.price); }}
                  className="text-xs font-semibold px-2 py-1 rounded-lg"
                  style={{ background: "rgba(109,40,255,0.2)", color: "#CEBDFF", border: "1px solid rgba(109,40,255,0.3)" }}
                >
                  Customize
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function MenuGrid({
  cart,
  addItemToCart,
  updateQuantity,
  onCustomize,
}: {
  cart: CartItem[];
  addItemToCart: (item: MenuItem) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  onCustomize?: (itemId: string, price: number) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredItems =
    selectedCategory && selectedCategory !== "all"
      ? MENU_ITEMS.filter((i) => i.category === selectedCategory)
      : MENU_ITEMS;

  return (
    <section id="menu" className="relative py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section header */}
      <motion.div
        className="text-center mb-14"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2
          className="font-display text-6xl sm:text-7xl lg:text-8xl tracking-widest uppercase mb-4"
          style={{ color: "#CBC3DA" }}
        >
          Fire <span style={{ color: "#FF6A1F" }}>Menu</span>
        </h2>
        <p className="text-readable-body text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
          Handcrafted favorites, ready when you are. Tap to add or use your voice.
        </p>
      </motion.div>

      {/* Category filters — pill row */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-10">
        {CATEGORIES.map((cat, i) => {
          const active = selectedCategory === cat || (cat === "all" && !selectedCategory);
          const catColor = cat === "all" ? "#6D28FF" : (CATEGORY_COLORS[cat] || "#6D28FF");
          return (
            <motion.button
              key={cat}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
              onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
              className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap font-body"
              style={
                active
                  ? {
                      background: "#6D28FF",
                      color: "white",
                      boxShadow: "0 4px 16px rgba(109,40,255,0.35)",
                      border: "none",
                    }
                  : {
                      background: "rgba(255,255,255,0.04)",
                      color: "#948DA3",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }
              }
            >
              {cat === "all" ? "All Items" : cat.charAt(0).toUpperCase() + cat.slice(1).replace(/ies$/, "y")}
              {cat !== "all" && (
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: catColor }} />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Bento grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory ?? "all"}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {filteredItems.map((item) => {
            const qty = cart.find((c) => c.id === item.id)?.quantity || 0;
            return (
              <MenuItemCard
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
                onCustomize={onCustomize}
              />
            );
          })}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
