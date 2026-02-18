"use client";

import { motion } from "framer-motion";

interface VoiceVisualizerProps {
  isActive: boolean;
}

export function VoiceVisualizer({ isActive }: VoiceVisualizerProps) {
  const bars = 20;
  
  return (
    <div className="flex items-center justify-center gap-1 h-12 mt-4">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          className="w-2 bg-[#FFC600] rounded-full"
          animate={isActive ? {
            height: ["20%", "80%", "20%"],
          } : {
            height: "20%",
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            delay: i * 0.05,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
