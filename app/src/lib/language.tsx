import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { content, type Content, type Lang } from "./content";

type LangContextValue = {
  lang: Lang;
  t: Content;
  setLang: (l: Lang) => void;
};

const LangContext = createContext<LangContextValue | null>(null);

const STORAGE_KEY = "vn-lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Danish is the primary language and the SSR default.
  const [lang, setLangState] = useState<Lang>("da");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "da") setLangState(stored);
    } catch {
      /* storage unavailable — stay on Danish */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* non-fatal */
    }
  };

  return (
    <LangContext.Provider value={{ lang, t: content[lang], setLang }}>{children}</LangContext.Provider>
  );
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}
