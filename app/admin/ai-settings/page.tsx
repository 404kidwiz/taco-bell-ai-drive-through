"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  MessageSquare,
  Loader2,
  Send,
  Sparkles,
  Globe,
  Zap,
  Plus,
  X,
} from "lucide-react";

type AIPersonality = "friendly" | "efficient" | "upsell" | "custom";

const personalityDescriptions: Record<AIPersonality, string> = {
  friendly: "Warm and conversational. Takes time to chat and make customers feel welcome.",
  efficient: "Quick and to the point. Gets orders processed fast with minimal back-and-forth.",
  upsell: "Strategic and sales-focused. Consistently suggests add-ons and upgrades.",
  custom: "You're in control. Customize every aspect of your AI's personality.",
};

const defaultPrompts: Record<AIPersonality, string> = {
  friendly: `You are a friendly Taco Bell order assistant. You're warm, conversational, and make customers feel welcome. 

Take orders naturally, confirm items clearly, and always end with a smile. 
Mention promotions when relevant but don't be pushy.
You can also handle Spanish-speaking customers seamlessly.

Current menu context: {MENU_CTX}

Remember: Be personable but efficient. Customers are hungry!`,
  efficient: `You are a fast, efficient Taco Bell order assistant.

Get to the point. Confirm orders quickly with minimal chit-chat.
Parse customer requests accurately and move through the order flow rapidly.

Current menu context: {MENU_CTX}

Remember: Speed matters. Every extra message is friction.`,
  upsell: `You are a persuasive Taco Bell order assistant with strong sales skills.

Your goal: maximize order value through strategic upselling and cross-selling.
When a customer orders, always suggest complementary items.
"Side of cheese for that?" "Want to make that a combo?"
Be genuine but persistent. Every upsell counts.

Current menu context: {MENU_CTX}

Remember: Increase AOV on every interaction.`,
  custom: `You are a Taco Bell AI order assistant.

Current menu context: {MENU_CTX}

Customize your behavior below.`,
};

const sampleConversations = [
  { role: "user", content: "I'd like a crunchy taco and a burrito" },
  { role: "assistant", content: "Great choice! I've got a Crunchy Taco for $1.99 and a Burrito Supreme for $7.49. That's $9.48 total. Would you like to add a drink or any sides to go with that? We have the Nachos Bell Grande today which goes great with tacos!" },
  { role: "user", content: "Yeah let me get a large drink" },
  { role: "assistant", content: "Perfect! Large drink added. Is that everything for you today? Your order total comes to $11.97." },
];

