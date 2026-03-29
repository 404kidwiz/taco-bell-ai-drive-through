"use client";

import { useState } from "react";
import Nav from "@/components/Nav";
import Link from "next/link";
import { useCartStore } from "../hooks/useCartStore";

const CATEGORIES = [
  { id: "featured", label: "Featured", icon: "stars" },
  { id: "tacos", label: "Tacos", icon: "tapas" },
  { id: "burritos", label: "Burritos", icon: "lunch_dining" },
  { id: "nachos", label: "Nachos & Sides", icon: "egg_alt" },
  { id: "drinks", label: "Drinks", icon: "local_drink" },
  { id: "combos", label: "Combos", icon: "layers" },
  { id: "cravings", label: "Cravings", icon: "fastfood" },
];

const MENU_ITEMS_MAP: Record<string, Array<{ id: string; name: string; desc: string; price: number; badge?: string }>> = {
  featured: [
    { id: "f1", name: "Ultimate Cravings Box", desc: "Your choice of protein, sides & drink — all in one blazing box.", price: 9.99, badge: "LIMITED TIME" },
    { id: "f2", name: "Cheesy Gordita Crunch", desc: "Crispy LD shell, smooth flatbread, seasoned beef, nacho cheese.", price: 4.29, badge: "BESTSELLER" },
    { id: "f3", name: "Crunchwrap Supreme", desc: "Toasted flour tortilla, beef, sour cream, nacho cheese, lettuce.", price: 4.49 },
    { id: "f4", name: "Baja Blast Freeze", desc: "MTN DEW Baja Blast — the iconic frozen citrus blast.", price: 3.49 },
  ],
  tacos: [
    { id: "t1", name: "Crunchy Taco", desc: "Seasoned beef, lettuce, cheddar in a crispy corn shell.", price: 1.99 },
    { id: "t2", name: "Soft Taco Supreme", desc: "Grilled chicken, lettuce, sour cream, tomato, cheddar.", price: 3.29 },
    { id: "t3", name: "Nacho Crunch Taco", desc: "Cheese-dipped shell with beef and jalapeño.", price: 2.49 },
    { id: "t4", name: "Double-Stacked Taco", desc: "Two crisp shells with beef and nacho cheese sauce.", price: 2.99 },
  ],
  burritos: [
    { id: "b1", name: "Beefy 5-Layer Burrito", desc: "5 layers: beef, beans, sour cream, cheese, tortillas.", price: 3.99 },
    { id: "b2", name: "Grilled Cheese Burrito", desc: "Cheesy rollup — toasted tortilla with nacho cheese outside.", price: 3.49 },
    { id: "b3", name: "Quesarito", desc: "A cheesy potato griller wrapped in a quesadilla.", price: 3.79 },
    { id: "b4", name: "Mexican Pizza", desc: "Crispy shell, beef, pizza sauce, cheese, tomatoes.", price: 5.49 },
  ],
  nachos: [
    { id: "n1", name: "Nacho Fries", desc: "Seasoned fries with nacho cheese dipping sauce.", price: 2.99 },
    { id: "n2", name: "Nacho Supreme", desc: "Loaded nachos with beef, sour cream, guac, tomato.", price: 5.49 },
    { id: "n3", name: "Chips & Cheese", desc: "Fresh tortilla chips with warm nacho cheese.", price: 2.19 },
    { id: "n4", name: "Cinnamon Twists", desc: "Sweet, crispy pasta twists — a Taco Bell original.", price: 1.50 },
  ],
  drinks: [
    { id: "d1", name: "Baja Blast Freeze", desc: "Frozen MTN DEW Baja Blast — tropical lime.", price: 3.49 },
    { id: "d2", name: "Mountain Dew", desc: "Classic bold citrus soda.", price: 2.49 },
    { id: "d3", name: "Pepsi", desc: "Crisp cola.", price: 2.49 },
    { id: "d4", name: "Mello Yello", desc: "Smooth, citrusy soft drink.", price: 2.49 },
  ],
  combos: [
    { id: "c1", name: "Value Meal", desc: "Taco, Nachos, and a Drink.", price: 5.99 },
    { id: "c2", name: "Cravings Bundle", desc: "3 tacos + chips & cheese + 2 drinks.", price: 11.99 },
    { id: "c3", name: "Taco Party Pack", desc: "12 tacos — mix of crunchy and soft.", price: 19.99 },
    { id: "c4", name: "Nachos Supreme Party Size", desc: "Loaded nachos for 2-3.", price: 8.99 },
  ],
  cravings: [
    { id: "r1", name: "Volcano Taco", desc: "Hot & spicy beef with lava sauce.", price: 2.79 },
    { id: "r2", name: "Meximelts", desc: "Three cheesy beef melt pintos.", price: 3.49 },
    { id: "r3", name: "Loaded Burrito", desc: "Fully loaded with all the fixings.", price: 4.99 },
    { id: "r4", name: "Cheesy Roll-Up", desc: "Three-cheese roll-up with beef.", price: 1.99 },
  ],
};

