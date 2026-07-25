import { createFileRoute, Link, useLocation } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { useLang } from "../lib/language";
import { CONTACT, content } from "../lib/content";
import { APPLICATIONS } from "../lib/applications";
import {
  Reveal,
  InkDivider,
  SERVICE_ICONS,
  prefersReducedMotion,
  useSectionProgress,
} from "../components/vn/visuals";
import { ScrollCraft } from "../components/vn/ScrollCraft";
import { PhoneField } from "../components/vn/apps/PhoneField";
import { ApplicationsSection } from "../components/vn/apps/ApplicationsSection";
import { useBooking } from "../components/vn/BookingModal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: content.da.meta.home.title },
      { name: "description", content: content.da.meta.home.description },
    ],
  }),
  component: Index,
});

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

function Index() {
  const { t } = useLang();
  const booking = useBooking();
  const [processRef, processProgress] = useSectionProgress<HTMLDivElement>();

  /* ── the application showcase: hero devices and #applikationer share one
        selection, so clicking a floating phone lands on its concept ── */
  const [selectedApp, setSelectedApp] = useState(APPLICATIONS[0].id);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [tabFocus, setTabFocus] = useState(0);

  const openConcept = useCallback((id: string) => {
    setSelectedApp(id);
    setDetailsOpen(true);
    setTabFocus((n) => n + 1);
    document.getElementById("applikationer")?.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
  }, []);

  // Deep link from the navbar on another page (/#applikationer). The router's
  // scroll restoration resets to the top after the target mounts, so the scroll
  // is retried across ~700ms to make sure ours runs last. Same approach as
  // src/routes/ydelser.tsx.
  const hash = useLocation({ select: (l) => l.hash });
  useEffect(() => {
    const id = (hash ?? "").replace(/^#/, "");
    if (!id) return;
    const timers = [80, 250, 500, 750].map((ms) =>
      setTimeout(() => {
        const el = document.getElementById(id);
        if (!el) return;
        if (Math.abs(el.getBoundingClientRect().top - 96) < 4) return; // already there
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, ms),
    );
    return () => timers.forEach(clearTimeout);
  }, [hash]);

  return (
    <div>
      {/* ═══ HERO ═══ */}
      <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 pb-28 pt-28 text-center md:pb-0 md:pt-0">
        <div className="relative z-10">
          <span className="vn-hero-scrim" aria-hidden="true" />
          <h1
            className="enter mt-4 font-logo text-[clamp(2.5rem,7.5vw,5.5rem)] font-semibold leading-[1.08] tracking-[0.01em] text-navy"
            style={d(0.15)}
          >
            Virtus Nordic
          </h1>
          <p className="enter mx-auto mt-5 max-w-2xl font-display text-[1.35rem] font-medium leading-snug text-navy md:text-[1.6rem]" style={d(0.3)}>
            {t.hero.tagline}
          </p>
          <div className="enter mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row" style={d(0.45)}>
            <button type="button" onClick={booking.open} className="btn btn-outline">
              {t.hero.ctaPrimary}
            </button>
            <Link to="/ydelser" className="btn btn-outline">
              {t.hero.ctaSecondary}
            </Link>
          </div>
        </div>

        {/* Five concepts drifting around the copy on desktop, one swipeable rail
            below it on mobile. Same markup, switched in CSS. */}
        <PhoneField onSelect={openConcept} />

        <div className="enter absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2" style={d(0.7)}>
          <span className="text-[0.65rem] uppercase tracking-[0.3em] text-navy/50">{t.hero.scroll}</span>
          <span className="block h-12 w-px bg-gradient-to-b from-teal-1/70 to-transparent" />
        </div>
      </section>

      {/* ═══ INTRO ═══ */}
      <InkDivider />
      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
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

      {/* ═══ CRAFT — the scroll film. ═══ */}
      <ScrollCraft />

      {/* ═══ SERVICES TEASER ═══ */}
      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
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
                to="/ydelser"
                hash={`service-${i}`}
                className="srv-card block h-full"
                aria-label={`${item.title} — ${t.servicesTeaser.label}`}
              >
                {(() => { const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length]; return <Icon className="h-11 w-11" />; })()}
                <h3 className="mt-5 font-display text-xl font-semibold text-navy">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-navy/70">{item.teaser}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ APPLIKATIONER ═══ */}
      <ApplicationsSection
        selectedId={selectedApp}
        onSelect={setSelectedApp}
        detailsOpen={detailsOpen}
        onDetailsToggle={() => setDetailsOpen((v) => !v)}
        focusSignal={tabFocus}
      />

      {/* ═══ PROCESS ═══ */}
      <InkDivider />
      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
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
              strokeDashoffset={1 - processProgress}
            />
          </svg>
          {/* growing connector — vertical on mobile */}
          <span
            className="absolute left-[1.55rem] top-0 block w-px bg-teal-1/50 md:hidden"
            style={{ height: `${processProgress * 100}%` }}
            aria-hidden="true"
          />

          <ol className="grid gap-10 md:grid-cols-4 md:gap-6">
            {t.process.steps.map((step, i) => (
              <Reveal as="li" key={step.title} delay={0.1 * i} className="relative pl-16 md:pl-0">
                <div className="absolute left-0 top-0 md:relative">
                  <span className="step-num" data-lit={processProgress > (i + 0.5) / 4}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-0 font-display text-xl font-semibold text-navy md:mt-6">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy/70">{step.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ═══ CTA BAND ═══ */}
      <InkDivider />
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
