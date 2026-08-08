import { createFileRoute } from "@tanstack/react-router";
import { bindings } from "../../lib/bindings.server";

/**
 * POST /api/hit — one page view.
 *
 * Self-hosted so no third party sees the site's visitors, and privacy-first so
 * it needs no consent banner: nothing stored identifies a person. No IP, no
 * user agent, no cookie, no visitor id. See migrations/0003_pageviews.sql.
 *
 * Always answers 204, even when it stores nothing. This is a beacon on a
 * marketing page — a failure here must never surface to a visitor or retry, and
 * telling a caller why it was rejected only helps someone probing it.
 *
 * REVERSIBLE: delete this file, lib/analytics.ts, and the one line in
 * __root.tsx that calls it. The table can stay; it is inert without a writer.
 */

const DEVICES = new Set(["mobile", "tablet", "desktop"]);
const LANGS = new Set(["da", "en"]);

type HitInput = { path?: unknown; lang?: unknown; device?: unknown; referrer?: unknown };

const ok = () => new Response(null, { status: 204 });

export const Route = createFileRoute("/api/hit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const db = bindings().DB;
        if (!db) return ok();

        let raw: HitInput;
        try {
          raw = (await request.json()) as HitInput;
        } catch {
          return ok();
        }

        // Only same-origin paths, and nothing long enough to be an injection
        // vector or a smuggled payload.
        const path =
          typeof raw.path === "string" && raw.path.startsWith("/") ? raw.path.slice(0, 200) : null;
        if (!path) return ok();

        const lang = LANGS.has(raw.lang as string) ? (raw.lang as string) : "da";
        const device = DEVICES.has(raw.device as string) ? (raw.device as string) : "desktop";

        // Hostname only — a full referrer URL can carry the other site's query
        // string, which is incidental personal data we have no business keeping.
        let referrerHost: string | null = null;
        if (typeof raw.referrer === "string" && raw.referrer) {
          try {
            const host = new URL(raw.referrer).hostname;
            const self = new URL(request.url).hostname;
            if (host && host !== self) referrerHost = host.slice(0, 120);
          } catch {
            /* unparseable — treat as direct */
          }
        }

        try {
          await db
            .prepare(
              "INSERT INTO pageviews (path, lang, device, referrer_host) VALUES (?, ?, ?, ?)",
            )
            .bind(path, lang, device, referrerHost)
            .run();
        } catch {
          /* never let analytics break a page view */
        }

        return ok();
      },
    },
  },
});
