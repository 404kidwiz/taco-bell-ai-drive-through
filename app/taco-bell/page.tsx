"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import { useLanguage } from "../lib/i18n";
import { useCartStore } from "../hooks/useCartStore";
import { useRewards } from "../hooks/useRewards";
import { useVoiceAI } from "../hooks/useVoiceAI";
import type { CartItem, MenuItem } from "../types";
import { SessionRecorder, saveRecording, downloadRecordingAsJson } from "../lib/session-recorder";

const AI_WELCOME = "Welcome to Taco Bell! I'm your AI drive-through assistant. What can I get for you?";

const QUICK_PROMPTS = [
  "I'll take a Crunchwrap Supreme",
  "Give me 3 Doritos Locos Tacos",
  "What's popular?",
  "That's all, thanks",
];

const FEATURE_PILLS = [
  { icon: "chat_bubble", label: "Speak Naturally" },
  { icon: "auto_awesome", label: "AI Smart Menu" },
  { icon: "shutter_speed", label: "Ready for Pickup" },
];

const MENU_ITEMS_ARR = [
  { name: "CRUNCHWRAP SUPREME", price: 4.49, qty: 1 },
  { name: "CHEESY GORDITA CRUNCH", price: 4.29, qty: 1 },
  { name: "Baja Blast Freeze", price: 2.99, qty: 2 },
  { name: "NACHO FRIES", price: 2.99, qty: 1 },
];

// ── Chat Message ──────────────────────────────────────────────────────────────
function ChatMessage({ role, content }: { role: "user" | "assistant"; content: string }) {
  const isAI = role === "assistant";
  return (
    <div className={`flex ${isAI ? "justify-start" : "justify-end"} mb-3`}>
      <div
        className={`max-w-[80%] rounded-xl px-4 py-3 text-sm font-label leading-relaxed ${
          isAI
            ? "bg-surface-container-low border border-outline/10 rounded-tl-sm text-[#CBC3DA]"
            : "bg-secondary-container text-white rounded-tr-sm"
        }`}
      >
        {isAI && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="material-symbols-outlined text-primary text-xs" style={{ fontVariationSettings: "FILL 1" }}>auto_awesome</span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Drive-Through AI</span>
          </div>
        )}
        {content}
      </div>
    </div>
  );
}

// ── Chat Panel (shared between desktop and mobile) ────────────────────────────
function ChatPanel({
  messages,
  input,
  setInput,
  onSend,
  onQuickPrompt,
  isLoading,
}: {
  messages: { role: "user" | "assistant"; content: string }[];
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  onQuickPrompt: (prompt: string) => void;
  isLoading: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Chat messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-1 min-h-0">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <span className="material-symbols-outlined text-5xl text-primary mb-3 block">drive_eta</span>
              <p className="text-[#948DA3] font-label text-sm">Start chatting or use voice to order</p>
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} />
        ))}
        {isLoading && (
          <div className="flex justify-start mb-3">
            <div className="bg-surface-container-low border border-outline/10 rounded-xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick prompts */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onQuickPrompt(prompt)}
            className="whitespace-nowrap rounded-full bg-surface-container-low border border-outline/10 px-3 py-1.5 text-[11px] font-label font-bold text-[#CBC3DA] hover:bg-surface-container hover:text-white transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 px-4 pb-4 pt-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && onSend()}
          placeholder="Type your order..."
          className="flex-1 bg-surface-container-low border border-outline/10 rounded-xl px-4 py-3 text-sm font-label text-white placeholder:text-[#948DA3] focus:outline-none focus:border-primary/50"
        />
        <button
          onClick={onSend}
          disabled={!input.trim() || isLoading}
          className="bg-secondary-container text-white rounded-xl px-4 py-3 hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-xl">send</span>
        </button>
      </div>
    </div>
  );
}

