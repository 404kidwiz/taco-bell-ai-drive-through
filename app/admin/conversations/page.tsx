"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  MessageSquare,
  Clock,
  ShoppingCart,
  Flag,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Languages,
} from "lucide-react";

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  callerPhone: string;
  restaurantId: string;
  outcome: "completed" | "abandoned";
  sentiment: "positive" | "neutral" | "negative";
  language: string;
  duration: number;
  items: Array<{ name: string; quantity: number }>;
  flagged: boolean;
  createdAt: string;
  history: ConversationMessage[];
}

const mockConversations: Conversation[] = [
  {
    id: "conv-001",
    callerPhone: "+1 770-555-0101",
    restaurantId: "rest-1",
    outcome: "completed",
    sentiment: "positive",
    language: "en",
    duration: 145,
    items: [{ name: "Crunchy Taco", quantity: 2 }, { name: "Burrito Supreme", quantity: 1 }],
    flagged: false,
    createdAt: new Date(Date.now() - 300000).toISOString(),
    history: [
      { role: "assistant", content: "Hi! Welcome to Taco Bell. What can I get started for you today?", timestamp: new Date(Date.now() - 300000).toISOString() },
      { role: "user", content: "Yeah, let me get 2 crunchy tacos and a burrito supreme", timestamp: new Date(Date.now() - 295000).toISOString() },
      { role: "assistant", content: "Great choices! I've got 2 Crunchy Tacos for $3.98 and a Burrito Supreme for $7.49. That's $11.47 total. Would you like a drink with that?", timestamp: new Date(Date.now() - 290000).toISOString() },
      { role: "user", content: "Sure, give me a large drink", timestamp: new Date(Date.now() - 285000).toISOString() },
      { role: "assistant", content: "Perfect! Large drink added. Your final total is $13.96. What's the name for this order?", timestamp: new Date(Date.now() - 280000).toISOString() },
      { role: "user", content: "John", timestamp: new Date(Date.now() - 275000).toISOString() },
      { role: "assistant", content: "Thanks John! Your order will be ready for pickup in about 10 minutes. We'll text you when it's ready!", timestamp: new Date(Date.now() - 270000).toISOString() },
    ],
  },
  {
    id: "conv-002",
    callerPhone: "+1 770-555-0102",
    restaurantId: "rest-1",
    outcome: "completed",
    sentiment: "neutral",
    language: "en",
    duration: 98,
    items: [{ name: "Mexican Pizza", quantity: 1 }],
    flagged: false,
    createdAt: new Date(Date.now() - 600000).toISOString(),
    history: [
      { role: "assistant", content: "Hi! Welcome to Taco Bell. What can I get started for you today?", timestamp: new Date(Date.now() - 600000).toISOString() },
      { role: "user", content: "One Mexican pizza please", timestamp: new Date(Date.now() - 595000).toISOString() },
      { role: "assistant", content: "I've added a Mexican Pizza for $4.99. Is that everything for you today?", timestamp: new Date(Date.now() - 590000).toISOString() },
      { role: "user", content: "That's it", timestamp: new Date(Date.now() - 585000).toISOString() },
      { role: "assistant", content: "Perfect! Your order total is $5.39. Name for the order?", timestamp: new Date(Date.now() - 580000).toISOString() },
    ],
  },
  {
    id: "conv-003",
    callerPhone: "+1 770-555-0103",
    restaurantId: "rest-1",
    outcome: "abandoned",
    sentiment: "negative",
    language: "en",
    duration: 45,
    items: [],
    flagged: true,
    createdAt: new Date(Date.now() - 900000).toISOString(),
    history: [
      { role: "assistant", content: "Hi! Welcome to Taco Bell. What can I get started for you today?", timestamp: new Date(Date.now() - 900000).toISOString() },
      { role: "user", content: "I want to speak to a human", timestamp: new Date(Date.now() - 895000).toISOString() },
      { role: "assistant", content: "I understand. I'm an AI assistant here to help you order. I can take your order just as fast as a human! What would you like today?", timestamp: new Date(Date.now() - 890000).toISOString() },
    ],
  },
  {
    id: "conv-004",
    callerPhone: "+1 770-555-0104",
    restaurantId: "rest-1",
    outcome: "completed",
    sentiment: "positive",
    language: "es",
    duration: 189,
    items: [{ name: "Nachos Bell Grande", quantity: 1 }, { name: "Chicken Quesadilla", quantity: 2 }],
    flagged: false,
    createdAt: new Date(Date.now() - 1200000).toISOString(),
    history: [
      { role: "assistant", content: "¡Hola! Bienvenido a Taco Bell. ¿Qué le puedo poner hoy?", timestamp: new Date(Date.now() - 1200000).toISOString() },
      { role: "user", content: "Nachos Bell Grande y dos quesadillas de pollo por favor", timestamp: new Date(Date.now() - 1195000).toISOString() },
      { role: "assistant", content: "¡Perfecto! Tengo Nachos Bell Grande por $6.49 y dos Quesadillas de Pollo por $10.98. Son $17.47 en total. ¿Desea algo más?", timestamp: new Date(Date.now() - 1190000).toISOString() },
    ],
  },
];

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function getSentimentColor(sentiment: string): string {
  switch (sentiment) {
    case "positive": return "bg-green-500/20 text-green-400 border-green-500/30";
    case "negative": return "bg-red-500/20 text-red-400 border-red-500/30";
    default: return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  }
}

