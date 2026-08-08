import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  type CSSProperties,
} from "react";
import { useLang } from "../lib/language";
import { pathFor } from "../lib/site";
import { CONTACT, content } from "../lib/content";
import { Reveal, InkDivider, SERVICE_ICONS, useSectionProgress } from "../components/vn/visuals";
import { ScrollCraft } from "../components/vn/ScrollCraft";
import { PhoneField } from "../components/vn/apps/PhoneField";
import { canRunOrbit } from "../components/vn/apps/can-run-orbit";
import { useBooking } from "../components/vn/BookingModal";

/**
 * The orbit is fetched, not bundled.
 *
 * It was a static import, which put three.js, drei and the postprocessing
 * chain — 292KB gzipped — plus 3.7MB of GLB and screen plates from
 * PhoneModel's module-scope preload into the homepage's eager graph. The
 * `canRunOrbit()` gate below has always been correct, but it decides in a
 * layout effect, long after a static import has already committed the bytes:
 * every phone paid for a canvas it would never mount.
 *
 * Deferring it costs desktop nothing that was not already being waited on. The
 * ring is behind a Suspense boundary for its models regardless, so the hero
 * device area is empty until those land — the chunk fetch happens inside that
 * same window rather than adding a new one.
 */
const HeroOrbit = lazy(() =>
  import("../components/vn/apps/HeroOrbit").then((m) => ({ default: m.HeroOrbit })),
);

/**
 * Lighting rigs the hero can be viewed under. `aurora` ships and needs no
 * parameter; the others are reachable at /?look=dusk | noir | gallery for
 * comparison. `dusk` is the original navy rig, kept so the change is one URL
 * away from being reviewed rather than one deploy away.
 */
export const LOOKS = ["aurora", "dusk", "noir", "gallery"] as const;
export type Look = (typeof LOOKS)[number];
export const DEFAULT_LOOK: Look = "aurora";

export const Route = createFileRoute("/")({
  // The default is stripped from the URL rather than pinned into it, so the
  // canonical homepage stays "/" and never picks up a redundant ?look=aurora.
  validateSearch: (search: Record<string, unknown>): { look?: Look } => {
    const look = LOOKS.find((l) => l === search.look);
    return look && look !== DEFAULT_LOOK ? { look } : {};
  },
  head: () => ({
    meta: [
      { title: content.da.meta.home.title },
      { name: "description", content: content.da.meta.home.description },
    ],
  }),
  component: Index,
});

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

/** useLayoutEffect warns when it runs during SSR, where it does nothing anyway. */
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * The hero's device showcase, in whichever form this browser can support.
 *
 * Both live in the DOM together and the choice is structural rather than a
 * flag: PhoneField (the CSS field / swipeable rail) always renders, and the
 * WebGL orbit mounts over it only once the client has confirmed a wide
 * hover-capable viewport with working WebGL — at which point CSS hides the
 * field. So a phone, a WebGL failure, or JavaScript never running all land on
 * the original rail with no extra code path.
 *
 * The capability check has to run in an effect, not during render: it touches
 * matchMedia and a probe canvas, and deciding during SSR would either guess
 * wrong or mismatch on hydration. Until it has run the state is "pending" and
 * CSS hides the field, so a desktop visitor never sees the flat fallback
 * flash up before the orbit takes over. A layout effect makes that verdict
 * land before the browser paints the hydrated tree; with JavaScript off the
 * `js` class is never added and the field stays visible.
 *
 * REVERSIBLE: delete this component and render <PhoneField> directly to go
 * back to the CSS hero exactly as it was. Nothing else in the hero changed.
 */