// ── Desktop Left Voice + Chat Panel ──────────────────────────────────────────
function VoicePanel({
  isConnected, isSpeaking, lastMessage, error, onToggle,
  messages, input, setInput, onSend, onQuickPrompt, isChatLoading, mode, setMode,
}: {
  isConnected: boolean;
  isSpeaking: boolean;
  lastMessage: string;
  error: string | null;
  onToggle: () => void;
  messages: { role: "user" | "assistant"; content: string }[];
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  onQuickPrompt: (prompt: string) => void;
  isChatLoading: boolean;
  mode: "voice" | "chat";
  setMode: (m: "voice" | "chat") => void;
}) {
  return (
    <div className="flex flex-col min-h-[calc(100vh-160px)] relative">
      {/* Background */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(109,40,255,0.3) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col h-full">
        {/* Brand + Mode Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="font-headline font-black text-primary text-xl italic tracking-widest uppercase">
            Nocturnal Drive-Through
          </div>
          <div className="flex bg-surface-container-low rounded-full p-0.5 border border-outline/10">
            <button
              onClick={() => setMode("voice")}
              className={`rounded-full px-4 py-1.5 text-[10px] font-label font-bold uppercase tracking-widest transition-colors ${
                mode === "voice" ? "bg-secondary-container text-white" : "text-[#948DA3]"
              }`}
            >
              Voice
            </button>
            <button
              onClick={() => setMode("chat")}
              className={`rounded-full px-4 py-1.5 text-[10px] font-label font-bold uppercase tracking-widest transition-colors ${
                mode === "chat" ? "bg-secondary-container text-white" : "text-[#948DA3]"
              }`}
            >
              Chat
            </button>
          </div>
        </div>

        {mode === "voice" ? (
          <>
            {/* Tagline */}
            <h1 className="font-headline font-black text-white text-5xl lg:text-6xl xl:text-7xl tracking-tight leading-none mb-6">
              CRUNCH NOW.<br />
              <span className="text-primary">TALK LATER.</span>
            </h1>

            <p className="text-[#CBC3DA] font-label text-base mb-10 max-w-md leading-relaxed">
              Our AI assistant takes your order by voice — no app, no waiting, just fire.
            </p>

            {/* Mic Button */}
            <div className="flex flex-col items-start gap-4 mb-8">
              <button
                className={`voice-btn-ring w-24 h-24 rounded-full bg-secondary-container flex items-center justify-center neon-glow-secondary hover:scale-105 active:scale-95 transition-transform ${error?.includes("Chrome or Edge") ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={error?.includes("Chrome or Edge") ? undefined : onToggle}
                disabled={error?.includes("Chrome or Edge")}
              >
                <span className="material-symbols-outlined text-4xl text-white">
                  {error?.includes("Chrome or Edge") ? "mic_off" : isConnected ? (isSpeaking ? "record_voice_over" : "hearing") : "mic"}
                </span>
              </button>

              <div className="flex items-center gap-3">
                <span className="text-[10px] font-label font-bold uppercase tracking-[0.2em] text-primary">
                  {error?.includes("Chrome or Edge") ? "Browser not supported" : error ? "Mic access denied" : isConnected ? (isSpeaking ? "AI Speaking..." : "Listening...") : "Tap to Start Voice Order"}
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className={`animate-ping absolute inline-flex h-2 w-2 rounded-full ${isConnected ? "bg-baja-cyan opacity-75" : "bg-primary opacity-0"}`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? "bg-baja-cyan" : "bg-primary"}`} />
                </span>
              </div>

              {isConnected && (
                <div className="flex items-end gap-1 h-16 mt-2">
                  {[4, 8, 12, 9, 14, 11, 6, 10].map((h, i) => (
                    <div
                      key={i}
                      className="w-2 rounded-full bg-baja-cyan animate-pulse"
                      style={{ height: `${h * 4}px`, animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Speech bubble */}
            <div className="relative bg-surface-container-low rounded-xl rounded-tl-sm p-5 max-w-sm border border-outline/10">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "FILL 1" }}>auto_awesome</span>
                <span className="text-[10px] font-label font-bold uppercase tracking-widest text-primary">AI Assistant</span>
              </div>
              <p className="text-sm font-label text-[#CBC3DA] leading-relaxed">
                {error?.includes("Chrome or Edge") ? (
                  <>
                    Voice ordering works best in Chrome.{" "}
                    <a href="https://www.google.com/chrome/" target="_blank" rel="noopener noreferrer" className="text-baja-cyan underline">
                      Download Chrome →
                    </a>
                  </>
                ) : error ? error : lastMessage || AI_WELCOME}
              </p>
              <div className="absolute -bottom-2 left-8 w-4 h-4 bg-surface-container-low rotate-45 border-b border-r border-outline/10" />
            </div>
          </>
        ) : (
          /* Chat mode */
          <div className="flex-1 min-h-0 bg-surface-container/50 rounded-2xl border border-outline/10 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-outline/10 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-sm">drive_eta</span>
              <span className="text-[10px] font-label font-bold uppercase tracking-widest text-primary">Drive-Through Chat</span>
            </div>
            <ChatPanel
              messages={messages}
              input={input}
              setInput={setInput}
              onSend={onSend}
              onQuickPrompt={onQuickPrompt}
              isLoading={isChatLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Desktop Right Rewards Panel ───────────────────────────────────────────────
function RewardsPanel({ points, pointsToNextTier, cart, onAddItem }: {
  points: number;
  pointsToNextTier: number;
  cart: CartItem[];
  onAddItem: (item: MenuItem) => void;
}) {
  const nextTierTotal = pointsToNextTier + points > 0 ? points / (pointsToNextTier + points) : 0;
  const progressPct = Math.min(100, Math.round(nextTierTotal * 100));

  return (
    <div className="flex flex-col justify-center min-h-[calc(100vh-160px)] gap-8">
      <div className="bg-surface-container-low rounded-xl p-6 border border-outline/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-label font-bold uppercase tracking-widest text-[#CBC3DA]">Rewards</span>
          <span className="material-symbols-outlined text-secondary-container text-xl">local_fire_department</span>
        </div>
        <p className="text-[10px] font-label text-[#948DA3] mb-0.5">Fire Points Balance</p>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-headline font-black text-white text-5xl tracking-tighter">{points.toLocaleString()}</span>
          <span className="text-sm font-label text-[#948DA3]">PTS</span>
        </div>
        <div className="w-full h-1.5 bg-surface-container-highest rounded-full mt-2 overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
        <p className="text-[10px] text-[#948DA3] mt-1.5 font-label">
          {pointsToNextTier > 0 ? `${pointsToNextTier} pts to next tier` : "Max tier reached!"}
        </p>

        <div className="mt-6 space-y-3">
          <p className="text-[10px] font-label font-bold uppercase tracking-widest text-[#CBC3DA] mb-3">
            {cart.length > 0 ? "YOUR ORDER" : "QUICK ADD"}
          </p>
          {cart.length > 0 ? (
            cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-surface-container rounded-lg px-4 py-3">
                <div>
                  <p className="font-label font-bold text-xs text-white">{item.quantity}x {item.name}</p>
                  <p className="text-[10px] text-[#948DA3] font-label">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))
          ) : (
            MENU_ITEMS_ARR.map((item) => (
              <div key={item.name} className="flex items-center justify-between bg-surface-container rounded-lg px-4 py-3">
                <div>
                  <p className="font-label font-bold text-xs text-white">{item.qty}x {item.name}</p>
                  <p className="text-[10px] text-[#948DA3] font-label">${item.price.toFixed(2)}</p>
                </div>
                <button className="w-7 h-7 rounded-full bg-secondary-container flex items-center justify-center hover:opacity-80 transition-opacity">
                  <span className="material-symbols-outlined text-xs text-white">add</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {FEATURE_PILLS.map((pill) => (
          <div key={pill.label} className="flex items-center gap-2 bg-surface-container-low rounded-full px-4 py-2.5 border border-outline/10">
            <span className="material-symbols-outlined text-xs text-primary">{pill.icon}</span>
            <span className="text-[11px] font-label font-bold text-[#CBC3DA]">{pill.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Mobile Voice + Chat UI ────────────────────────────────────────────────────
function MobileVoiceUI({
  isConnected, isSpeaking, lastMessage, error, onToggle,
  messages, input, setInput, onSend, onQuickPrompt, isChatLoading, mode, setMode,
}: {
  isConnected: boolean;
  isSpeaking: boolean;
  lastMessage: string;
  error: string | null;
  onToggle: () => void;
  messages: { role: "user" | "assistant"; content: string }[];
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  onQuickPrompt: (prompt: string) => void;
  isChatLoading: boolean;
  mode: "voice" | "chat";
  setMode: (m: "voice" | "chat") => void;
}) {
  return (
    <div className="flex flex-col min-h-[calc(100vh-200px)] px-6">
      {/* Brand + Mode Toggle */}
      <div className="flex items-center justify-between pt-4 mb-4">
        <div className="font-headline font-black text-primary text-lg italic tracking-widest uppercase">
          Nocturnal
        </div>
        <div className="flex bg-surface-container-low rounded-full p-0.5 border border-outline/10">
          <button
            onClick={() => setMode("voice")}
            className={`rounded-full px-3 py-1 text-[10px] font-label font-bold uppercase tracking-widest transition-colors ${
              mode === "voice" ? "bg-secondary-container text-white" : "text-[#948DA3]"
            }`}
          >
            Voice
          </button>
          <button
            onClick={() => setMode("chat")}
            className={`rounded-full px-3 py-1 text-[10px] font-label font-bold uppercase tracking-widest transition-colors ${
              mode === "chat" ? "bg-secondary-container text-white" : "text-[#948DA3]"
            }`}
          >
            Chat
          </button>
        </div>
      </div>

      {mode === "voice" ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-8">
          <div className="text-center">
            <h1 className="font-headline font-black text-white text-4xl tracking-tight leading-none mb-2">
              CRUNCH NOW.<br />TALK LATER.
            </h1>
          </div>

          <button
            className={`voice-btn-ring w-32 h-32 rounded-full bg-secondary-container flex items-center justify-center neon-glow-secondary hover:scale-105 active:scale-95 transition-transform ${error?.includes("Chrome or Edge") ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={error?.includes("Chrome or Edge") ? undefined : onToggle}
            disabled={error?.includes("Chrome or Edge")}
          >
            <span className="material-symbols-outlined text-5xl text-white">
              {error?.includes("Chrome or Edge") ? "mic_off" : isConnected ? (isSpeaking ? "record_voice_over" : "hearing") : "mic"}
            </span>
          </button>

          <div className="text-center">
            <p className="font-headline font-bold text-white text-xl mb-2">
              {error?.includes("Chrome or Edge") ? "Browser Not Supported" : error ? "Mic Error" : isConnected ? (isSpeaking ? "AI Speaking..." : "Listening...") : "START VOICE ORDER"}
            </p>
            <p className="text-xs text-[#CBC3DA] font-label">
              {error?.includes("Chrome or Edge") ? "Please use Chrome or Edge for voice ordering" : error ? error : isConnected ? "Speak naturally to order" : "Tap the button to begin"}
            </p>
          </div>

          {isConnected && (
            <div className="flex items-end gap-1 h-14">
              {[6, 10, 14, 11, 16, 13, 8, 12].map((h, i) => (
                <div key={i} className="w-2 bg-baja-cyan rounded-full animate-pulse" style={{ height: `${h * 3}px`, animationDelay: `${i * 0.12}s` }} />
              ))}
            </div>
          )}

          <div className="relative bg-surface-container-low rounded-xl rounded-tl-sm p-4 max-w-xs border border-outline/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary text-xs">auto_awesome</span>
              <span className="text-[10px] font-label font-bold uppercase tracking-widest text-primary">AI</span>
            </div>
            <p className="text-xs font-label text-[#CBC3DA]">
              {error?.includes("Chrome or Edge") ? (
                <>
                  Voice ordering works best in Chrome.{" "}
                  <a href="https://www.google.com/chrome/" target="_blank" rel="noopener noreferrer" className="text-baja-cyan underline">Download Chrome →</a>
                </>
              ) : error ? error : lastMessage || AI_WELCOME}
            </p>
            <div className="absolute -bottom-2 left-8 w-3 h-3 bg-surface-container-low rotate-45 border-b border-r border-outline/10" />
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 bg-surface-container/50 rounded-2xl border border-outline/10 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-outline/10 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-sm">drive_eta</span>
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-primary">Drive-Through Chat</span>
          </div>
          <ChatPanel
            messages={messages}
            input={input}
            setInput={setInput}
            onSend={onSend}
            onQuickPrompt={onQuickPrompt}
            isLoading={isChatLoading}
          />
        </div>
      )}
    </div>
  );
}

// ── Bottom Tab Bar ────────────────────────────────────────────────────────────
function BottomTabBar({ cartCount }: { cartCount: number }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1E192B]/60 backdrop-blur-xl rounded-t-[2rem] shadow-[0_-10px_30px_rgba(109,40,255,0.15)]">
      <div className="flex justify-around items-center px-6 pt-4 pb-8 w-full">
        <Link href="/menu" className="flex flex-col items-center justify-center text-[#CBC3DA] opacity-70 font-label text-[12px] font-bold uppercase tracking-widest active:scale-95 transition-all duration-200 hover:opacity-100 hover:text-baja-cyan">
          <span className="material-symbols-outlined text-2xl mb-1">restaurant_menu</span>
          Menu
        </Link>
        <button className="flex flex-col items-center justify-center bg-primary-container text-white rounded-full px-6 py-2.5 shadow-[0_0_15px_rgba(109,40,255,0.5)] font-label text-[12px] font-bold uppercase tracking-widest active:scale-95 transition-all duration-200">
          <span className="material-symbols-outlined text-2xl mb-1">receipt_long</span>
          Order
        </button>
        <button className="flex flex-col items-center justify-center text-[#CBC3DA] opacity-70 font-label text-[12px] font-bold uppercase tracking-widest active:scale-95 transition-all duration-200 hover:opacity-100 hover:text-baja-cyan">
          <span className="material-symbols-outlined text-2xl mb-1">directions_car</span>
          Pickup
        </button>
      </div>
    </div>
  );
}

// ── Main Landing Page ─────────────────────────────────────────────────────────
export default function LandingPage() {
  const { items: cart, addItem } = useCartStore();
  const { points, pointsToNextTier } = useRewards();
  const { lang } = useLanguage();
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const [transcript, setTranscript] = useState("");

  // Chat state
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [mode, setMode] = useState<"voice" | "chat">("voice");
  const recorderRef = useRef<SessionRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showSaveButton, setShowSaveButton] = useState(false);

  const ensureRecorder = () => {
    if (!recorderRef.current) {
      recorderRef.current = new SessionRecorder("taco-bell");
      setIsRecording(true);
    }
    return recorderRef.current;
  };

  useEffect(() => {
    const handleLeave = () => {
      if (recorderRef.current && isRecording) {
        const rec = recorderRef.current.stop();
        saveRecording(rec);
      }
    };
    window.addEventListener("beforeunload", handleLeave);
    return () => { window.removeEventListener("beforeunload", handleLeave); handleLeave(); };
  }, [isRecording]);

  const { isConnected, isSpeaking, lastMessage, error, connect, disconnect, sendChatMessage } = useVoiceAI({
    onMessage: () => {},
    onTranscript: (text) => setTranscript(text),
    onAddItem: (item) => addItem({ ...item, quantity: 1 }),
    onStreamingUpdate: (partial) => {
      // Update the last assistant message with streaming text
      setChatMessages((prev) => {
        if (prev.length > 0 && prev[prev.length - 1].role === "assistant") {
          return [...prev.slice(0, -1), { role: "assistant" as const, content: partial }];
        }
        return [...prev, { role: "assistant" as const, content: partial }];
      });
    },
    language: lang,
  });

  const handleVoiceToggle = () => {
    if (isConnected) disconnect();
    else connect();
  };

  const handleChatSend = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    const msg = chatInput.trim();
    setChatInput("");
    const rec = ensureRecorder();
    rec.recordEvent("user_message", msg);
    setChatMessages((prev) => [...prev, { role: "user", content: msg }]);
    setIsChatLoading(true);

    await new Promise((r) => setTimeout(r, 250));

    try {
      const response = await sendChatMessage(msg);
      rec.recordEvent("ai_response", response);
      setChatMessages((prev) => {
        if (prev.length > 0 && prev[prev.length - 1].role === "assistant") {
          return [...prev.slice(0, -1), { role: "assistant", content: response }];
        }
        return [...prev, { role: "assistant", content: response }];
      });
    } catch {
      rec.recordEvent("ai_response", "Sorry, having trouble there. Try again?");
      setChatMessages((prev) => [...prev, { role: "assistant", content: "Sorry, having trouble there. Try again?" }]);
    }
    setIsChatLoading(false);
  };

  const handleQuickPrompt = async (prompt: string) => {
    setChatMessages((prev) => [...prev, { role: "user", content: prompt }]);
    setIsChatLoading(true);

    await new Promise((r) => setTimeout(r, 250));

    try {
      const response = await sendChatMessage(prompt);
      setChatMessages((prev) => {
        if (prev.length > 0 && prev[prev.length - 1].role === "assistant") {
          return [...prev.slice(0, -1), { role: "assistant", content: response }];
        }
        return [...prev, { role: "assistant", content: response }];
      });
    } catch {
      setChatMessages((prev) => [...prev, { role: "assistant", content: "Sorry, having trouble there. Try again?" }]);
    }
    setIsChatLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface-dim pb-28 overflow-hidden">
      <Nav />

      {/* Desktop: split layout */}
      <div className="hidden md:flex flex-row min-h-screen pt-24">
        <div className="w-[55%] px-8 lg:px-16 xl:px-24">
          <VoicePanel
            isConnected={isConnected} isSpeaking={isSpeaking} lastMessage={lastMessage} error={error} onToggle={handleVoiceToggle}
            messages={chatMessages} input={chatInput} setInput={setChatInput} onSend={handleChatSend}
            onQuickPrompt={handleQuickPrompt} isChatLoading={isChatLoading} mode={mode} setMode={setMode}
          />
        </div>
        <div className="w-[45%] px-6 lg:px-10 xl:px-16">
          <RewardsPanel points={points} pointsToNextTier={pointsToNextTier} cart={cart} onAddItem={(item) => addItem({ ...item, quantity: 1 })} />
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden pt-20">
        <MobileVoiceUI
          isConnected={isConnected} isSpeaking={isSpeaking} lastMessage={lastMessage} error={error} onToggle={handleVoiceToggle}
          messages={chatMessages} input={chatInput} setInput={setChatInput} onSend={handleChatSend}
          onQuickPrompt={handleQuickPrompt} isChatLoading={isChatLoading} mode={mode} setMode={setMode}
        />
      </div>

      <BottomTabBar cartCount={cartCount} />
    </div>
  );
}
