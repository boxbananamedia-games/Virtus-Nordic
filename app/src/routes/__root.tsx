import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportHiggsfieldError } from "../lib/higgsfield-error-reporting";
import { LanguageProvider } from "../lib/language";
import { CONTACT } from "../lib/content";
import { SITE_ORIGIN, alternatesFor, canonicalUrl, langFromPath } from "../lib/site";
import { accentProps, useAccent } from "../lib/accent";
import { InkFilters } from "../components/vn/visuals";
import { Nav, Footer } from "../components/vn/chrome";
import { BookingProvider } from "../components/vn/BookingModal";
// Page metadata (browser <title>/favicon + social og: tags) committed into the
// repo and read at BUILD time — no runtime fetch.
import appMetaJson from "../app-meta.json";

declare const __HF_DESIGN_INSPECTOR__: boolean;

const DEFAULT_TITLE = "Virtus Nordic";
const DEFAULT_DESCRIPTION =
  "Boutique-udviklingsstudie i Aalborg — mobilapplikationer og AI-agenter til danske virksomheder.";

type AppMeta = {
  og_title?: string | null;
  og_description?: string | null;
  og_image_url?: string | null;
  favicon_url?: string | null;
  og_video_url?: string | null;
};

const appMeta = appMetaJson as AppMeta;

const APP_HOST_ZONES = ["higgsfield.app", "higgsfield-dev.app"];

function toOwnAssetUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.startsWith("/")) return value;
  try {
    const u = new URL(value);
    const isAppHost = APP_HOST_ZONES.some(
      (zone) => u.hostname === zone || u.hostname.endsWith(`.${zone}`),
    );
    if (isAppHost) return u.pathname + u.search;
    return value;
  } catch {
    return value;
  }
}

/**
 * Absolute URL for a same-origin asset path.
 *
 * Open Graph and Twitter cards require absolute URLs — a scraper has no
 * document base to resolve `/og-image.png` against. The site was emitting the
 * bare path, so every share to LinkedIn, Slack, iMessage or WhatsApp rendered
 * the card without its image.
 *
 * Assets resolve against the REQUEST origin, not the canonical host: this is a
 * URL something has to fetch, and the request origin is the one host we know
 * is serving the file right now.
 */
function absolute(origin: string, value: string | null): string | null {
  if (!value) return null;
  if (!origin || !value.startsWith("/")) return value;
  return origin + value;
}

