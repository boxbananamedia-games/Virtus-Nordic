import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportHiggsfieldError } from "../lib/higgsfield-error-reporting";
import { LanguageProvider } from "../lib/language";
import { CONTACT } from "../lib/content";
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
 * The origin comes from the request rather than a constant on purpose: the
 * site answers on its higgsfield.app deploy URL and on its own domain, and
 * hardcoding either one breaks the other.
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
  const canonical = origin ? origin + pathname : null;

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
          ...(origin ? { url: origin } : {}),
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
  return (
    <html lang="da" style={{ colorScheme: "light" }}>
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
              "if(location.pathname==='/')document.documentElement.setAttribute('data-hero-theme','dusk');",
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
      <LanguageProvider>
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