export default function AISettingsPage() {
  const [personality, setPersonality] = useState<AIPersonality>("friendly");
  const [customPrompt, setCustomPrompt] = useState("");
  const [maxTokens, setMaxTokens] = useState(150);
  const [languages, setLanguages] = useState(["en", "es"]);
  const [isSaving, setIsSaving] = useState(false);
  const [testMessages, setTestMessages] = useState(sampleConversations);
  const [testInput, setTestInput] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [upsellRules, setUpsellRules] = useState<Array<{ when: string; suggest: string }>>([]);
  const [showAddRule, setShowAddRule] = useState(false);

  useEffect(() => {
    setCustomPrompt(defaultPrompts[personality]);
  }, [personality]);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsSaving(false);
  };

  const handleSendTest = async () => {
    if (!testInput.trim()) return;
    setTestMessages((prev) => [...prev, { role: "user" as const, content: testInput }]);
    setTestInput("");
    setIsTesting(true);
    await new Promise((r) => setTimeout(r, 2000));
    setTestMessages((prev) => [
      ...prev,
      { role: "assistant" as const, content: "Thanks for your order! I've added that to your cart. Is there anything else you'd like today?" },
    ]);
    setIsTesting(false);
  };

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) => prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]);
  };

  const charCount = customPrompt.length;
  const charLimit = 4000;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">AI Settings</h1>
        <p className="text-[#948DA3] text-sm mt-1">Configure your AI assistant&apos;s personality and behavior</p>
      </div>

      {/* AI Personality */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1e192b] border border-[#494457]/50 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#6D28FF]/20 flex items-center justify-center">
            <Bot className="text-[#6D28FF]" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">AI Personality</h2>
            <p className="text-[#948DA3] text-sm">How your AI assistant interacts with customers</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {(["friendly", "efficient", "upsell", "custom"] as AIPersonality[]).map((p) => (
            <button
              key={p}
              onClick={() => setPersonality(p)}
              className={`p-4 rounded-xl border text-left transition-all ${personality === p ? "bg-[#6D28FF]/20 border-[#6D28FF] text-white" : "bg-[#0a0612] border-[#494457] text-[#948DA3] hover:border-[#6D28FF]/50"}`}
            >
              <p className="font-semibold capitalize mb-1">{p}</p>
              <p className="text-xs opacity-70">{personalityDescriptions[p].slice(0, 60)}...</p>
            </button>
          ))}
        </div>

        <p className="text-[#948DA3] text-sm mt-4">{personalityDescriptions[personality]}</p>
      </motion.div>

      {/* Custom System Prompt */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#1e192b] border border-[#494457]/50 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#12D7F2]/20 flex items-center justify-center">
              <MessageSquare className="text-[#12D7F2]" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">System Prompt</h2>
              <p className="text-[#948DA3] text-sm">Instructions that define your AI&apos;s behavior</p>
            </div>
          </div>
          <span className={`text-sm ${charCount > charLimit ? "text-red-400" : "text-[#948DA3]"}`}>
            {charCount}/{charLimit}
          </span>
        </div>

        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          rows={12}
          className="w-full px-4 py-3 rounded-xl bg-[#0a0612] border border-[#494457] text-white placeholder-[#494457] focus:outline-none focus:border-[#6D28FF] resize-none font-mono text-sm"
          placeholder="Enter your custom system prompt..."
        />

        <div className="flex items-center gap-2 mt-3 text-xs text-[#948DA3]">
          <Sparkles size={12} />
          <span>Use {"{MENU_CTX}"} to inject the current menu dynamically</span>
        </div>
      </motion.div>

      {/* Response Speed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#1e192b] border border-[#494457]/50 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
            <Zap className="text-yellow-400" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Response Speed</h2>
            <p className="text-[#948DA3] text-sm">Maximum tokens per AI response</p>
          </div>
        </div>

        <div className="space-y-3">
          <input
            type="range"
            min={50}
            max={500}
            step={10}
            value={maxTokens}
            onChange={(e) => setMaxTokens(parseInt(e.target.value))}
            className="w-full accent-[#6D28FF]"
          />
          <div className="flex justify-between text-sm">
            <span className="text-[#948DA3]">Concise</span>
            <span className="text-white font-medium">{maxTokens} tokens ({Math.round(maxTokens * 0.75)} words max)</span>
            <span className="text-[#948DA3]">Detailed</span>
          </div>
        </div>
      </motion.div>

      {/* Language Support */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#1e192b] border border-[#494457]/50 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
            <Globe className="text-green-400" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Language Support</h2>
            <p className="text-[#948DA3] text-sm">Languages your AI can communicate in</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {[
            { code: "en", name: "English", flag: "🇺🇸" },
            { code: "es", name: "Spanish", flag: "🇲🇽" },
            { code: "fr", name: "French", flag: "🇫🇷" },
            { code: "de", name: "German", flag: "🇩🇪" },
          ].map((lang) => (
            <button
              key={lang.code}
              onClick={() => toggleLanguage(lang.code)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${languages.includes(lang.code) ? "bg-[#6D28FF]/20 border-[#6D28FF] text-white" : "bg-[#0a0612] border-[#494457] text-[#948DA3]"}`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Upsell Rules */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[#1e192b] border border-[#494457]/50 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B35]/20 flex items-center justify-center">
              <Plus className="text-[#FF6B35]" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Upsell Rules</h2>
              <p className="text-[#948DA3] text-sm">Configure what items to suggest when</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddRule(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#494457]/30 text-[#948DA3] hover:text-white text-sm transition-colors"
          >
            <Plus size={14} />
            Add Rule
          </button>
        </div>

        <div className="space-y-2">
          {upsellRules.length === 0 ? (
            <div className="text-center py-8 text-[#948DA3]">
              <p>No upsell rules configured.</p>
              <p className="text-sm mt-1">Add rules to help your AI suggest items strategically.</p>
            </div>
          ) : (
            upsellRules.map((rule, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-[#0a0612] rounded-xl">
                <div>
                  <p className="text-white text-sm">When: <span className="text-[#948DA3]">{rule.when}</span></p>
                  <p className="text-white text-sm">Suggest: <span className="text-[#cebdff]">{rule.suggest}</span></p>
                </div>
                <button className="text-[#948DA3] hover:text-red-400">
                  <X size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Test Conversation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-[#1e192b] border border-[#494457]/50 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#cebdff]/20 flex items-center justify-center">
            <Bot className="text-[#cebdff]" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Test Conversation</h2>
            <p className="text-[#948DA3] text-sm">Chat with your configured AI</p>
          </div>
        </div>

        <div className="bg-[#0a0612] rounded-xl p-4 mb-4 h-64 overflow-y-auto space-y-4">
          {testMessages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${msg.role === "user" ? "bg-[#6D28FF] text-white" : "bg-[#494457]/50 text-white"}`}>
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
          {isTesting && (
            <div className="flex justify-start">
              <div className="bg-[#494457]/50 text-white px-4 py-2.5 rounded-2xl">
                <Loader2 className="animate-spin" size={16} />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendTest()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 rounded-xl bg-[#0a0612] border border-[#494457] text-white placeholder-[#494457] focus:outline-none focus:border-[#6D28FF]"
          />
          <button
            onClick={handleSendTest}
            disabled={isTesting || !testInput.trim()}
            className="px-6 py-3 rounded-xl bg-[#6D28FF] text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send size={16} />
            Send
          </button>
        </div>
      </motion.div>

      {/* Save button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex justify-end"
      >
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-8 py-3 rounded-xl bg-[#6D28FF] text-white font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
          Save AI Settings
        </button>
      </motion.div>
    </div>
  );
}
