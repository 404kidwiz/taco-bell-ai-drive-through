"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Mic, MicOff, Volume2, Sparkles, ChevronDown } from "lucide-react";

const HEADLINE_LINE1 = ["ORDER", "TACO", "BELL"];
const HEADLINE_LINE2 = ["WITH", "YOUR", "VOICE"];

function ScrollIndicator() {
  return (
    <motion.div
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2 }}
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--text-muted)]">
        Scroll
      </span>
      <ChevronDown className="w-4 h-4 text-[var(--text-muted)] animate-scroll-bounce" />
    </motion.div>
  );
}

function VoiceVisualizer({ isListening, isSpeaking }: { isListening: boolean; isSpeaking: boolean }) {
  const bars = [1, 2, 3, 4, 5, 6, 7];
  return (
    <div className="flex items-end gap-0.5 h-5">
      {bars.map((i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full"
          style={{
            background: isSpeaking ? "var(--secondary)" : "var(--primary)",
            height: "100%",
          }}
          animate={
            isSpeaking
              ? {
                  scaleY: [0.3, 1, 0.5, 0.9, 0.4, 1, 0.6],
                  opacity: [0.6, 1, 0.7, 1, 0.5, 1, 0.8],
                }
              : isListening
              ? { scaleY: [0.4, 0.8, 0.5, 1, 0.6, 0.9, 0.4] }
              : { scaleY: 0.25 }
          }
          transition={
            isSpeaking || isListening
              ? {
                  duration: 0.65,
                  repeat: Infinity,
                  delay: i * 0.07,
                  ease: "easeInOut",
                }
              : { duration: 0.4 }
          }
        />
      ))}
    </div>
  );
}