function HeroDevices({ onSelect, look }: { onSelect: (id: string) => void; look: Look }) {
  const [orbit, setOrbit] = useState<"pending" | "true" | "false">("pending");
  useIsoLayoutEffect(() => setOrbit(canRunOrbit() ? "true" : "false"), []);

  // The hero copy is held for the ring's cue (see HERO_CUE_AT in HeroOrbit).
  // Both escape hatches live here, because this is the component that knows
  // whether an entrance is going to happen at all:
  //   - no orbit, so no entrance to wait for: release at once;
  //   - orbit, but the models never arrive: release anyway on a backstop.
  // Copy that is late is a blemish; copy that never appears is a dead page.
  useEffect(() => {
    if (orbit === "pending") return;
    const hero = document.querySelector(".vn-hero");
    if (!hero) return;
    const release = () => hero.setAttribute("data-hero-cue", "go");
    if (orbit === "false") {
      release();
      return;
    }
    const backstop = setTimeout(release, 9000);
    return () => clearTimeout(backstop);
  }, [orbit]);

  return (
    <div className="vn-hero-devices" data-orbit={orbit}>
      {/* Fallback and mobile rail. Kept mounted so it can take over instantly
          if the orbit is not viable. */}
      <PhoneField onSelect={onSelect} />
      {orbit === "true" && (
        <Suspense fallback={null}>
          <HeroOrbit onSelect={onSelect} look={look} />
        </Suspense>
      )}
    </div>
  );
}

