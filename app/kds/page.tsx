"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Order } from "../types";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_NEW_ORDERS: Order[] = [
  {
    id: "1",
    orderNumber: 7742,
    items: [
      { id: "1", name: "Crunchy Taco", description: "Crispy corn shell with seasoned beef", price: 1.99, quantity: 2, category: "tacos" },
      { id: "2", name: "Baja Blast Freeze", description: "MTN DEW Baja Blast freeze", price: 3.49, quantity: 1, category: "drinks" },
    ],
    status: "pending",
    createdAt: new Date(Date.now() - 72000).toISOString(),
    updatedAt: Date.now() - 72000,
    specialInstructions: "NO TOMATOES — ADD EXTRA CREAMY JALAPEÑO",
  },
  {
    id: "2",
    orderNumber: 7743,
    items: [
      { id: "3", name: "Beefy 5-Layer Burrito", description: "5 layers of beefy goodness", price: 3.99, quantity: 1, category: "burritos" },
      { id: "4", name: "Nacho Cheese", description: "Warm nacho cheese dip", price: 1.99, quantity: 1, category: "sides" },
    ],
    status: "pending",
    createdAt: new Date(Date.now() - 48000).toISOString(),
    updatedAt: Date.now() - 48000,
    specialInstructions: "",
  },
];

const MOCK_KITCHEN_ORDERS: Order[] = [
  {
    id: "3",
    orderNumber: 7740,
    items: [
      { id: "5", name: "Quesadilla", description: "Cheesy quesadilla with grilled chicken", price: 4.99, quantity: 2, category: "specialties" },
      { id: "6", name: "Mexican Pizza", description: "Crispy pizza with beef and cheese", price: 5.99, quantity: 1, category: "specialties" },
    ],
    status: "in-progress",
    createdAt: new Date(Date.now() - 180000).toISOString(),
    updatedAt: Date.now() - 120000,
    specialInstructions: "",
  },
];

const MOCK_BAGGING_ORDERS: Order[] = [
  {
    id: "4",
    orderNumber: 7738,
    items: [{ id: "7", name: "Combo Meal", description: "Burrito, chips and drink", price: 8.99, quantity: 1, category: "specialties" }],
    status: "in-progress",
    createdAt: new Date(Date.now() - 300000).toISOString(),
    updatedAt: Date.now() - 60000,
    specialInstructions: "",
  },
];

const MOCK_COMPLETED: Order[] = [
  { id: "5", orderNumber: 7735, items: [{ id: "8", name: "Gordita", description: "Crispy flatbread", price: 3.99, quantity: 1, category: "specialties" }], status: "completed", createdAt: new Date(Date.now() - 600000).toISOString(), updatedAt: Date.now() - 120000, specialInstructions: "" },
  { id: "6", orderNumber: 7734, items: [{ id: "9", name: "Nachos Supreme", description: "Loaded nachos", price: 4.49, quantity: 1, category: "sides" }], status: "completed", createdAt: new Date(Date.now() - 660000).toISOString(), updatedAt: Date.now() - 180000, specialInstructions: "" },
  { id: "7", orderNumber: 7733, items: [{ id: "10", name: "Cheesy Gordita", description: "Cheesy gordita crunch", price: 4.29, quantity: 2, category: "specialties" }], status: "completed", createdAt: new Date(Date.now() - 720000).toISOString(), updatedAt: Date.now() - 240000, specialInstructions: "" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getTimerColor(seconds: number): string {
  if (seconds < 120) return "text-green-400";
  if (seconds < 180) return "text-yellow-400";
  return "text-red-500";
}

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function getAgeLabel(updatedAt: number): string {
  const diffMs = Date.now() - updatedAt;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin === 1) return "1m ago";
  return `${diffMin}m ago`;
}

// ─── Order Cards ───────────────────────────────────────────────────────────────
function LiveOrderCard({ order, onStart }: { order: Order; onStart: () => void }) {
  const ageSec = Math.floor((Date.now() - order.updatedAt) / 1000);
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-surface-container-highest rounded-xl p-4 border border-outline/10"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-headline font-black text-secondary-container text-2xl">#{order.orderNumber}</p>
          <p className="text-[10px] font-label text-on-surface-variant mt-0.5 uppercase tracking-wider">DRIVE-THRU LANE 1</p>
        </div>
        <span className={`font-label font-bold text-sm ${getTimerColor(ageSec)}`}>
          {formatTimer(ageSec)}
        </span>
      </div>
      <div className="space-y-1 mb-3">
        {order.items.map((item) => (
          <p key={item.id} className="text-xs font-label text-on-surface">
            <span className="text-primary font-bold">{item.quantity}x</span> {item.name}
          </p>
        ))}
      </div>
      <button
        onClick={onStart}
        className="w-full py-2.5 rounded-xl bg-secondary-container text-white font-label font-bold text-sm hover:opacity-90 transition-opacity"
      >
        Start Prep
      </button>
    </motion.div>
  );
}

