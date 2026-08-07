import { createContext, useContext, type ReactNode } from "react";
import { content, type Content, type Lang } from "./content";

type LangContextValue = {
  lang: Lang;
  t: Content;
};

const LangContext = createContext<LangContextValue | null>(null);

/**
 * Language comes from the URL, and only from the URL.
 *
 * It used to live in React state seeded from localStorage, which meant the
 * English site had no address: every page server-rendered in Danish and only
 * became English after hydration, so nobody could link to it, share it, or
 * find it in a search engine. It also guaranteed a hydration mismatch for
 * anyone whose stored preference was English — the server had no way to know.
 *
 * Danish is the default and lives at the root; English is served from /en.
 * The provider simply reads the current path, so the server and the client
 * always agree and every page has a real, indexable address in both languages.
 */
export function LanguageProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <LangContext.Provider value={{ lang, t: content[lang] }}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}
