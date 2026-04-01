"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneCall, MessageCircle, Send, ArrowRight, Clock, CheckCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { PIZZA_MENU_ITEMS } from "../data/pizza-menu";
import { fetchStream } from "../lib/stream";
import { useLanguage } from "../lib/i18n";
import { SessionRecorder, saveRecording } from "../lib/session-recorder";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const HOW_IT_WORKS_STEPS = [
  {
    icon: PhoneCall,
    title: "Call In",
    desc: "Dial +1 (770) 525-5393 anytime — our AI picks up instantly, 24/7.",
  },
  {
    icon: MessageCircle,
    title: "AI Takes Your Order",
    desc: "Talk naturally. Luigi knows the full menu, suggests pairings, and confirms every detail.",
  },
  {
    icon: CheckCircle,
    title: "Order Confirmed",
    desc: "Get a text with your order summary and estimated pickup time. That's it.",
  },
];

function PhoneMockup({ messages, isTyping }: { messages: ChatMessage[]; isTyping: boolean }) {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      {/* Phone frame */}
      <div className="rounded-[2.5rem] border-2 border-[#2a1520] bg-[#0d0608] overflow-hidden shadow-[0_0_60px_rgba(230,57,70,0.1)]">
        {/* Notch */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-28 h-6 bg-[#1a0d10] rounded-full" />
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between px-8 py-2">
          <span className="text-[10px] text-[#948DA3] font-medium">9:41</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-2 border border-[#948DA3] rounded-sm">
              <div className="w-2.5 h-full bg-[#4ade80] rounded-sm" />
            </div>
          </div>
        </div>

        {/* Caller info */}
        <div className="flex flex-col items-center py-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#e63946] to-[#ff6b35] flex items-center justify-center mb-3">
            <Phone size={24} className="text-white" />
          </div>
          <p className="text-white font-bold text-lg">OrderFlow Pizza</p>
          <p className="text-[#948DA3] text-xs">Incoming call...</p>
        </div>

        {/* Chat area */}
        <div className="px-4 pb-4 space-y-3 min-h-[300px] max-h-[300px] overflow-y-auto">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#e63946] text-white rounded-br-sm"
                      : "bg-[#1a0d10] text-[#CBC3DA] border border-[#2a1520] rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-[#1a0d10] border border-[#2a1520] rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5">
                <span className="w-2 h-2 bg-[#e63946]/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-[#e63946]/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-[#e63946]/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </motion.div>
          )}
        </div>

        {/* Input area */}
        <div className="px-4 pb-8 pt-2">
          <p className="text-[10px] text-center text-[#948DA3]/50">
            Type below to simulate the call ↓
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PizzaPage() {
  const { lang } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hey, thanks for calling OrderFlow Pizza! This is Luigi — I'm ready to take your order. What can I get started for you tonight? 🍕",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [activeMenuCategory, setActiveMenuCategory] = useState<string>("pizza");
  const recorderRef = useRef<SessionRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showSaveButton, setShowSaveButton] = useState(false);

  const ensureRecorder = () => {
    if (!recorderRef.current) {
      recorderRef.current = new SessionRecorder("pizza");
      setIsRecording(true);
      // Record the AI welcome message as first event
      recorderRef.current.recordEvent(
        "ai_response",
        "Hey, thanks for calling OrderFlow Pizza! This is Luigi — I'm ready to take your order. What can I get started for you tonight? 🍕"
      );
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const rec = ensureRecorder();
    rec.recordEvent("user_message", text);

    const userMsg: ChatMessage = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    // Detect order placement
    const lowerText = text.toLowerCase();
    const isOrderPlaced =
      lowerText.includes("place my order") ||
      lowerText.includes("thats all") ||
      lowerText.includes("that's all") ||
      lowerText.includes("order is ready") ||
      lowerText.includes("go ahead") ||
      lowerText.includes("place order");
    if (isOrderPlaced) {
      rec.recordEvent("order_placed", text);
      recorderRef.current?.stop();
      setIsRecording(false);
      setShowSaveButton(true);
    }

    try {
      // Show typing for 250ms for natural feel
      await new Promise((r) => setTimeout(r, 250));

      const fullText = await fetchStream(
        "/api/pizza-chat",
        { messages: newMessages.map((m) => ({ role: m.role, content: m.content })), language: lang },
        (streamed) => {
          setMessages([...newMessages, { role: "assistant", content: streamed }]);
        },
      );
      rec.recordEvent("ai_response", fullText);
      setMessages([...newMessages, { role: "assistant", content: fullText }]);
    } catch {
      rec.recordEvent("ai_response", "Sorry, having some trouble with the line. Can you repeat that?");
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Sorry, having some trouble with the line. Can you repeat that?" },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const categories = ["pizza", "sides", "drinks", "desserts"];
  const filteredItems = PIZZA_MENU_ITEMS.filter((item) => item.category === activeMenuCategory);

  return (
    <div className="min-h-screen bg-[#0a0612]">
      {/* Nav */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-xl bg-[#0a0612]/80 border-b border-[#e63946]/10"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Link href="/" className="flex items-center gap-2 text-[#948DA3] hover:text-white transition-colors text-sm">
          ← Back
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#e63946] to-[#ff6b35] flex items-center justify-center">
            <Phone size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm tracking-tight">OrderFlow Pizza</h1>
            <p className="text-[9px] text-[#948DA3] uppercase tracking-[0.15em]">AI Phone Ordering</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isRecording && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e63946]/20 border border-[#e63946]/30">
              <div className="w-2 h-2 rounded-full bg-[#e63946] animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#e63946]">REC</span>
            </div>
          )}
          {showSaveButton && recorderRef.current && (
            <button
              onClick={() => {
                const rec = recorderRef.current!.stop();
                saveRecording(rec);
                setShowSaveButton(false);
                setIsRecording(false);
              }}
              className="px-3 py-1.5 rounded-lg bg-[#4ade80]/20 border border-[#4ade80]/30 text-[#4ade80] text-xs font-bold hover:bg-[#4ade80]/30 transition-colors"
            >
              💾 Save Recording
            </button>
          )}
          <a
            href="tel:+17705255393"
            className="px-3 py-1.5 rounded-lg bg-[#e63946] text-white text-xs font-bold hover:bg-[#d32f3f] transition-colors"
          >
            Call Now
          </a>
        </div>
      </motion.header>

      <div className="pt-20">
        {/* Hero */}
        <section className="px-6 py-16 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#e63946] mb-4">
              AI-Powered Phone Ordering
            </p>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-none mb-6">
              Order Pizza<br />
              <span className="text-[#e63946]">Over the Phone</span>
            </h2>
            <p className="text-[#948DA3] text-lg max-w-lg mx-auto mb-8 leading-relaxed">
              Our AI answers 24/7. Just call, say what you want, and we handle the rest. No app, no waiting on hold.
            </p>
            <a
              href="tel:+17705255393"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#e63946] to-[#ff6b35] text-white font-bold text-lg shadow-[0_0_40px_rgba(230,57,70,0.3)] hover:shadow-[0_0_60px_rgba(230,57,70,0.4)] transition-all hover:scale-105"
            >
              <Phone size={22} />
              +1 (770) 525-5393
            </a>
            <p className="text-[#948DA3]/50 text-xs mt-3">Tap to call — it&apos;s live</p>
          </motion.div>
        </section>

        {/* How it Works */}
        <section className="px-6 py-16 max-w-4xl mx-auto">
          <h3 className="text-center text-2xl font-black text-white mb-12">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS_STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                className="text-center p-6 rounded-2xl border border-[#2a1520] bg-[#0d0608]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                <div className="w-14 h-14 rounded-xl bg-[#e63946]/15 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="text-[#e63946]" size={24} />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e63946] mb-2">
                  Step {i + 1}
                </p>
                <h4 className="text-white font-bold text-lg mb-2">{step.title}</h4>
                <p className="text-[#948DA3] text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Live Call Simulation */}
        <section className="px-6 py-16 max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e63946]/10 border border-[#e63946]/20 mb-4">
              <Sparkles size={14} className="text-[#e63946]" />
              <span className="text-[#e63946] text-xs font-bold uppercase tracking-wide">Try It Here</span>
            </div>
            <h3 className="text-2xl font-black text-white mb-2">Simulate a Phone Call</h3>
            <p className="text-[#948DA3] text-sm">
              Type what you&apos;d say on the phone. Luigi responds just like the real AI agent.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Phone Mockup */}
            <div className="flex justify-center">
              <PhoneMockup messages={messages} isTyping={isTyping} />
            </div>

            {/* Chat Input + Controls */}
            <div className="space-y-4">
              <div className="bg-[#0d0608] border border-[#2a1520] rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-[#4ade80] rounded-full animate-pulse" />
                  <span className="text-[#4ade80] text-[10px] font-bold uppercase tracking-widest">Live Simulation</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Say something like 'I want a pepperoni pizza'..."
                    className="flex-1 bg-[#1a0d10] border border-[#2a1520] rounded-xl px-4 py-3 text-white text-sm placeholder-[#948DA3]/40 focus:outline-none focus:border-[#e63946]/50 transition-colors"
                    disabled={isTyping}
                  />
                  <button
                    onClick={handleSend}
                    disabled={isTyping || !input.trim()}
                    className="w-12 h-12 rounded-xl bg-[#e63946] flex items-center justify-center text-white hover:bg-[#d32f3f] transition-colors disabled:opacity-30"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>

              {/* Quick prompts */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#948DA3]">Quick Prompts</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "I'd like a large pepperoni pizza",
                    "What's your most popular pizza?",
                    "Can I get wings and a Coke too?",
                    "What desserts do you have?",
                    "That's all, place my order",
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => {
                        setInput(prompt);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#1a0d10] border border-[#2a1520] text-[#CBC3DA] text-xs hover:border-[#e63946]/30 hover:text-white transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Menu */}
        <section className="px-6 py-16 max-w-4xl mx-auto">
          <h3 className="text-center text-2xl font-black text-white mb-8">Our Menu</h3>

          {/* Category tabs */}
          <div className="flex justify-center gap-2 mb-8 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveMenuCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wide transition-all ${
                  activeMenuCategory === cat
                    ? "bg-[#e63946] text-white"
                    : "bg-[#1a0d10] text-[#948DA3] border border-[#2a1520] hover:text-white hover:border-[#e63946]/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Items grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[#0d0608] border border-[#2a1520] hover:border-[#e63946]/30 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-white font-bold text-sm">{item.name}</h4>
                      {item.popular && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#ff6b35] bg-[#ff6b35]/10 px-2 py-0.5 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-[#948DA3] text-xs mt-1 leading-relaxed">{item.description}</p>
                  </div>
                  <span className="text-[#e63946] font-bold text-lg whitespace-nowrap">${item.price.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Ready to Order?
            </h3>
            <p className="text-[#948DA3] text-lg mb-8">Skip the app. Just call.</p>
            <a
              href="tel:+17705255393"
              className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-[#e63946] to-[#ff6b35] text-white font-bold text-xl shadow-[0_0_50px_rgba(230,57,70,0.3)] hover:shadow-[0_0_70px_rgba(230,57,70,0.4)] transition-all hover:scale-105"
            >
              <Phone size={24} />
              +1 (770) 525-5393
            </a>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-8 text-center border-t border-[#2a1520]">
          <p className="text-[#948DA3]/50 text-xs">
            Built by 404 Technologies · OrderFlow Pizza AI Demo · Powered by Voice AI
          </p>
        </footer>
      </div>
    </div>
  );
}