const ADD_ONS = [
  { name: "CHIPS & CHEESE", price: 2.19 },
  { name: "CINNAMON TWISTS", price: 1.50 },
  { name: "GUACAMOLE CUP", price: 1.20 },
  { name: "DIPPING SAUCE", price: 0.50 },
  { name: "NACHO FRIES", price: 2.99 },
];

// ── Featured Box (Desktop) ────────────────────────────────────────────────────
function FeaturedBox() {
  return (
    <div className="bg-gradient-to-r from-secondary-container to-primary-container rounded-xl p-5 flex items-center justify-between shadow-xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[9px] font-label font-black uppercase tracking-[0.2em] text-secondary-fixed/70">LIMITED TIME</span>
          <span className="text-[9px] font-label font-black uppercase tracking-[0.2em] text-secondary-fixed/70 bg-white/10 px-2 py-0.5 rounded-full">NEW</span>
        </div>
        <h3 className="font-headline font-black text-white text-xl leading-tight tracking-tight">
          ULTIMATE CRAVINGS BOX
        </h3>
        <p className="font-headline font-black text-secondary-fixed text-3xl mt-1">$9.99</p>
      </div>
      <button className="px-6 py-3 rounded-full bg-white text-secondary-container font-label font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform">
        Build Box
      </button>
    </div>
  );
}

