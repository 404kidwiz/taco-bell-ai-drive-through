"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  Eye,
  X,
  Loader2,
  ShoppingCart,
  CheckCircle,
  Clock,
  ChefHat,
  Truck,
} from "lucide-react";

interface Order {
  id: string;
  restaurantId: string;
  items: Array<{ name: string; quantity: number; price: number; modifiers?: string[] }>;
  subtotal: number;
  tax: number;
  total: number;
  customer: { name?: string; phone?: string; email?: string };
  orderType: string;
  status: string;
  createdAt: string;
}

const mockOrders: Order[] = [
  { id: "ORD-001", restaurantId: "rest-1", items: [{ name: "Crunchy Taco", quantity: 2, price: 199 }, { name: "Mexican Pizza", quantity: 1, price: 499 }], subtotal: 897, tax: 72, total: 969, customer: { name: "John D.", phone: "+1 770-555-0101" }, orderType: "pickup", status: "completed", createdAt: new Date(Date.now() - 300000).toISOString() },
  { id: "ORD-002", restaurantId: "rest-1", items: [{ name: "Burrito Supreme", quantity: 1, price: 749 }], subtotal: 749, tax: 60, total: 809, customer: { name: "Sarah M.", phone: "+1 770-555-0102" }, orderType: "pickup", status: "preparing", createdAt: new Date(Date.now() - 600000).toISOString() },
  { id: "ORD-003", restaurantId: "rest-1", items: [{ name: "Nachos Bell Grande", quantity: 1, price: 649 }, { name: "Large Drink", quantity: 2, price: 249 }], subtotal: 1147, tax: 92, total: 1239, customer: { name: "Mike R.", phone: "+1 770-555-0103" }, orderType: "pickup", status: "ready", createdAt: new Date(Date.now() - 900000).toISOString() },
  { id: "ORD-004", restaurantId: "rest-1", items: [{ name: "Chicken Quesadilla", quantity: 2, price: 549 }], subtotal: 1098, tax: 88, total: 1186, customer: { name: "Lisa K.", phone: "+1 770-555-0104" }, orderType: "delivery", status: "confirmed", createdAt: new Date(Date.now() - 1200000).toISOString() },
  { id: "ORD-005", restaurantId: "rest-1", items: [{ name: "Crunchwrap Supreme", quantity: 1, price: 599 }, { name: "Cheese Dip", quantity: 1, price: 199 }], subtotal: 798, tax: 64, total: 862, customer: { name: "Tom B.", phone: "+1 770-555-0105" }, orderType: "pickup", status: "received", createdAt: new Date(Date.now() - 1500000).toISOString() },
];

