"use client";

import { useState, useEffect } from "react";
import { isSoundMuted, setSoundMuted } from "../lib/sounds";

export function MuteToggle() {
  const [muted, setMuted] = useState(isSoundMuted());

  useEffect(() => {
    setSoundMuted(muted);
  }, [muted]);

  return (
    <button
      onClick={() => setMuted(!muted)}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low border border-outline/10 text-sm font-label hover:bg-surface-container transition-colors"
      aria-label={muted ? "Unmute sounds" : "Mute sounds"}
    >
      <span>{muted ? "🔇" : "🔊"}</span>
      <span className="text-[10px] font-bold uppercase tracking-widest text-[#CBC3DA]">
        {muted ? "Off" : "On"}
      </span>
    </button>
  );
}
