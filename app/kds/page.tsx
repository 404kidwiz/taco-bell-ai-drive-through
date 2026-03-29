"use client";

import { useState } from "react";

// ── Mock Order Data ─────────────────────────────────────────────────────────────
const MOCK_ORDERS = {
  new: [
    {
      id: "1",
      orderNumber: "DRV-7742",
      type: "DRIVE-THRU LANE 1",
      timer: "06:12",
      urgent: true,
      items: [
        { qty: 2, name: "CRUNCHY TACO SUPREME" },
        { qty: 1, name: "BAJA BLAST", note: "NO ICE" },
        { qty: 3, name: "FIRE SAUCE" },
      ],
    },
    {
      id: "2",
      orderNumber: "MOB-1102",
      type: "MOBILE PICKUP",
      timer: "01:45",
      urgent: false,
      items: [
        { qty: 1, name: "CHEESY GORDITA CRUNCH" },
        { qty: 1, name: "MEXICAN PIZZA" },
      ],
    },
    {
      id: "3",
      orderNumber: "DRV-7745",
      type: "DRIVE-THRU LANE 2",
      timer: "00:30",
      urgent: false,
      items: [
        { qty: 4, name: "SOFT TACO" },
        { qty: 1, name: "NACHO FRIES" },
      ],
    },
  ],
  kitchen: [
    {
      id: "4",
      orderNumber: "DRV-7738",
      type: "DRIVE-THRU LANE 1",
      timer: "04:22",
      urgent: false,
      items: [
        { qty: 3, name: "BEEFY 5-LAYER BURRITO" },
        { qty: 2, name: "CHALUPA SUPREME" },
        { qty: 1, name: "LARGE PEPSI" },
      ],
    },
    {
      id: "5",
      orderNumber: "MOB-1098",
      type: "MOBILE PICKUP",
      timer: "02:10",
      urgent: false,
      items: [
        { qty: 1, name: "QUESADILLA - CHICKEN" },
        { qty: 1, name: "SUB STEAK", note: "ALL" },
      ],
    },
  ],
  bagging: [
    {
      id: "6",
      orderNumber: "DRV-7740",
      type: "DRIVE-THRU LANE 1",
      timer: "03:15",
      urgent: false,
      items: [
        { qty: 3, name: "TACO SUPREME", note: "BOXES" },
        { qty: 2, name: "LARGE CUPS" },
      ],
    },
  ],
  ready: [
    { id: "7", orderNumber: "DRV-7735", type: "DRIVE-THRU LANE 1", timeAgo: "2m" },
    { id: "8", orderNumber: "MOB-1085", type: "PICKUP SHELF A", timeAgo: "5m" },
    { id: "9", orderNumber: "WEB-8995", type: "COUNTER", timeAgo: "8m" },
  ],
};

