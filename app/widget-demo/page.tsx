"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Code, Globe, Palette, CornerDownRight } from "lucide-react";
import Link from "next/link";

const SNIPPETS = {
  basic: `<script src="/widget.js"
  data-restaurant="taco-bell">
</script>`,

  pizza: `<script src="/widget.js"
  data-restaurant="pizza"
  data-lang="en">
</script>`,

  spanish: `<script src="/widget.js"
  data-restaurant="taco-bell"
  data-lang="es"
  data-color="#6D28FF"
  data-position="right">
</script>`,

  customColor: `<script src="/widget.js"
  data-restaurant="taco-bell"
  data-lang="en"
  data-color="#e63946"
  data-position="left">
</script>`,
};

const ATTRIBUTES = [
  { attr: "data-restaurant", values: ["taco-bell", "pizza"], default: "taco-bell", desc: "Which restaurant AI to connect to" },
  { attr: "data-lang", values: ["en", "es"], default: "en", desc: "Initial language (English or Spanish)" },
  { attr: "data-color", values: ["#6D28FF", "#e63946", "#FFD23F", "#00C9A7"], default: "#6D28FF", desc: "Accent color (any hex)" },
  { attr: "data-position", values: ["right", "left"], default: "right", desc: "Which corner the widget appears in" },
];

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
      style={{ background: copied ? "#16a34a" : "rgba(109,40,255,0.15)", color: copied ? "white" : "#a78bfa" }}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function CodeBlock({ code, label }: { code: string; label: string }) {
  return (
    <div className="rounded-xl overflow-hidden border" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
      <div className="flex items-center justify-between px-4 py-2.5" style={{ background: "rgba(255,255,255,0.04)" }}>
        <div className="flex items-center gap-2">
          <Code size={13} className="text-purple-400" />
          <span className="text-xs font-bold text-gray-300">{label}</span>
        </div>
        <CopyButton code={code} />
      </div>
      <pre className="px-4 py-4 text-sm text-gray-300 overflow-x-auto font-mono leading-relaxed" style={{ background: "#0d0818", maxHeight: 280 }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function WidgetDemoPage() {
  const [activeSnippet, setActiveSnippet] = useState<keyof typeof SNIPPETS>("basic");
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const [simMessages, setSimMessages] = useState<{ role: "user" | "ai"; content: string }[]>([
    { role: "ai", content: "🌮 Welcome to Taco Bell! I'm your AI drive-through assistant. What can I get for you today?" },
  ]);
  const [simInput, setSimInput] = useState("");
  const [simLoading, setSimLoading] = useState(false);
  const [simLang, setSimLang] = useState<"en" | "es">("en");
  const [simColor] = useState("#6D28FF");

  useEffect(() => {
    // Load the actual widget for demo (sandboxed in an iframe-like approach)
    // We simulate the widget UI inline instead to avoid CORS issues
    setWidgetLoaded(true);
  }, []);

  const handleSimSend = async () => {
    const text = simInput.trim();
    if (!text || simLoading) return;
    setSimMessages((prev) => [...prev, { role: "user", content: text }]);
    setSimInput("");
    setSimLoading(true);

    try {
      const res = await fetch("/api/tacobell-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...simMessages.map((m) => ({ role: m.role === "ai" ? "assistant" : "user", content: m.content })), { role: "user", content: text }],
          language: simLang,
        }),
      });
      const reply = await res.text();
      setSimMessages((prev) => [...prev, { role: "ai", content: reply }]);
    } catch {
      setSimMessages((prev) => [...prev, { role: "ai", content: "Something went wrong. Please try again." }]);
    } finally {
      setSimLoading(false);
    }
  };

  const COLORS = {
    bg: "#1a1030",
    surface: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.1)",
    text: "#ffffff",
    muted: "#948DA3",
    accent: simColor,
  };

  return (
    <div className="min-h-screen" style={{ background: "#0a0612", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-xl border-b" style={{ background: "rgba(10,6,18,0.85)", borderColor: "rgba(255,255,255,0.06)" }}>
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
          ← Back
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: COLORS.accent }}>
            <Code size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">Widget Demo</p>
            <p className="text-xs text-gray-500">Embeddable AI Chat Widget</p>
          </div>
        </div>
        <div className="w-20" />
      </header>

      <div className="pt-24 px-6 pb-20 max-w-6xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-xs font-bold uppercase tracking-widest" style={{ background: COLORS.accent + "22", color: COLORS.accent, border: `1px solid ${COLORS.accent}44` }}>
            <Code size={13} />
            Embeddable Widget
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">
            Add AI Ordering to<br />
            <span style={{ color: COLORS.accent }}>Any Website</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto leading-relaxed">
            One script tag. Any website. Your visitors get a live Taco Bell or Pizza AI ordering assistant — floating in the corner, no app required.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: Code & Docs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6">
            {/* Snippet tabs */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                <Copy size={14} /> Embed Snippets
              </h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {(["basic", "pizza", "spanish", "customColor"] as const).map((key) => (
                  <button
                    key={key}
                    onClick={() => setActiveSnippet(key)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all"
                    style={{
                      background: activeSnippet === key ? COLORS.accent : "rgba(255,255,255,0.05)",
                      color: activeSnippet === key ? "white" : "#948DA3",
                    }}
                  >
                    {key === "basic" ? "Basic" : key === "pizza" ? "Pizza" : key === "spanish" ? "🌐 Spanish" : "🎨 Custom"}
                  </button>
                ))}
              </div>
              <CodeBlock
                code={SNIPPETS[activeSnippet]}
                label={activeSnippet === "basic" ? "Basic (Taco Bell)" : activeSnippet === "pizza" ? "OrderFlow Pizza" : activeSnippet === "spanish" ? "Spanish Language" : "Custom Color + Position"}
              />
            </div>

            {/* Attributes table */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                <Palette size={14} /> Attributes
              </h2>
              <div className="rounded-xl overflow-hidden border" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Attribute</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Values</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Default</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                    {ATTRIBUTES.map((attr) => (
                      <tr key={attr.attr}>
                        <td className="px-4 py-3">
                          <code className="text-purple-300 text-xs font-mono">{attr.attr}</code>
                          <p className="text-xs text-gray-500 mt-0.5">{attr.desc}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {attr.values.map((v) => (
                              <span key={v} className="px-2 py-0.5 rounded text-xs font-mono" style={{ background: "rgba(255,255,255,0.06)", color: "#a78bfa" }}>
                                {v}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-xs font-mono" style={{ background: "rgba(109,40,255,0.1)", color: "#a78bfa" }}>
                            {attr.default}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Feature list */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                <CornerDownRight size={14} /> Features
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  ["Streaming responses", "Real-time AI replies as they're generated"],
                  ["Spanish / English", "Toggle between languages instantly"],
                  ["Self-contained", "< 50KB, zero external dependencies"],
                  ["Inline styles", "No CSS files to manage"],
                  ["Streaming support", "Character-by-character rendering"],
                  ["Custom colors", "Match any brand instantly"],
                ].map(([title, desc]) => (
                  <div key={title} className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Check size={12} style={{ color: COLORS.accent }} />
                      <span className="text-xs font-bold text-white">{title}</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: Live Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Globe size={14} /> Live Preview
            </h2>

            {/* Widget mockup */}
            <div className="relative h-[520px] rounded-2xl overflow-hidden border" style={{ background: "#12102a", borderColor: "rgba(255,255,255,0.1)" }}>
              <div className="absolute inset-0 flex flex-col">
                {/* Fake browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs text-gray-500 font-mono">your-website.com</span>
                  </div>
                </div>
                {/* Fake page content */}
                <div className="flex-1 p-6">
                  <div className="h-8 w-48 rounded-lg mb-4" style={{ background: "rgba(255,255,255,0.06)" }} />
                  <div className="space-y-2 mb-6">
                    <div className="h-3 w-full rounded" style={{ background: "rgba(255,255,255,0.04)" }} />
                    <div className="h-3 w-3/4 rounded" style={{ background: "rgba(255,255,255,0.04)" }} />
                    <div className="h-3 w-5/6 rounded" style={{ background: "rgba(255,255,255,0.04)" }} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-20 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }} />
                    ))}
                  </div>
                </div>

                {/* Floating widget button (absolute positioned) */}
                <div className="absolute bottom-4 right-4 flex flex-col items-end gap-3">
                  {/* Chat panel */}
                  <div
                    className="rounded-2xl overflow-hidden border flex flex-col"
                    style={{ width: 280, height: 380, background: COLORS.bg, borderColor: COLORS.border }}
                  >
                    {/* Panel header */}
                    <div className="flex items-center gap-3 px-4 py-3" style={{ background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accent}cc)` }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                        🌮
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-bold">Taco Bell</p>
                        <p className="text-white/60 text-[10px]">AI Assistant</p>
                      </div>
                      <div className="flex gap-1">
                        {(["en", "es"] as const).map((l) => (
                          <button
                            key={l}
                            onClick={() => setSimLang(l)}
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold transition-all"
                            style={{ background: simLang === l ? "rgba(255,255,255,0.25)" : "transparent", color: "white", border: "1px solid rgba(255,255,255,0.2)" }}
                          >
                            {l.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Chat body */}
                    <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2" style={{ maxHeight: 240 }}>
                      {simMessages.map((msg, i) => (
                        <div
                          key={i}
                          className="max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed"
                          style={{
                            alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                            background: msg.role === "user" ? COLORS.accent : COLORS.surface,
                            color: msg.role === "user" ? "white" : COLORS.text,
                            border: msg.role === "ai" ? `1px solid ${COLORS.border}` : "none",
                            borderRadius: msg.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                          }}
                        >
                          {msg.content}
                        </div>
                      ))}
                      {simLoading && (
                        <div className="max-w-[80%] px-3 py-2 rounded-xl flex gap-1 self-start" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: "12px 12px 12px 4px" }}>
                          {[0, 1, 2].map((d) => (
                            <div
                              key={d}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ background: COLORS.muted, animation: `aiw-bounce 1.2s infinite ${d * 0.15}s`, display: "inline-block" }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Input */}
                    <div className="flex gap-2 p-3 border-t" style={{ borderColor: COLORS.border }}>
                      <input
                        type="text"
                        value={simInput}
                        onChange={(e) => setSimInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSimSend()}
                        placeholder="Type your order..."
                        className="flex-1 px-3 py-2 rounded-xl text-xs outline-none"
                        style={{ background: COLORS.surface, color: "white", border: `1px solid ${COLORS.border}` }}
                      />
                      <button
                        onClick={handleSimSend}
                        disabled={simLoading || !simInput.trim()}
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-opacity"
                        style={{ background: COLORS.accent, opacity: simLoading || !simInput.trim() ? 0.4 : 1 }}
                      >
                        <span className="text-white text-sm">→</span>
                      </button>
                    </div>
                  </div>

                  {/* Floating button */}
                  <button
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                    style={{ background: COLORS.accent, boxShadow: `0 4px 24px ${COLORS.accent}66` }}
                  >
                    <span className="text-white text-xl">💬</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Color picker preview */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Quick Color Options</h3>
              <div className="flex gap-3 flex-wrap">
                {[
                  { color: "#6D28FF", name: "Taco Bell Purple" },
                  { color: "#e63946", name: "Pizza Red" },
                  { color: "#FFD23F", name: "Baja Gold" },
                  { color: "#00C9A7", name: "Teal" },
                ].map(({ color, name }) => (
                  <div key={color} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="text-xs text-gray-300">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-8 text-center border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <p className="text-gray-500 text-xs">
          Built by 404 Technologies · Widget Demo · Taco Bell AI Drive-Through
        </p>
      </footer>

      <style>{`
        @keyframes aiw-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