function PrepOrderCard({ order, onBump, isBagging }: { order: Order; onBump: () => void; isBagging?: boolean }) {
  const ageSec = Math.floor((Date.now() - order.updatedAt) / 1000);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-surface-container-highest rounded-xl p-4 border border-outline/10"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-headline font-black text-secondary-container text-xl">#{order.orderNumber}</p>
          <p className="text-[10px] font-label text-on-surface-variant">DRIVE-THRU LANE 1</p>
        </div>
        <div className="text-right">
          <span className={`font-label font-bold text-sm ${getTimerColor(ageSec)}`}>{formatTimer(ageSec)}</span>
          <div className="mt-1">
            <span className="text-[9px] font-label font-bold uppercase px-2 py-0.5 rounded-full bg-tertiary-container text-on-tertiary-container">
              {isBagging ? "Bagging" : "In Kitchen"}
            </span>
          </div>
        </div>
      </div>
      <div className="space-y-1 mb-3">
        {order.items.map((item) => (
          <p key={item.id} className="text-xs font-label text-on-surface">
            <span className="text-tertiary font-bold">{item.quantity}x</span> {item.name}
          </p>
        ))}
      </div>
      <button
        onClick={onBump}
        className="w-full py-2 rounded-xl bg-primary-container text-white font-label font-bold text-xs hover:opacity-90 transition-opacity"
      >
        {isBagging ? "Bump to Ready" : "Move to Bagging"}
      </button>
    </motion.div>
  );
}

function CompletedCard({ order }: { order: Order }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.7 }}
      className="bg-surface-container rounded-xl p-3 border border-outline/5 hover:opacity-100 transition-opacity cursor-pointer"
    >
      <p className="font-headline font-black text-tertiary text-lg">#{order.orderNumber}</p>
      <p className="text-[10px] font-label text-on-surface-variant mt-0.5">READY {getAgeLabel(order.updatedAt)}</p>
      <p className="text-[9px] font-label text-primary mt-1">DRIVE-THRU</p>
    </motion.div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const SIDEBAR_ITEMS = [
  { icon: "fiber_new", label: "Live Orders" },
  { icon: "soup_kitchen", label: "Prep Queue" },
  { icon: "check_circle", label: "Completed" },
  { icon: "analytics", label: "Metrics" },
];

