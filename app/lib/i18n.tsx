"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { translations, Lang } from "./translations";

type LanguageContext = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
};

const LangContext = createContext<LanguageContext>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    // Detection order: URL param > localStorage > browser
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get("lang");
    if (urlLang === "es" || urlLang === "en") {
      setLangState(urlLang);
      localStorage.setItem("lang", urlLang);
      return;
    }

    const stored = localStorage.getItem("lang") as Lang | null;
    if (stored === "es" || stored === "en") {
      setLangState(stored);
      return;
    }

    const browserLang = navigator.language?.slice(0, 2);
    if (browserLang === "es") {
      setLangState("es");
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  }, []);

  const t = useCallback(
    (key: string): string => {
      return translations[lang]?.[key] ?? translations.en[key] ?? key;
    },
    [lang]
  );

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LangContext);
}