const statuses = ["all", "received", "confirmed", "preparing", "ready", "completed", "cancelled"];

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function getStatusColor(status: string): string {
  switch (status) {
    case "completed": return "bg-green-500/20 text-green-400 border-green-500/30";
    case "preparing": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "ready": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "confirmed": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    case "received": return "bg-[#6D28FF]/20 text-[#cebdff] border-[#6D28FF]/30";
    case "cancelled": return "bg-red-500/20 text-red-400 border-red-500/30";
    default: return "bg-[#494457]/20 text-[#948DA3] border-[#494457]/30";
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "completed": return <CheckCircle size={14} />;
    case "preparing": return <ChefHat size={14} />;
    case "ready": case "confirmed": return <Clock size={14} />;
    case "cancelled": return <X size={14} />;
    default: return <ShoppingCart size={14} />;
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOrders(mockOrders);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.name?.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.phone?.includes(search);
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    const headers = ["Order ID", "Customer", "Phone", "Items", "Total", "Type", "Status", "Date"];
    const rows = filteredOrders.map((o) => [
      o.id,
      o.customer.name || "",
      o.customer.phone || "",
      o.items.map((i) => `${i.quantity}x ${i.name}`).join("; "),
      formatCurrency(o.total),
      o.orderType,
      o.status,
      new Date(o.createdAt).toLocaleString(),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-[#6D28FF]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Orders</h1>
          <p className="text-[#948DA3] text-sm mt-1">{filteredOrders.length} orders found</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1e192b] border border-[#494457] text-white text-sm font-medium hover:bg-[#221d2f] transition-colors"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#948DA3]" size={18} />
          <input
            type="text"
            placeholder="Search by order ID, customer name, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#1e192b] border border-[#494457] text-white placeholder-[#948DA3] focus:outline-none focus:border-[#6D28FF] transition-colors"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${showFilters ? "bg-[#6D28FF]/20 border-[#6D28FF] text-white" : "bg-[#1e192b] border-[#494457] text-[#948DA3] hover:text-white"}`}
        >
          <Filter size={18} />
          Filters
        </button>
      </div>

      {/* Filter options */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 p-4 bg-[#1e192b] rounded-xl border border-[#494457]">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${statusFilter === status ? "bg-[#6D28FF] text-white" : "bg-[#494457]/30 text-[#948DA3] hover:text-white"}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orders table */}
      <div className="bg-[#1e192b] border border-[#494457]/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#494457]/50">
                <th className="text-left px-6 py-4 text-[#948DA3] text-sm font-medium">Order</th>
                <th className="text-left px-6 py-4 text-[#948DA3] text-sm font-medium hidden md:table-cell">Customer</th>
                <th className="text-left px-6 py-4 text-[#948DA3] text-sm font-medium">Items</th>
                <th className="text-left px-6 py-4 text-[#948DA3] text-sm font-medium">Total</th>
                <th className="text-left px-6 py-4 text-[#948DA3] text-sm font-medium hidden lg:table-cell">Time</th>
                <th className="text-left px-6 py-4 text-[#948DA3] text-sm font-medium">Status</th>
                <th className="text-right px-6 py-4 text-[#948DA3] text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-[#494457]/30 hover:bg-[#494457]/10 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{order.id}</p>
                    <p className="text-[#948DA3] text-xs capitalize">{order.orderType}</p>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <p className="text-white">{order.customer.name || "—"}</p>
                    <p className="text-[#948DA3] text-xs">{order.customer.phone || "—"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white text-sm">{order.items.length} item{order.items.length > 1 ? "s" : ""}</p>
                    <p className="text-[#948DA3] text-xs truncate max-w-[150px]">
                      {order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{formatCurrency(order.total)}</p>
                  </td>
                  <td className="px-6 py-4 text-[#948DA3] text-sm hidden lg:table-cell">
                    {formatTime(order.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 rounded-lg bg-[#494457]/30 text-[#948DA3] hover:text-white hover:bg-[#494457]/50 transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                      <button className="p-2 rounded-lg bg-[#494457]/30 text-[#948DA3] hover:text-white hover:bg-[#494457]/50 transition-colors">
                        <ChevronDown size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order detail modal */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setSelectedOrder(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg z-50"
            >
              <div className="bg-[#1e192b] border border-[#494457] rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-[#494457]/50">
                  <h2 className="text-lg font-bold text-white">{selectedOrder.id}</h2>
                  <button onClick={() => setSelectedOrder(null)} className="text-[#948DA3] hover:text-white">
                    <X size={20} />
                  </button>
                </div>
                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                  {/* Status */}
                  <div>
                    <label className="text-[#948DA3] text-sm">Status</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {statuses.filter(s => s !== "all").map((status) => (
                        <button
                          key={status}
                          onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${selectedOrder.status === status ? getStatusColor(status) : "bg-[#494457]/20 text-[#948DA3] border-[#494457]/30 hover:text-white"}`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Customer */}
                  <div>
                    <label className="text-[#948DA3] text-sm">Customer</label>
                    <p className="text-white mt-1">{selectedOrder.customer.name || "Guest"}</p>
                    <p className="text-[#948DA3] text-sm">{selectedOrder.customer.phone || "No phone"}</p>
                  </div>
                  {/* Items */}
                  <div>
                    <label className="text-[#948DA3] text-sm">Items</label>
                    <div className="mt-2 space-y-2">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2 border-b border-[#494457]/30 last:border-0">
                          <div>
                            <p className="text-white">{item.quantity}x {item.name}</p>
                            {item.modifiers && <p className="text-[#948DA3] text-xs">{item.modifiers.join(", ")}</p>}
                          </div>
                          <p className="text-white">{formatCurrency(item.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Totals */}
                  <div className="border-t border-[#494457]/50 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#948DA3]">Subtotal</span>
                      <span className="text-white">{formatCurrency(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#948DA3]">Tax</span>
                      <span className="text-white">{formatCurrency(selectedOrder.tax)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-white">Total</span>
                      <span className="text-[#cebdff]">{formatCurrency(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