export function Index() {
  const { t, lang } = useLang();
  const booking = useBooking();
  const navigate = useNavigate();
  // Four process steps. The continuous parts of this section read
  // --section-progress straight from CSS; only the step count comes back into
  // React, and only when one is crossed.
  const [processRef, litSteps] = useSectionProgress<HTMLDivElement>(4);

  // Selecting a hero device hands off to the concept page with that concept
  // already open.
  const openConcept = useCallback(
    (id: string) => {
      void navigate({ to: pathFor("apps", lang), search: { app: id } });
    },
    [navigate, lang],
  );

  // The dusk hero needs to restyle the fixed nav, which is rendered outside
  // this route, so the flag goes on <html>. Removed on unmount so other pages
  // never inherit it. On a cold load the inline script in __root.tsx has
  // already set it before first paint — this effect covers client-side
  // navigation back to the homepage.
  //
  // REVERSIBLE: delete this effect (and the CSS keyed off the attribute) to put
  // the hero back on plain cream.
  useEffect(() => {
    document.documentElement.setAttribute("data-hero-theme", "dusk");
    return () => document.documentElement.removeAttribute("data-hero-theme");
  }, []);

  // The page has to tell the same story the 3D rig does — the reflections in
  // the devices come from an environment matched to this gradient, and a
  // mismatch between them is exactly what makes CGI look pasted on. Set on
  // <html> rather than the section because the nav, which lives outside this
  // route, has to move with it.
  //
  // Only the ALTERNATIVES need the attribute. Aurora is the base gradient in
  // CSS, so the default hero is correct on the first painted frame instead of
  // flashing the old palette until this effect runs.
  // `strict: false` reads the search of whichever route matched, rather than
  // binding to "/" — this component also serves /en, where Route.useSearch()
  // would be asking a route that is not in the current match tree.
  const { look = DEFAULT_LOOK } = useSearch({ strict: false }) as { look?: Look };
  useEffect(() => {
    if (look === DEFAULT_LOOK) return;
    document.documentElement.setAttribute("data-hero-look", look);
    return () => document.documentElement.removeAttribute("data-hero-look");
  }, [look]);

  return (
    <div>
      {/* ═══ HERO ═══ */}
      {/* data-hero-cue: the copy is held here until the ring has finished
          boarding and cues it. CSS only honours the hold where the orbit
          actually runs; HeroDevices releases it everywhere else. */}
      <section
        className="vn-hero relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 pb-28 pt-28 text-center md:pb-0 md:pt-0"
        data-hero-cue="hold"
      >
        <div className="vn-hero-copy relative z-10">
          <span className="vn-hero-scrim" aria-hidden="true" />
          <h1
            className="enter mt-4 font-logo text-[clamp(2.5rem,7.5vw,5.5rem)] font-semibold leading-[1.08] tracking-[0.01em] text-navy"
            style={d(0)}
          >
            Virtus Nordic
          </h1>
          <p
            className="vn-hero-tagline enter mx-auto mt-5 max-w-2xl font-display text-[1.35rem] font-medium leading-snug text-navy md:text-[1.6rem]"
            style={d(0.2)}
          >
            {t.hero.tagline}
          </p>
          <div
            className="enter mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row"
            style={d(0.4)}
          >
            <button type="button" onClick={booking.open} className="btn btn-outline">
              {t.hero.ctaPrimary}
            </button>
            <Link to={pathFor("services", lang)} className="btn btn-outline">
              {t.hero.ctaSecondary}
            </Link>
          </div>
        </div>

        <HeroDevices onSelect={openConcept} look={look} />
      </section>

      {/* ═══ INTRO ═══
          No divider here on purpose. The hero now resolves into the page
          background rather than ending on an edge, and a stroke across that
          join puts the horizontal rule straight back. */}
      <section className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          <Reveal>
            <p className="font-display text-2xl font-medium italic leading-snug text-navy md:text-[1.75rem]">
              {t.intro.quote}
            </p>
          </Reveal>
          <div>
            <Reveal delay={0.1}>
              <p className="text-navy/80 leading-relaxed">{t.intro.p1}</p>
            </Reveal>
            <Reveal delay={0.22}>
              <p className="mt-5 text-navy/80 leading-relaxed">{t.intro.p2}</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ SERVICES TEASER ═══ */}
      <section className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-16">
        <div className="grid gap-8 md:grid-cols-[1.1fr_1fr] md:items-end">
          <Reveal>
            <span className="label-eyebrow">{t.servicesTeaser.label}</span>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-navy md:text-5xl">
              {t.servicesTeaser.headline}
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-navy/75 leading-relaxed">{t.servicesTeaser.sub}</p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {t.services.items.map((item, i) => (
            <Reveal key={item.title} delay={0.08 * i}>
              <Link
                to={pathFor("services", lang)}
                hash={`service-${i}`}
                className="srv-card block h-full"
                aria-label={`${item.title} — ${t.servicesTeaser.label}`}
              >
                {(() => {
                  const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length];
                  return <Icon className="h-11 w-11" />;
                })()}
                <h3 className="mt-5 font-display text-xl font-semibold text-navy">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-navy/70">{item.teaser}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ PROCESS ═══ */}
      <InkDivider variant={1} />
      <section className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-16">
        <Reveal>
          <span className="label-eyebrow">{t.process.label}</span>
          <h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-tight text-navy md:text-5xl">
            {t.process.headline}
          </h2>
        </Reveal>

        <div ref={processRef} className="relative mt-14">
          {/* growing connector — horizontal on desktop */}
          <svg
            className="pointer-events-none absolute left-0 top-[1.55rem] hidden h-px w-full md:block"
            viewBox="0 0 100 1"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <line
              x1="0"
              y1="0.5"
              x2="100"
              y2="0.5"
              stroke="#1B6B6B"
              strokeWidth="1"
              opacity="0.5"
              pathLength={1}
              strokeDasharray={1}
              // Driven by CSS rather than a prop so scrolling never re-renders
              // the page; the custom property is written by useSectionProgress.
              style={{ strokeDashoffset: "calc(1 - var(--section-progress, 0))" }}
            />
          </svg>
          {/* growing connector — vertical on mobile */}
          <span
            className="absolute left-[1.55rem] top-0 block w-px bg-teal-1/50 md:hidden"
            style={{ height: "calc(var(--section-progress, 0) * 100%)" }}
            aria-hidden="true"
          />

          <ol className="grid gap-10 md:grid-cols-4 md:gap-6">
            {t.process.steps.map((step, i) => (
              <Reveal as="li" key={step.title} delay={0.1 * i} className="relative pl-16 md:pl-0">
                <div className="absolute left-0 top-0 md:relative">
                  <span className="step-num" data-lit={i < litSteps}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-0 font-display text-xl font-semibold text-navy md:mt-6">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-navy/70">{step.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ═══ CRAFT — the scroll film. ═══
          Last before the ask. The film ends on the VN logo composited onto a
          phone screen, which lands better as the closing image of the argument
          than as an aside between the intro and the services. */}
      <ScrollCraft />

      {/* ═══ CTA BAND ═══ */}
      <InkDivider variant={3} />
      <section className="relative mx-auto max-w-4xl overflow-hidden px-5 py-20 text-center md:px-8 md:py-28">
        <Reveal className="relative">
          <h2 className="font-display text-4xl font-semibold leading-tight text-navy md:text-5xl">
            {t.ctaBand.headline}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-navy/75">{t.ctaBand.sub}</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button type="button" onClick={booking.open} className="btn btn-fill">
              {t.ctaBand.book}
            </button>
            <a href={CONTACT.PHONE_HREF} className="btn btn-outline">
              {t.ctaBand.call}
            </a>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