// ── Order Card Types ─────────────────────────────────────────────────────────────
function NewOrderCard({ order, onBump }: { order: typeof MOCK_ORDERS.new[0]; onBump: () => void }) {
  return (
    <div
      className={`rounded-xl p-4 border-l-4 shadow-xl transition-all hover:scale-[1.01] ${
        order.urgent
          ? "bg-surface-container-high border-error animate-pulse shadow-[0_0_20px_rgba(255,106,31,0.15)]"
          : "bg-surface-container-high border-tertiary"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-headline font-black text-2xl tracking-tighter text-white">{order.orderNumber}</h3>
          <p className="text-[10px] font-bold text-[#CBC3DA] uppercase tracking-widest mt-0.5">{order.type}</p>
        </div>
        <span
          className={`px-2 py-1 rounded font-mono text-xs font-bold ${
            order.urgent ? "bg-error text-white animate-pulse" : "bg-tertiary text-[#412d00]"
          }`}
        >
          {order.timer}
        </span>
      </div>
      <ul className="space-y-1.5 mb-6">
        {order.items.map((item, i) => (
          <li key={i} className="flex justify-between text-sm">
            <span className="font-bold text-[#e8def8]">
              {item.qty}x {item.name}
            </span>
            {item.note && <span className="text-[10px] font-bold text-secondary italic uppercase">{item.note}</span>}
          </li>
        ))}
      </ul>
      <button
        onClick={onBump}
        className={`w-full py-3 rounded-full font-headline font-black uppercase tracking-widest text-xs transition-all active:scale-95 ${
          order.urgent
            ? "bg-error text-white hover:brightness-110"
            : "bg-primary-container text-white hover:opacity-90"
        }`}
      >
        Start Prep
      </button>
    </div>
  );
}

function KitchenOrderCard({ order, onBump }: { order: typeof MOCK_ORDERS.kitchen[0]; onBump: () => void }) {
  return (
    <div className="bg-surface-container-high rounded-xl p-4 border-l-4 border-secondary-container shadow-xl">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-headline font-black text-2xl tracking-tighter text-white">{order.orderNumber}</h3>
          <p className="text-[10px] font-bold text-[#CBC3DA] uppercase tracking-widest">{order.type}</p>
        </div>
        <span className="bg-secondary-container text-white px-2 py-1 rounded font-mono text-xs font-bold">{order.timer}</span>
      </div>
      <ul className="space-y-1.5 mb-6">
        {order.items.map((item, i) => (
          <li key={i} className="flex justify-between text-sm">
            <span className="font-bold text-[#e8def8]">
              {item.qty}x {item.name}
            </span>
            {item.note && <span className="text-[10px] font-bold text-secondary italic uppercase">{item.note}</span>}
          </li>
        ))}
      </ul>
      <button
        onClick={onBump}
        className="w-full py-3 bg-primary-container text-white font-headline font-black uppercase tracking-widest text-xs rounded-full shadow-[0_0_15px_rgba(109,40,255,0.4)] transition-all active:scale-95"
      >
        Move to Bagging
      </button>
    </div>
  );
}

function BaggingOrderCard({ order, onBump }: { order: typeof MOCK_ORDERS.bagging[0]; onBump: () => void }) {
  return (
    <div className="bg-surface-container-high rounded-xl p-4 border-l-4 border-[#12D7F2] shadow-xl">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-headline font-black text-2xl tracking-tighter text-white">{order.orderNumber}</h3>
          <p className="text-[10px] font-bold text-[#CBC3DA] uppercase tracking-widest">{order.type}</p>
        </div>
        <span className="bg-[#12D7F2] text-[#151022] px-2 py-1 rounded font-mono text-xs font-bold">{order.timer}</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {order.items.map((item, i) => (
          <span
            key={i}
            className="px-2 py-1 bg-surface-container-lowest border border-outline-variant/30 rounded text-[10px] font-bold text-[#CBC3DA]"
          >
            {item.qty}x {item.name}
          </span>
        ))}
      </div>
      <button
        onClick={onBump}
        className="w-full py-3 bg-[#FFC247] text-[#412d00] font-headline font-black uppercase tracking-widest text-xs rounded-full shadow-[0_0_15px_rgba(255,194,71,0.3)] transition-all active:scale-95"
      >
        Bump to Ready
      </button>
    </div>
  );
}

function ReadyCard({ order }: { order: typeof MOCK_ORDERS.ready[0] }) {
  return (
    <div className="bg-surface-container-low opacity-60 grayscale-[0.5] rounded-xl p-4 border-l-4 border-primary">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-headline font-black text-lg tracking-tighter text-[#CBC3DA]">{order.orderNumber}</h4>
        <span className="text-primary text-[10px] font-bold">READY {order.timeAgo} AGO</span>
      </div>
      <p className="text-[10px] text-[#948DA3] uppercase font-bold tracking-widest">{order.type}</p>
    </div>
  );
}

// ── Column Headers ──────────────────────────────────────────────────────────────
function ColumnHeader({ title, count, color, dot }: { title: string; count: number; color: string; dot?: string }) {
  return (
    <div className="flex items-center justify-between px-2 mb-4">
      <div className="flex items-center gap-2">
        <h2 className={`font-headline font-black text-base tracking-tighter ${color}`}>{title}</h2>
        <span className="text-xs font-normal text-[#494457]">{count} ORDERS</span>
      </div>
      <span className={`w-2 h-2 rounded-full ${dot || "bg-primary"} shadow-[0_0_10px_currentColor]`} />
    </div>
  );
}

// ── Desktop KDS (4 columns) ────────────────────────────────────────────────────
function DesktopKDS() {
  const [newOrders, setNewOrders] = useState(MOCK_ORDERS.new);
  const [kitchenOrders, setKitchenOrders] = useState(MOCK_ORDERS.kitchen);
  const [baggingOrders, setBaggingOrders] = useState(MOCK_ORDERS.bagging);
  const [readyOrders] = useState(MOCK_ORDERS.ready);

  const bumpToKitchen = (id: string) => {
    const order = newOrders.find((o) => o.id === id);
    if (!order) return;
    setNewOrders((prev) => prev.filter((o) => o.id !== id));
    setKitchenOrders((prev) => [...prev, order]);
  };

  const bumpToBagging = (id: string) => {
    const order = kitchenOrders.find((o) => o.id === id);
    if (!order) return;
    setKitchenOrders((prev) => prev.filter((o) => o.id !== id));
    setBaggingOrders((prev) => [...prev, order]);
  };

  const bumpToReady = (id: string) => {
    setBaggingOrders((prev) => prev.filter((o) => o.id !== id));
  };

  return (
    <div className="hidden lg:flex min-h-screen bg-[#151022]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-24 flex flex-col justify-between py-4 bg-[#1E192B] border-r border-[#2C273A] z-50">
        <div className="flex flex-col items-center w-full">
          <div className="mb-8 text-center px-2">
            <p className="font-['Space_Grotesk'] font-bold text-[10px] text-[#12D7F2] tracking-widest uppercase">STATION 1</p>
            <p className="font-['Space_Grotesk'] font-medium text-[8px] text-[#CBC3DA] opacity-60">NIGHT SHIFT</p>
          </div>
          <div className="w-full space-y-1">
            {[
              { icon: "dashboard", label: "Dashboard", active: true },
              { icon: "history", label: "History", active: false },
              { icon: "inventory", label: "Inventory", active: false },
              { icon: "group", label: "Staff", active: false },
            ].map((item) => (
              <button
                key={item.label}
                className={`w-full flex flex-col items-center py-3.5 transition-all active:scale-95 ${
                  item.active
                    ? "bg-[#6D28FF] text-white"
                    : "text-[#CBC3DA] hover:bg-[#2C273A]"
                }`}
              >
                <span className="material-symbols-outlined mb-1 text-lg" style={{ fontVariationSettings: item.active ? "FILL 1" : "FILL 0" }}>
                  {item.icon}
                </span>
                <span className="font-['Space_Grotesk'] font-medium text-[9px] tracking-tight">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
        <button className="text-[#CBC3DA] flex flex-col items-center py-3.5 w-full hover:bg-error-container hover:text-error transition-all active:scale-95">
          <span className="material-symbols-outlined mb-1 text-lg">logout</span>
          <span className="font-['Space_Grotesk'] font-medium text-[9px] tracking-tight">Log Out</span>
        </button>
      </aside>

      {/* Main */}
      <div className="ml-24 flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-20 bg-[#151022] border-b-2 border-[#1E192B] flex justify-between items-center px-8 shadow-[0_0_40px_rgba(109,40,255,0.12)]">
          <div className="flex items-center gap-8">
            <span className="text-2xl font-black text-[#6D28FF] italic font-['Space_Grotesk']">KDS COMMAND CENTER</span>
            <nav className="flex gap-8">
              {[
                { label: "Live Orders", active: true, color: "text-[#FF6A1F] border-[#FF6A1F]" },
                { label: "Prep Queue", active: false, color: "text-[#CBC3DA]" },
                { label: "Completed", active: false, color: "text-[#CBC3DA]" },
                { label: "Station Metrics", active: false, color: "text-[#CBC3DA]" },
              ].map((item) => (
                <a
                  key={item.label}
                  href="#"
                  className={`font-['Space_Grotesk'] uppercase tracking-tighter font-bold text-sm pb-1 border-b-4 transition-colors ${item.color} ${item.active ? "border-b-4" : "border-b-4 border-transparent hover:text-white"}`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="font-['Space_Grotesk'] font-bold text-[#FF6A1F] text-sm">URGENT: 4 OVERDUE</span>
              <span className="font-['Space_Grotesk'] font-medium text-[#12D7F2] text-xs">AVG PREP: 2:45</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">search</span>
            </div>
          </div>
        </header>

        {/* 4-Column Grid */}
        <div className="flex-1 p-6 grid grid-cols-4 gap-6 overflow-hidden">
          {/* NEW */}
          <div className="flex flex-col gap-4 overflow-hidden">
            <ColumnHeader title="NEW" count={newOrders.length} color="text-[#CBC3DA]" dot="bg-[#12D7F2]" />
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
              {newOrders.map((order) => (
                <NewOrderCard key={order.id} order={order} onBump={() => bumpToKitchen(order.id)} />
              ))}
            </div>
          </div>

          {/* IN KITCHEN */}
          <div className="flex flex-col gap-4 overflow-hidden">
            <ColumnHeader title="IN KITCHEN" count={kitchenOrders.length} color="text-[#CBC3DA]" dot="bg-[#FF6A1F]" />
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
              {kitchenOrders.map((order) => (
                <KitchenOrderCard key={order.id} order={order} onBump={() => bumpToBagging(order.id)} />
              ))}
            </div>
          </div>

          {/* BAGGING */}
          <div className="flex flex-col gap-4 overflow-hidden">
            <ColumnHeader title="BAGGING" count={baggingOrders.length} color="text-[#CBC3DA]" dot="bg-[#FFC247]" />
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
              {baggingOrders.map((order) => (
                <BaggingOrderCard key={order.id} order={order} onBump={() => bumpToReady(order.id)} />
              ))}
            </div>
          </div>

          {/* READY */}
          <div className="flex flex-col gap-4 overflow-hidden">
            <ColumnHeader title="READY" count={readyOrders.length} color="text-[#CBC3DA]" dot="bg-primary shadow-[0_0_10px_#cebdff]" />
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
              {readyOrders.map((order) => (
                <ReadyCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        </div>

        {/* Footer Status Bar */}
        <footer className="h-10 bg-[#151022] border-t border-[#1E192B] flex justify-between items-center px-8">
          <div className="flex items-center gap-6">
            <span className="font-['Manrope'] font-mono text-[10px] tracking-widest text-[#12D7F2]">SYSTEM STATUS: OPTIMAL</span>
            <span className="font-['Manrope'] font-mono text-[10px] tracking-widest text-[#CBC3DA]">STATION ID: TB-4022</span>
          </div>
          <div className="flex gap-8">
            {["Kitchen Metrics", "Order Recall", "Help Desk"].map((link) => (
              <a key={link} className="font-['Manrope'] font-mono text-[10px] tracking-widest text-[#CBC3DA] hover:text-[#12D7F2] transition-colors" href="#">
                {link}
              </a>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}

// ── Tablet KDS (2x2 Grid) ──────────────────────────────────────────────────────
function TabletKDS() {
  const [orders, setOrders] = useState({
    new: MOCK_ORDERS.new.slice(0, 2),
    kitchen: MOCK_ORDERS.kitchen,
    bagging: MOCK_ORDERS.bagging,
    ready: MOCK_ORDERS.ready,
  });

  const bumpToKitchen = (id: string) => {
    const order = orders.new.find((o) => o.id === id);
    if (!order) return;
    setOrders((prev) => ({
      ...prev,
      new: prev.new.filter((o) => o.id !== id),
      kitchen: [...prev.kitchen, order],
    }));
  };

  const bumpToBagging = (id: string) => {
    const order = orders.kitchen.find((o) => o.id === id);
    if (!order) return;
    setOrders((prev) => ({
      ...prev,
      kitchen: prev.kitchen.filter((o) => o.id !== id),
      bagging: [...prev.bagging, order],
    }));
  };

  const bumpToReady = (id: string) => {
    setOrders((prev) => ({
      ...prev,
      bagging: prev.bagging.filter((o) => o.id !== id),
    }));
  };

  return (
    <div className="lg:hidden min-h-screen bg-surface text-on-surface font-body overflow-hidden">
      {/* Top App Bar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-20 bg-[#1E192B] border-b border-[#2C273A]/20 shadow-[0_4px_40px_rgba(109,40,255,0.12)]">
        <div className="flex items-center gap-4">
          <span className="text-xl font-black text-[#12D7F2] tracking-tighter font-headline">KDS COMMAND CENTER</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold tracking-widest text-[#12D7F2] uppercase">Avg Prep Time</span>
            <span className="text-xl font-headline font-bold text-white">2:45</span>
          </div>
          <div className="h-8 w-[1px] bg-outline-variant/30" />
          <button className="p-2 hover:bg-[#2C273A] transition-all duration-200 rounded-full text-[#CBC3DA] active:scale-95">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-2 hover:bg-[#2C273A] transition-all duration-200 rounded-full text-[#CBC3DA] active:scale-95">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
      </header>

      {/* SideNav */}
      <nav className="fixed left-0 top-20 h-[calc(100vh-80px)] w-24 flex flex-col justify-between py-4 bg-[#151022] border-r border-[#2C273A]/20 shadow-[10px_0_30px_rgba(21,16,34,0.8)] z-40">
        <div className="flex flex-col items-center gap-3 px-2">
          <div className="mb-4 text-center">
            <div className="w-12 h-12 rounded-full bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center mb-1">
              <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "FILL 1" }}>person</span>
            </div>
            <span className="block text-[8px] font-bold text-[#12D7F2]">STATION 04</span>
          </div>
          {[
            { icon: "fiber_new", label: "New", active: true, color: "text-[#FF6A1F]" },
            { icon: "restaurant", label: "Kitchen", active: false, color: "text-[#CBC3DA]" },
            { icon: "shopping_bag", label: "Bagging", active: false, color: "text-[#CBC3DA]" },
            { icon: "check_circle", label: "Ready", active: false, color: "text-[#CBC3DA]" },
          ].map((item) => (
            <button
              key={item.label}
              className={`w-full flex flex-col items-center justify-center p-3 rounded-xl transition-all active:translate-x-1 duration-200 ${
                item.active
                  ? `bg-[#2C273A] ${item.color}`
                  : "text-[#CBC3DA] opacity-60 hover:bg-[#1E192B] hover:opacity-100"
              }`}
            >
              <span className="material-symbols-outlined mb-1 text-lg" style={{ fontVariationSettings: "FILL 1" }}>{item.icon}</span>
              <span className="font-['Space_Grotesk'] font-bold text-[10px] uppercase">{item.label}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-col items-center gap-4 px-2">
          <button className="w-full py-2 bg-error-container/20 text-error rounded-lg flex flex-col items-center justify-center border border-error/30 active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-sm">report</span>
            <span className="text-[7px] font-bold mt-1">EMERGENCY</span>
          </button>
        </div>
      </nav>

      {/* Main 2x2 Grid */}
      <main className="ml-24 mt-20 h-[calc(100vh-80px)] p-4 overflow-hidden">
        <div className="grid grid-cols-2 grid-rows-2 h-full gap-4">
          {/* NEW */}
          <section className="bg-surface-container-low rounded-xl p-4 flex flex-col border-t-4 border-primary-container relative overflow-hidden">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "FILL 1" }}>bolt</span>
                <h2 className="font-headline font-bold text-base tracking-wider text-primary">NEW ORDERS</h2>
              </div>
              <span className="bg-primary-container/20 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold">{orders.new.length} IN QUEUE</span>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
              {orders.new.map((order) => (
                <NewOrderCard key={order.id} order={order} onBump={() => bumpToKitchen(order.id)} />
              ))}
            </div>
          </section>

          {/* IN KITCHEN */}
          <section className="bg-surface-container-low rounded-xl p-4 flex flex-col border-t-4 border-secondary-container relative overflow-hidden">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-lg" style={{ fontVariationSettings: "FILL 1" }}>restaurant</span>
                <h2 className="font-headline font-bold text-base tracking-wider text-secondary">IN KITCHEN</h2>
              </div>
              <span className="bg-secondary-container/20 text-secondary px-2 py-0.5 rounded-full text-[10px] font-bold">{orders.kitchen.length} ACTIVE</span>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
              {orders.kitchen.map((order) => (
                <KitchenOrderCard key={order.id} order={order} onBump={() => bumpToBagging(order.id)} />
              ))}
            </div>
          </section>

          {/* BAGGING */}
          <section className="bg-surface-container-low rounded-xl p-4 flex flex-col border-t-4 border-[#12D7F2] relative overflow-hidden">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#12D7F2] text-lg" style={{ fontVariationSettings: "FILL 1" }}>shopping_bag</span>
                <h2 className="font-headline font-bold text-base tracking-wider text-[#12D7F2]">BAGGING</h2>
              </div>
              <span className="bg-[#12D7F2]/20 text-[#12D7F2] px-2 py-0.5 rounded-full text-[10px] font-bold">{orders.bagging.length} ACTIVE</span>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
              {orders.bagging.map((order) => (
                <BaggingOrderCard key={order.id} order={order} onBump={() => bumpToReady(order.id)} />
              ))}
            </div>
          </section>

          {/* READY */}
          <section className="bg-surface-container-low rounded-xl p-4 flex flex-col border-t-4 border-[#4ADE80] relative overflow-hidden">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4ADE80] text-lg" style={{ fontVariationSettings: "FILL 1" }}>check_circle</span>
                <h2 className="font-headline font-bold text-base tracking-wider text-[#4ADE80]">READY</h2>
              </div>
              <span className="bg-[#4ADE80]/20 text-[#4ADE80] px-2 py-0.5 rounded-full text-[10px] font-bold">RECENT</span>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
              {orders.ready.map((order) => (
                <ReadyCard key={order.id} order={order} />
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* AI Status Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[400px] h-12 bg-surface-container-high/80 backdrop-blur-xl rounded-full border border-outline-variant/20 flex items-center px-6 gap-4 shadow-2xl z-50">
        <div className="w-3 h-3 bg-[#12D7F2] rounded-full animate-pulse shadow-[0_0_10px_#12D7F2]" />
        <span className="text-xs font-bold tracking-widest text-[#12D7F2] uppercase font-headline">AI ASSISTANT ACTIVE</span>
        <div className="flex-1 h-1 bg-[#12D7F2]/20 rounded-full overflow-hidden">
          <div className="h-full bg-[#12D7F2] w-2/3 animate-pulse" />
        </div>
        <span className="text-[10px] font-bold opacity-70 italic">"Monitoring grill..."</span>
      </div>
    </div>
  );
}

// ── Main KDS Page ──────────────────────────────────────────────────────────────
export default function KDSPage() {
  return (
    <>
      <DesktopKDS />
      <TabletKDS />
    </>
  );
}