function getOutcomeColor(outcome: string): string {
  return outcome === "completed" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400";
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState<"all" | "completed" | "abandoned">("all");
  const [sentimentFilter, setSentimentFilter] = useState<"all" | "positive" | "neutral" | "negative">("all");
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setConversations(mockConversations);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = conv.callerPhone.includes(search) || conv.id.toLowerCase().includes(search.toLowerCase());
    const matchesOutcome = outcomeFilter === "all" || conv.outcome === outcomeFilter;
    const matchesSentiment = sentimentFilter === "all" || conv.sentiment === sentimentFilter;
    return matchesSearch && matchesOutcome && matchesSentiment;
  });

  const toggleFlag = (convId: string) => {
    setConversations((prev) => prev.map((c) => c.id === convId ? { ...c, flagged: !c.flagged } : c));
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
      <div>
        <h1 className="text-2xl font-black text-white">Conversation Logs</h1>
        <p className="text-[#948DA3] text-sm mt-1">{filteredConversations.length} conversations</p>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#948DA3]" size={18} />
          <input
            type="text"
            placeholder="Search by phone number or conversation ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#1e192b] border border-[#494457] text-white placeholder-[#948DA3] focus:outline-none focus:border-[#6D28FF] transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value as typeof outcomeFilter)}
            className="px-4 py-3 rounded-xl bg-[#1e192b] border border-[#494457] text-white focus:outline-none focus:border-[#6D28FF]"
          >
            <option value="all">All Outcomes</option>
            <option value="completed">Completed</option>
            <option value="abandoned">Abandoned</option>
          </select>
          <select
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value as typeof sentimentFilter)}
            className="px-4 py-3 rounded-xl bg-[#1e192b] border border-[#494457] text-white focus:outline-none focus:border-[#6D28FF]"
          >
            <option value="all">All Sentiment</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>
        </div>
      </div>

      {/* Conversations list */}
      <div className="bg-[#1e192b] border border-[#494457]/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#494457]/50">
                <th className="text-left px-6 py-4 text-[#948DA3] text-sm font-medium">ID</th>
                <th className="text-left px-6 py-4 text-[#948DA3] text-sm font-medium">Phone</th>
                <th className="text-left px-6 py-4 text-[#948DA3] text-sm font-medium">Outcome</th>
                <th className="text-left px-6 py-4 text-[#948DA3] text-sm font-medium">Items</th>
                <th className="text-left px-6 py-4 text-[#948DA3] text-sm font-medium">Duration</th>
                <th className="text-left px-6 py-4 text-[#948DA3] text-sm font-medium">Sentiment</th>
                <th className="text-left px-6 py-4 text-[#948DA3] text-sm font-medium">Time</th>
                <th className="text-right px-6 py-4 text-[#948DA3] text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredConversations.map((conv) => (
                <tr key={conv.id} className={`border-b border-[#494457]/30 hover:bg-[#494457]/10 transition-colors ${conv.flagged ? "bg-red-500/5" : ""}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {conv.flagged && <Flag size={14} className="text-red-400" />}
                      <p className="text-white font-medium">{conv.id}</p>
                    </div>
                    {conv.language !== "en" && (
                      <span className="flex items-center gap-1 text-xs text-[#948DA3]">
                        <Languages size={10} />
                        {conv.language.toUpperCase()}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white text-sm">{conv.callerPhone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${getOutcomeColor(conv.outcome)}`}>
                      {conv.outcome === "completed" ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                      <span className="capitalize">{conv.outcome}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white text-sm">{conv.items.length > 0 ? conv.items.map((i) => `${i.quantity}x ${i.name}`).join(", ") : "—"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[#948DA3] text-sm">{formatDuration(conv.duration)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium border capitalize ${getSentimentColor(conv.sentiment)}`}>
                      {conv.sentiment}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[#948DA3] text-sm">{formatTime(conv.createdAt)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleFlag(conv.id)}
                        className={`p-2 rounded-lg transition-colors ${conv.flagged ? "bg-red-500/20 text-red-400" : "bg-[#494457]/30 text-[#948DA3] hover:text-red-400"}`}
                      >
                        <Flag size={14} />
                      </button>
                      <button
                        onClick={() => setSelectedConv(conv)}
                        className="p-2 rounded-lg bg-[#494457]/30 text-[#948DA3] hover:text-white hover:bg-[#494457]/50 transition-colors"
                      >
                        <MessageSquare size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conversation detail modal */}
      <AnimatePresence>
        {selectedConv && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
              onClick={() => setSelectedConv(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 md:inset-8 z-50 bg-[#1e192b] rounded-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-[#494457]/50">
                <div>
                  <h2 className="text-lg font-bold text-white">{selectedConv.id}</h2>
                  <p className="text-[#948DA3] text-sm">{selectedConv.callerPhone} • {formatDuration(selectedConv.duration)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getOutcomeColor(selectedConv.outcome)}`}>
                    {selectedConv.outcome}
                  </span>
                  <button
                    onClick={() => toggleFlag(selectedConv.id)}
                    className={`p-2 rounded-lg transition-colors ${selectedConv.flagged ? "bg-red-500/20 text-red-400" : "bg-[#494457]/30 text-[#948DA3] hover:text-red-400"}`}
                  >
                    <Flag size={16} />
                  </button>
                  <button onClick={() => setSelectedConv(null)} className="text-[#948DA3] hover:text-white">
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Transcript */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedConv.history.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] ${msg.role === "user" ? "bg-[#6D28FF] text-white" : "bg-[#494457]/50 text-white"} rounded-2xl px-4 py-3`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.role === "user" ? "text-white/60" : "text-[#948DA3]"}`}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Items ordered */}
              {selectedConv.items.length > 0 && (
                <div className="p-4 border-t border-[#494457]/50 bg-[#0a0612]">
                  <p className="text-[#948DA3] text-sm mb-2">Items Ordered:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedConv.items.map((item, idx) => (
                      <span key={idx} className="px-3 py-1.5 rounded-lg bg-[#494457]/30 text-white text-sm">
                        {item.quantity}x {item.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