function Sidebar({ active }: { active: string }) {
  return (
    <div className="w-20 bg-surface-container border-r border-outline/10 flex flex-col items-center py-4 gap-2">
      <div className="mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center">
          <span className="material-symbols-outlined text-lg text-white">restaurant</span>
        </div>
      </div>
      {SIDEBAR_ITEMS.map((item) => (
        <button
          key={item.label}
          className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all ${
            active === item.label
              ? "bg-primary-container"
              : "bg-surface-container-high hover:bg-surface-container-highest"
          }`}
        >
          <span className={`material-symbols-outlined text-lg ${active === item.label ? "text-white" : "text-on-surface-variant"}`}>
            {item.icon}
          </span>
          <span className={`text-[8px] font-label font-bold leading-tight text-center ${active === item.label ? "text-white" : "text-on-surface-variant"}`}>
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}

// ─── Top Bar ──────────────────────────────────────────────────────────────────
function TopBar() {
  return (
    <div className="h-16 bg-surface-container border-b border-outline/10 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <h1 className="font-headline font-black text-on-surface text-lg tracking-tight">KDS COMMAND CENTER</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-error/10 border border-error/20">
          <span className="material-symbols-outlined text-sm text-error">warning</span>
          <span className="text-xs font-label font-bold text-error">URGENT: 4</span>
        </div>
        <div className="text-xs font-label text-on-surface-variant">
          AVG PREP: <span className="font-bold text-tertiary">2:45</span>
        </div>
        <select className="bg-surface-container text-xs font-label text-on-surface rounded-lg px-2 py-1.5 border border-outline/10">
          <option>STATION 1 NIGHT SHIFT</option>
          <option>STATION 2 DAY SHIFT</option>
        </select>
        <button className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest transition-colors">
          <span className="material-symbols-outlined text-sm text-on-surface-variant">search</span>
        </button>
        <button className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest transition-colors">
          <span className="material-symbols-outlined text-sm text-on-surface-variant">dashboard</span>
        </button>
        <button className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest transition-colors">
          <span className="material-symbols-outlined text-sm text-on-surface-variant">settings</span>
        </button>
        <button className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest transition-colors">
          <span className="material-symbols-outlined text-sm text-on-surface-variant">logout</span>
        </button>
      </div>
    </div>
  );
}

// ─── Main KDS Page ────────────────────────────────────────────────────────────
export default function KDSPage() {
  const [activeSection, setActiveSection] = useState("Live Orders");
  const [newOrders, setNewOrders] = useState(MOCK_NEW_ORDERS);
  const [kitchenOrders, setKitchenOrders] = useState(MOCK_KITCHEN_ORDERS);
  const [baggingOrders, setBaggingOrders] = useState(MOCK_BAGGING_ORDERS);
  const [completedOrders] = useState(MOCK_COMPLETED);

  const moveToKitchen = (id: string) => {
    const order = newOrders.find((o) => o.id === id);
    if (!order) return;
    setNewOrders((prev) => prev.filter((o) => o.id !== id));
    setKitchenOrders((prev) => [...prev, { ...order, status: "in-progress" as const, updatedAt: Date.now() }]);
  };

  const moveToBagging = (id: string) => {
    const order = kitchenOrders.find((o) => o.id === id);
    if (!order) return;
    setKitchenOrders((prev) => prev.filter((o) => o.id !== id));
    setBaggingOrders((prev) => [...prev, { ...order, updatedAt: Date.now() }]);
  };

  const bumpToReady = (id: string) => {
    setBaggingOrders((prev) => prev.filter((o) => o.id !== id));
  };

  return (
    <div className="min-h-screen bg-surface-dim flex">
      <Sidebar active={activeSection} />

      <div className="flex-1 flex flex-col">
        <TopBar />

        <div className="flex-1 flex overflow-hidden">
          {/* ── LIVE ORDERS ── */}
          <div className="w-[38%] border-r border-outline/10 p-4 overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-lg">fiber_new</span>
              <h2 className="font-headline font-black text-on-surface text-sm uppercase tracking-wider">
                NEW {newOrders.length} ORDERS
              </h2>
            </div>
            <div className="space-y-3">
              {newOrders.map((order) => (
                <LiveOrderCard
                  key={order.id}
                  order={order}
                  onStart={() => moveToKitchen(order.id)}
                />
              ))}
            </div>
          </div>

          {/* ── PREP QUEUE ── */}
          <div className="w-[38%] border-r border-outline/10 p-4 overflow-y-auto custom-scrollbar">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-tertiary text-lg">soup_kitchen</span>
                <h2 className="font-headline font-black text-on-surface text-sm uppercase tracking-wider">
                  IN KITCHEN {kitchenOrders.length} ACTIVE
                </h2>
              </div>
            </div>
            <div className="space-y-3 mb-6">
              {kitchenOrders.map((order) => (
                <PrepOrderCard
                  key={order.id}
                  order={order}
                  onBump={() => moveToBagging(order.id)}
                />
              ))}
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-secondary-container text-lg">inventory_2</span>
                <h2 className="font-headline font-black text-on-surface text-sm uppercase tracking-wider">
                  BAGGING {baggingOrders.length} ACTIVE
                </h2>
              </div>
            </div>
            <div className="space-y-3">
              {baggingOrders.map((order) => (
                <PrepOrderCard
                  key={order.id}
                  order={order}
                  onBump={() => bumpToReady(order.id)}
                  isBagging
                />
              ))}
            </div>
          </div>

          {/* ── COMPLETED ── */}
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-green-400 text-lg">check_circle</span>
              <h2 className="font-headline font-black text-on-surface text-sm uppercase tracking-wider">
                READY {completedOrders.length} RECENT
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {completedOrders.map((order) => (
                <CompletedCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