export default function HeroVoiceSection({
  aiMessage,
  transcript,
  isConnected,
  isSpeaking,
  error,
  onConnect,
  onDisconnect,
}: {
  aiMessage: string;
  transcript: string;
  isConnected: boolean;
  isSpeaking: boolean;
  error: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  const headlineRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(headlineRef, { once: true });

  const wordAnimation = (lineIdx: number, wordIdx: number) => ({
    initial: { opacity: 0, y: 48 },
    animate: isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 48 },
    transition: {
      delay: 0.4 + lineIdx * 0.18 + wordIdx * 0.07,
      duration: 0.65,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  });

  return (
    <section
      id="voice"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16"
    >
      {/* Ambient background orbs */}
      <div className="ambient-bg" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2 mb-10"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
            style={{
              background: "rgba(255,69,0,0.12)",
              border: "1px solid rgba(255,69,0,0.3)",
              color: "var(--primary)",
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Voice Ordering
          </span>
        </motion.div>

        {/* Display headline — Bebas Neue, word-by-word */}
        <div ref={headlineRef} className="mb-10">
          <div className="font-display leading-[0.9] tracking-widest uppercase mb-1">
            {HEADLINE_LINE1.map((word, wi) => (
              <span key={`l1-${wi}`} className="inline-block mr-4 sm:mr-6 overflow-hidden">
                <motion.span
                  className="inline-block"
                  {...wordAnimation(0, wi)}
                  style={{ color: wi === 0 ? "var(--primary)" : "var(--text)" }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </div>
          <div className="font-display leading-[0.9] tracking-widest uppercase">
            {HEADLINE_LINE2.map((word, wi) => (
              <span key={`l2-${wi}`} className="inline-block mr-4 sm:mr-6 overflow-hidden">
                <motion.span
                  className="inline-block"
                  {...wordAnimation(1, wi)}
                  style={{ color: wi === 1 ? "var(--secondary)" : "var(--text)" }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </div>
        </div>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="text-base sm:text-lg text-[var(--text-muted)] max-w-xl mx-auto mb-12 leading-relaxed"
        >
          Speak naturally. Order anything. No app downloads, no typing — just talk and we&apos;ll fire up your meal.
        </motion.p>

        {/* Voice UI card */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-3xl mb-8"
          style={{
            background: "rgba(10,10,10,0.7)",
            backdropFilter: "blur(24px)",
            border: "1px solid var(--border)",
          }}
        >
          {/* Inner glow */}
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[100px] pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${
                isSpeaking
                  ? "rgba(255,69,0,0.18)"
                  : isConnected
                  ? "rgba(255,184,0,0.15)"
                  : "rgba(255,107,53,0.10)"
              } 0%, transparent 70%)`,
            }}
          />

          <div className="relative p-8 sm:p-12 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* AI Avatar + voice ring */}
            <div className="relative flex-shrink-0 flex flex-col items-center">
              {/* Pulsing ring button */}
              <button
                onClick={isConnected ? onDisconnect : onConnect}
                className={`relative w-32 h-32 sm:w-36 sm:h-36 rounded-full flex items-center justify-center transition-all duration-300 voice-btn-ring ${
                  isConnected ? "" : "bg-[var(--void-elevated)]"
                }`}
                style={
                  isConnected
                    ? { background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" }
                    : {}
                }
                aria-label={isConnected ? "End voice order" : "Start voice order"}
              >
                <motion.div
                  animate={
                    isSpeaking
                      ? { scale: [1, 1.04, 1] }
                      : {}
                  }
                  transition={isSpeaking ? { duration: 0.5, repeat: Infinity } : {}}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center"
                  style={{
                    background: isSpeaking
                      ? "rgba(10,10,10,0.2)"
                      : isConnected
                      ? "rgba(10,10,10,0.15)"
                      : "var(--void-elevated)",
                    border: isConnected ? "3px solid rgba(255,184,0,0.5)" : "2px solid var(--border)",
                  }}
                >
                  {isSpeaking ? (
                    <Volume2 className="w-12 h-12 sm:w-14 sm:h-14" style={{ color: "#0A0A0A" }} />
                  ) : isConnected ? (
                    <Mic className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                  ) : (
                    <Mic className="w-12 h-12 sm:w-14 sm:h-14 text-[var(--primary)]" />
                  )}
                </motion.div>
              </button>

              {/* Status badge */}
              <div className="mt-4 flex items-center gap-2">
                {isConnected ? (
                  <motion.span
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ background: "#10B981" }}
                  />
                ) : null}
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: isConnected ? "#10B981" : "var(--text-muted)" }}
                >
                  {isConnected ? "Listening" : "Tap to order"}
                </span>
              </div>
            </div>

            {/* AI message */}
            <div className="flex-1 text-center lg:text-left min-w-0">
              <motion.p
                key={aiMessage}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="text-xl sm:text-2xl lg:text-3xl font-bold leading-snug"
                style={{ color: "var(--text)" }}
              >
                {aiMessage}
              </motion.p>

              {transcript && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 text-sm italic"
                  style={{ color: "var(--secondary)" }}
                >
                  &ldquo;{transcript}&rdquo;
                </motion.p>
              )}

              {error && (
                <p className="mt-3 text-sm" style={{ color: "var(--red)" }}>
                  {error}
                </p>
              )}

              {/* Visualizer */}
              {(isConnected || isSpeaking) && (
                <div className="mt-4 flex justify-center lg:justify-start">
                  <VoiceVisualizer isListening={isConnected} isSpeaking={isSpeaking} />
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* CTA button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.4, duration: 0.6 }}
        >
          <motion.button
            onClick={isConnected ? onDisconnect : onConnect}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="glow-pulse inline-flex items-center gap-3 px-10 py-4 rounded-full text-base font-bold uppercase tracking-widest"
            style={{
              background: "linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)",
              color: "#0A0A0A",
              boxShadow: "0 8px 32px rgba(255,69,0,0.4)",
            }}
          >
            {isConnected ? (
              <>
                <MicOff className="w-5 h-5" />
                End Order
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                Tap to Start Voice Order
              </>
            )}
          </motion.button>
        </motion.div>
      </div>

      <ScrollIndicator />
    </section>
  );
}