function buildHead(meta: AppMeta, origin: string, pathname: string) {
  const title = meta.og_title ?? DEFAULT_TITLE;
  const description = meta.og_description ?? DEFAULT_DESCRIPTION;
  const ogImage = absolute(origin, toOwnAssetUrl(meta.og_image_url));
  const favicon = toOwnAssetUrl(meta.favicon_url);
  const ogVideo = absolute(origin, toOwnAssetUrl(meta.og_video_url));
  // Identity, unlike assets, is pinned to the site's own domain — see lib/site.
  const canonical = canonicalUrl(pathname);
  const alternates = alternatesFor(pathname);
  const lang = langFromPath(pathname);

  return {
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title },
      { name: "description", content: description },
      { name: "author", content: "Virtus Nordic" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: ogImage ? "summary_large_image" : "summary" },
      ...(ogImage
        ? [
            { property: "og:image", content: ogImage },
            { name: "twitter:image", content: ogImage },
          ]
        : []),
      ...(ogVideo ? [{ property: "og:video", content: ogVideo }] : []),
      ...(canonical ? [{ property: "og:url", content: canonical }] : []),
      { property: "og:locale", content: lang === "en" ? "en_GB" : "da_DK" },
      ...(alternates
        ? [{ property: "og:locale:alternate", content: lang === "en" ? "da_DK" : "en_GB" }]
        : []),
    ],
    scripts: [
      // Organisation identity for search engines. A named studio trading from
      // one city is exactly what this markup is for, and it was the missing
      // half of the local-SEO story — the StructuredData component existed but
      // nothing ever rendered it.
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          name: "Virtus Nordic",
          description,
          url: SITE_ORIGIN,
          ...(ogImage ? { image: ogImage, logo: ogImage } : {}),
          email: CONTACT.EMAIL,
          telephone: CONTACT.PHONE,
          address: {
            "@type": "PostalAddress",
            addressLocality: "Aalborg",
            addressRegion: "Nordjylland",
            addressCountry: "DK",
          },
          areaServed: { "@type": "Country", name: "Denmark" },
          knowsLanguage: ["da", "en"],
          serviceType: [
            "Mobile application development",
            "System integration",
            "AI agent automation",
            "Growth and optimisation",
          ],
        }),
      },
    ],
    links: [
      ...(canonical ? [{ rel: "canonical", href: canonical }] : []),
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" as const },
      {
        rel: "stylesheet",
        // Inter is loaded only for the app screens inside the device glass: it
        // is the closest licence-clean metric match to SF Pro, which cannot
        // ship (its licence covers Apple-platform UI only). On Apple hardware
        // -apple-system wins and Inter is never used. None of the site's own
        // chrome references it.
        href: "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600;700&family=Jost:wght@300;400;500&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      ...(favicon ? [{ rel: "icon", href: favicon }] : []),
      // hreflang: tell search engines these two URLs are the same page in
      // different languages, so they rank the right one per audience instead
      // of treating them as duplicates competing with each other. Emitted only
      // where a translation actually exists — /unruled/* and /lab/* are
      // Danish-only, and pointing at a URL that 404s is worse than silence.
      // x-default sends anyone we have no language match for to the Danish
      // original, which is the primary edition.
      ...(alternates
        ? [
            { rel: "alternate", hrefLang: "da", href: alternates.da },
            { rel: "alternate", hrefLang: "en", href: alternates.en },
            { rel: "alternate", hrefLang: "x-default", href: alternates.da },
          ]
        : []),
    ],
  };
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-7xl font-semibold text-navy">404</p>
      <p className="mt-3 max-w-sm text-navy/70">
        Siden findes ikke — eller er flyttet. / This page doesn't exist or has moved.
      </p>
      <Link to="/" className="btn btn-fill mt-8">
        Forside · Home
      </Link>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportHiggsfieldError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-4xl font-semibold text-navy">Noget gik galt</h1>
      <p className="mt-3 max-w-sm text-navy/70">
        Siden kunne ikke indlæses. Prøv igen, eller gå tilbage til forsiden.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="btn btn-fill"
        >
          Prøv igen
        </button>
        <a href="/" className="btn btn-outline">
          Forside
        </a>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  /**
   * The request's own origin and path, so head() can emit absolute URLs.
   *
   * Read from the request on the server and from `location` on the client. The
   * `import.meta.env.SSR` branch is statically replaced at build time, so the
   * server-only import is eliminated from the client bundle rather than
   * shipped and skipped.
   */
  loader: async (): Promise<{ origin: string; pathname: string }> => {
    if (import.meta.env.SSR) {
      const { getRequestUrl } = await import("@tanstack/react-start/server");
      const url = new URL(getRequestUrl());
      return { origin: url.origin, pathname: url.pathname };
    }
    return { origin: window.location.origin, pathname: window.location.pathname };
  },
  head: ({ loaderData }) => buildHead(appMeta, loaderData?.origin ?? "", loaderData?.pathname ?? "/"),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  // The document's own language has to be right in the server HTML: it is what
  // screen readers pick a voice from and what search engines read before any
  // hreflang tag. It used to be hardcoded to Danish even once the UI had
  // switched to English.
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const lang = langFromPath(pathname);
  return (
    <html lang={lang} style={{ colorScheme: "light" }}>
      <head>
        <HeadContent />
      </head>
      <body className="paper">
        {/* Runs before the document body is parsed, so both flags are in place
            for the very first paint.

            `js` is the progressive-enhancement flag: animation initial-hidden
            states only apply with JS.

            `data-hero-theme` is the homepage's dusk hero. The route sets it too
            (for client-side navigation), but an effect only runs after
            hydration — which is a beat AFTER the server HTML has painted, and
            that beat was long enough to show the hero in its pre-dusk colours. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.add('js');" +
              // Both editions of the home page get the dusk hero.
              "if(location.pathname==='/'||location.pathname==='/en'||location.pathname==='/en/')" +
              "document.documentElement.setAttribute('data-hero-theme','dusk');",
          }}
        />
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const accent = useAccent();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const lang = langFromPath(pathname);

  useEffect(() => {
    if (!__HF_DESIGN_INSPECTOR__) {
      return;
    }
    void import("../module/design-inspector/runtime")
      .then(({ installHiggsfieldDesignInspector }) => {
        installHiggsfieldDesignInspector();
      })
      .catch((error) => {
        reportHiggsfieldError(
          error instanceof Error ? error : new Error("Failed to load design inspector"),
          { boundary: "higgsfield_design_inspector_import" },
        );
      });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider lang={lang}>
        <BookingProvider>
        {/* Filter defs for this page's pigment. Must be in the document for
            `filter: url(#…)` to resolve, and cheap enough to re-render on
            navigation — it is four <filter> nodes. */}
        <InkFilters />
        <Nav />
        {/* The pigment scopes to the page's own content and its footer. The nav
            is deliberately left out: it is persistent chrome, and holding it
            still is what makes the shift between pages legible. */}
        <main className="relative z-10" {...accentProps(accent)}>
          <Outlet />
        </main>
        <Footer />
        </BookingProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
