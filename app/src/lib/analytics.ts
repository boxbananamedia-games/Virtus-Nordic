import { langFromPath } from "./site";

/**
 * Report one page view to the site's own /api/hit.
 *
 * No cookie, no id, no third-party script. `sendBeacon` where available so the
 * request survives the visitor navigating away and never competes with the
 * page's own work; `fetch` with keepalive as the fallback.
 *
 * Everything here is coarse on purpose — a device bucket, a language, a path,
 * and the referring hostname. Nothing that could pick a person out.
 *
 * REVERSIBLE: delete this file plus its one call site in __root.tsx.
 */
export function reportPageview(pathname: string) {
  if (typeof window === "undefined") return;

  const w = window.innerWidth;
  const body = JSON.stringify({
    path: pathname,
    lang: langFromPath(pathname),
    device: w < 768 ? "mobile" : w < 1024 ? "tablet" : "desktop",
    // Only used to derive a hostname, server-side.
    referrer: document.referrer || "",
  });

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/hit", new Blob([body], { type: "application/json" }));
      return;
    }
    void fetch("/api/hit", {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* analytics must never break a page */
  }
}