// ── Menu Item Card (Desktop) ──────────────────────────────────────────────────
function MenuItemCard({ item, onAdd }: { item: { id: string; name: string; desc: string; price: number; badge?: string }; onAdd: () => void }) {
  return (
    <div className="bg-surface-container-high rounded-xl overflow-hidden border border-outline/10 hover:border-primary/30 transition-all duration-300 group">
      <div className="h-28 relative overflow-hidden bg-gradient-to-br from-surface-container to-surface-container-high">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="material-symbols-outlined text-5xl text-primary/15">fastfood</span>
        </div>
        {item.badge && (
          <div className="absolute top-2 left-2 bg-secondary-container text-white text-[9px] font-label font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
            {item.badge}
          </div>
        )}
        {/* Hover add overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
          <button
            onClick={onAdd}
            className="w-full py-2 rounded-lg bg-secondary-container text-white text-xs font-bold font-headline uppercase tracking-widest"
          >
            Add to Order
          </button>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-headline font-bold text-white text-sm leading-tight mb-1">{item.name}</h3>
        <p className="text-[11px] text-[#CBC3DA] leading-relaxed line-clamp-2 mb-3 font-label">{item.desc}</p>
        <div className="flex items-center justify-between">
          <span className="font-headline font-black text-tertiary text-lg">${item.price.toFixed(2)}</span>
          <button
            onClick={onAdd}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-bright hover:bg-primary-container transition-colors"
          >
            <span className="material-symbols-outlined text-sm text-white">add</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add-On Chips ──────────────────────────────────────────────────────────────
function AddOnChip({ name, price, onAdd }: { name: string; price: number; onAdd: () => void }) {
  return (
    <div className="flex-shrink-0 flex items-center gap-3 bg-surface-container rounded-full px-4 py-2.5 border border-outline/10">
      <div>
        <p className="text-xs font-label font-bold text-white whitespace-nowrap">{name}</p>
        <p className="text-[10px] text-[#948DA3]">${price.toFixed(2)}</p>
      </div>
      <button
        onClick={onAdd}
        className="w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-opacity"
      >
        <span className="material-symbols-outlined text-xs text-white">add</span>
      </button>
    </div>
  );
}

// ── Cart Drawer (Desktop Side) ───────────────────────────────────────────────
function CartDrawer({ cartTotal }: { cartTotal: number }) {
  return (
    <div className="bg-surface-container-low rounded-xl p-5 border border-outline/10">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-label font-black uppercase tracking-widest text-[#CBC3DA]">YOUR ORDER</span>
        <span className="bg-primary-container/20 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold">0 ITEMS</span>
      </div>
      <div className="text-center py-8">
        <span className="material-symbols-outlined text-4xl text-[#494457]">shopping_cart</span>
        <p className="mt-2 text-xs text-[#494457] font-label">Your cart is empty</p>
      </div>
      <div className="border-t border-outline/10 pt-4 mt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-label text-[#CBC3DA] uppercase tracking-widest">Total</span>
          <span className="font-headline font-black text-white text-2xl">${cartTotal.toFixed(2)}</span>
        </div>
        <Link
          href="/checkout"
          className="w-full py-4 rounded-full bg-gradient-to-br from-secondary-container to-secondary text-white font-headline font-black text-base uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-[0_10px_30px_rgba(244,98,22,0.4)] transition-all"
        >
          Review Order
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
}

// ── Bottom Voice Bar (Mobile) ─────────────────────────────────────────────────
function MobileBottomBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1E192B]/60 backdrop-blur-xl rounded-t-[2rem] shadow-[0_-10px_30px_rgba(109,40,255,0.15)] md:hidden">
      <div className="flex items-center gap-4 px-6 py-4">
        <button className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center ai-breathe flex-shrink-0">
          <span className="material-symbols-outlined text-xl text-white">mic</span>
        </button>
        <div className="flex-1">
          <p className="text-xs font-label font-bold text-[#CBC3DA]">Tap to use Voice AI</p>
          <p className="text-[10px] text-[#494457] font-label">Or tap Review Order below</p>
        </div>
        <Link
          href="/checkout"
          className="px-5 py-3 rounded-full bg-secondary-container text-white font-label font-bold text-sm flex items-center gap-2"
        >
          Review Order
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
}

// ── Desktop Menu Page ─────────────────────────────────────────────────────────
function DesktopMenu() {
  const [activeCategory, setActiveCategory] = useState("featured");
  const { items: cart, addItem } = useCartStore();
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const items = MENU_ITEMS_MAP[activeCategory] || [];

  return (
    <div className="hidden md:flex min-h-screen pt-20 pb-10">
      {/* Main Menu Area */}
      <div className="flex-1 px-6 lg:px-10 xl:px-16 py-8 overflow-y-auto">
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-label font-bold transition-all duration-200 ${
                activeCategory === cat.id
                  ? "bg-primary-container text-white shadow-[0_0_15px_rgba(109,40,255,0.4)]"
                  : "bg-surface-container text-[#CBC3DA] border border-outline/10 hover:border-primary/30"
              }`}
            >
              <span className="material-symbols-outlined text-sm">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Featured Box (only on featured) */}
        {activeCategory === "featured" && (
          <div className="mb-8">
            <FeaturedBox />
          </div>
        )}

        {/* Item Grid */}
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onAdd={() => addItem({ id: item.id, name: item.name, description: item.desc, price: item.price, quantity: 1, category: activeCategory as "tacos" | "burritos" | "specialties" | "sides" | "drinks" })}
            />
          ))}
        </div>

        {/* Add-Ons Section */}
        <div className="mt-10 pt-8 border-t border-outline/10">
          <h3 className="font-headline font-black text-white text-xl mb-1 uppercase tracking-tight">Finish Your Order</h3>
          <p className="text-xs text-[#948DA3] font-label mb-4">Add something extra — chips, drinks, and more</p>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
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

      {/* Cart Sidebar */}
      <div className="w-80 xl:w-96 px-6 py-8 border-l border-outline/10">
        <CartDrawer cartTotal={cartTotal} />

        {/* Quick Stats */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-3 bg-surface-container/30 rounded-lg px-4 py-3">
            <span className="material-symbols-outlined text-primary text-lg">stars</span>
            <div>
              <p className="text-[10px] font-label text-[#CBC3DA] uppercase tracking-widest">Earn</p>
              <p className="font-headline font-bold text-white text-sm">+78 Rewards Points</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-surface-container/30 rounded-lg px-4 py-3">
            <span className="material-symbols-outlined text-secondary-container text-lg">local_fire_department</span>
            <div>
              <p className="text-[10px] font-label text-[#CBC3DA] uppercase tracking-widest">Fires</p>
              <p className="font-headline font-bold text-white text-sm">3 items away from bonus pts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Mobile Menu Page ─────────────────────────────────────────────────────────
function MobileMenu() {
  const [activeCategory, setActiveCategory] = useState("featured");
  const { items: cart, addItem } = useCartStore();
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const items = MENU_ITEMS_MAP[activeCategory] || [];

  return (
    <div className="md:hidden min-h-screen bg-surface-dim pb-28">
      <Nav />

      {/* Featured Box */}
      <div className="px-4 pt-20">
        <FeaturedBox />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar py-4 px-4 -mx-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-label font-bold transition-all ${
              activeCategory === cat.id
                ? "bg-primary-container text-white"
                : "bg-surface-container text-[#CBC3DA] border border-outline/10"
            }`}
          >
            <span className="material-symbols-outlined text-sm">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Item Grid */}
      <div className="px-4">
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onAdd={() => addItem({ id: item.id, name: item.name, description: item.desc, price: item.price, quantity: 1, category: (activeCategory === "featured" ? "specialties" : activeCategory) as "tacos" | "burritos" | "specialties" | "sides" | "drinks" })}
            />
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <MobileBottomBar />
    </div>
  );
}

// ── Main Menu Page ────────────────────────────────────────────────────────────
export default function MenuPage() {
  return (
    <>
      <DesktopMenu />
      <MobileMenu />
    </>
  );
}
