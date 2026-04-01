"use client";

import { useLanguage } from "../lib/i18n";

export default function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLanguage();

  return (
    <button
      onClick={() => setLang(lang === "en" ? "es" : "en")}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-white/70 hover:text-white hover:border-white/20 transition-all ${className}`}
      title={lang === "en" ? "Cambiar a Español" : "Switch to English"}
    >
      <span className="text-sm">🌐</span>
      <span>{lang === "en" ? "ES" : "EN"}</span>
    </button>
  );
}
