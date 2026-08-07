import type { Lang } from "./content";

/**
 * The site's own address — the one URL every other host defers to.
 *
 * The app answers on more than one origin: its higgsfield.app deploy URL, and
 * virtusnordic.com. Left to self-canonicalise, each would claim to be the
 * original and split the ranking signal between them. Pinning the canonical
 * host here means every copy points at the same address no matter which one
 * served the request.
 *
 * This is deliberately NOT used for asset URLs. A canonical tag is a claim
 * about identity and is allowed to point somewhere that is not yet serving; an
 * og:image is a URL a scraper has to actually fetch, so it stays on the origin
 * that answered the request and is guaranteed to have the file.
 */
export const SITE_ORIGIN = "https://virtusnordic.com";

/**
 * Every page, in both languages.
 *
 * Danish is the default and lives at the root; English is prefixed and uses
 * English slugs, because `/en/about` is worth more to an English reader — and
 * to a search engine indexing English — than `/en/om` would be.
 *
 * One table drives all of it: the nav, the language toggle, the hreflang
 * alternates and the sitemap. Adding a page means adding a row here, and the
 * four of them cannot drift out of step.
 */
export const PAGES = [
  { key: "home", da: "/", en: "/en" },
  { key: "about", da: "/om", en: "/en/about" },
  { key: "services", da: "/ydelser", en: "/en/services" },
  { key: "apps", da: "/applikationer", en: "/en/applications" },
  { key: "contact", da: "/kontakt", en: "/en/contact" },
] as const;

export type PageKey = (typeof PAGES)[number]["key"];
/** Every routable path, as a literal union — keeps <Link to> type-checked. */
export type SitePath = (typeof PAGES)[number]["da" | "en"];

/** Strip a trailing slash so "/en/" and "/en" are the same page. */
function normalise(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.replace(/\/+$/, "");
  return pathname;
}

/** Which language a URL is in. Anything under /en is English; the rest is Danish. */
export function langFromPath(pathname: string): Lang {
  const p = normalise(pathname);
  return p === "/en" || p.startsWith("/en/") ? "en" : "da";
}

/** The path for a page in a given language. */
export function pathFor(key: PageKey, lang: Lang): SitePath {
  const page = PAGES.find((p) => p.key === key) ?? PAGES[0];
  return page[lang];
}

/** The page a path belongs to, if it is one of the translated pages. */
export function pageForPath(pathname: string) {
  const p = normalise(pathname);
  return PAGES.find((page) => page.da === p || page.en === p);
}

/**
 * The same page in the other language.
 *
 * Falls back to that language's home rather than guessing: pages outside the
 * table (/unruled/*, /lab/*) have no translation, and sending someone to a
 * fabricated URL would be worse than sending them to the front page.
 */
export function counterpartPath(pathname: string, lang: Lang): SitePath {
  const page = pageForPath(pathname);
  return page ? page[lang] : lang === "en" ? "/en" : "/";
}

/** Absolute URL on the canonical host. */
export function absoluteUrl(pathname: string): string {
  return SITE_ORIGIN + (pathname === "/" ? "/" : normalise(pathname));
}

/** Canonical URL for a path. */
export function canonicalUrl(pathname: string): string {
  return absoluteUrl(pathname);
}

/**
 * hreflang alternates for a path, or null for pages that exist in one
 * language only — declaring an alternate that does not exist is worse than
 * declaring none.
 */
export function alternatesFor(pathname: string): { da: string; en: string } | null {
  const page = pageForPath(pathname);
  if (!page) return null;
  return { da: absoluteUrl(page.da), en: absoluteUrl(page.en) };
}
