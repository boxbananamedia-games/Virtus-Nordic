import { useEffect, useRef, type KeyboardEvent } from "react";
import { useLang } from "../../../lib/language";
import { APPLICATIONS, findApplication, pick } from "../../../lib/applications";
import { InkDivider, Reveal } from "../visuals";
import { useBooking } from "../BookingModal";
import { PhoneFrame } from "./PhoneFrame";

/**
 * #applikationer — the fifth section.
 *
 * The section chrome is deliberately untouched Virtus Nordic: cream paper,
 * Cormorant headings, the ink divider, the teal eyebrow. The only place the
 * visual language changes is inside the device glass. That contrast IS the
 * argument the section is making.
 *
 * Controlled by the homepage so a click on a hero device can select a concept,
 * expand it and scroll here in one gesture.
 */
export function ApplicationsSection({
  selectedId,
  onSelect,
  detailsOpen,
  onDetailsToggle,
  focusSignal,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
  detailsOpen: boolean;
  onDetailsToggle: () => void;
  /** Increments when a hero device is activated, to move focus onto its tab. */
  focusSignal: number;
}) {
  const { lang, t } = useLang();
  const booking = useBooking();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const app = findApplication(selectedId);
  const index = Math.max(
    0,
    APPLICATIONS.findIndex((a) => a.id === selectedId),
  );

  // A hero click scrolls here; land the keyboard on the matching tab without
  // letting focus() fight the smooth scroll for control of the viewport.
  useEffect(() => {
    if (focusSignal === 0) return;
    tabRefs.current[index]?.focus({ preventScroll: true });
  }, [focusSignal, index]);

  const onTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const last = APPLICATIONS.length - 1;
    // Step from the tab that actually has focus, not from the selected one. They
    // are normally the same tab, but keying off focus keeps the arrows correct
    // however focus got there.
    const from = Math.max(0, tabRefs.current.indexOf(e.currentTarget));
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = from === last ? 0 : from + 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = from === 0 ? last : from - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    if (next < 0) return;
    e.preventDefault();
    onSelect(APPLICATIONS[next].id);
    tabRefs.current[next]?.focus({ preventScroll: true });
  };

  return (
    <>
      <InkDivider />
      <section
        id="applikationer"
        className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16 md:px-8 md:py-24"
      >
        <Reveal>
          <span className="label-eyebrow">{t.apps.label}</span>
          <h2 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-tight text-navy md:text-5xl">
            {t.apps.headline}
          </h2>
          <p className="mt-5 max-w-2xl leading-relaxed text-navy/75">{t.apps.sub}</p>
          <p className="mt-4 max-w-2xl text-xs leading-relaxed text-navy/70">{t.apps.disclaimer}</p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-12">
            <span className="label-eyebrow">{t.apps.selectLabel}</span>
            <div
              role="tablist"
              aria-label={t.apps.label}
              className="mt-4 flex flex-wrap gap-x-7 gap-y-3 border-b border-navy/12 pb-1"
            >
              {APPLICATIONS.map((a, i) => (
                <button
                  key={a.id}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`app-tab-${a.id}`}
                  aria-selected={a.id === selectedId}
                  // One panel, reused by all five tabs, so every aria-controls
                  // points at an element that actually exists.
                  aria-controls="app-panel"
                  tabIndex={a.id === selectedId ? 0 : -1}
                  onClick={() => onSelect(a.id)}
                  onKeyDown={onTabKeyDown}
                  className="vn-app-tab"
                >
                  {a.name}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <div
          role="tabpanel"
          id="app-panel"
          aria-labelledby={`app-tab-${app.id}`}
          className="vn-app-panel mt-10 grid gap-10 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-14"
        >
          {/* key on the concept: each switch replays the entrance, and the
              device below replays its screen animation from the top. */}
          <div
            key={`${app.id}-device`}
            className="vn-app-device justify-self-center lg:justify-self-start"
          >
            <PhoneFrame screenWidth={264} theme={app.theme} play>
              <app.Screen />
            </PhoneFrame>
          </div>

          <div key={`${app.id}-copy`} className="vn-app-copy">
            <span className="vn-app-cat">{pick(app.category, lang)}</span>
            <h3 className="mt-3 font-display text-3xl font-semibold leading-tight text-navy md:text-4xl">
              {app.name}
            </h3>
            <p className="mt-4 max-w-xl leading-relaxed text-navy/80">
              {pick(app.valueLine, lang)}
            </p>

            <div className="mt-8">
              <span className="label-eyebrow">{t.apps.fields.problem}</span>
              <p className="mt-2 max-w-xl leading-relaxed text-navy/75">
                {pick(app.problem, lang)}
              </p>
            </div>

            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              <div>
                <span className="label-eyebrow">{t.apps.fields.journey}</span>
                <ol className="vn-app-journey mt-3">
                  {app.journey.map((step, i) => (
                    <li key={i}>
                      <span className="vn-app-journey-num">{String(i + 1).padStart(2, "0")}</span>
                      <span>{pick(step, lang)}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <span className="label-eyebrow">{t.apps.fields.features}</span>
                <ul className="vn-app-features mt-3">
                  {app.features.map((f, i) => (
                    <li key={i}>{pick(f, lang)}</li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              type="button"
              className="vn-app-more mt-9"
              aria-expanded={detailsOpen}
              aria-controls="app-details"
              onClick={onDetailsToggle}
            >
              <span>{detailsOpen ? t.apps.detailsClose : t.apps.detailsOpen}</span>
              <span className="vn-app-more-chev" aria-hidden="true" />
            </button>

            <div
              id="app-details"
              className="vn-app-details"
              data-open={detailsOpen ? "true" : "false"}
              hidden={!detailsOpen}
            >
              <div className="grid gap-8 pt-7 sm:grid-cols-2">
                <div>
                  <span className="label-eyebrow">{t.apps.fields.technical}</span>
                  <ul className="vn-app-tech mt-3">
                    {app.technical.map((item, i) => (
                      <li key={i}>{pick(item, lang)}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="label-eyebrow">{t.apps.fields.value}</span>
                  <dl className="vn-app-value mt-3">
                    {app.value.map((v, i) => (
                      <div key={i}>
                        <dt>{pick(v.label, lang)}</dt>
                        <dd>{pick(v.body, lang)}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-4 text-xs leading-relaxed text-navy/70">{t.apps.valueNote}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Reveal delay={0.1} className="mt-16 border-t border-navy/12 pt-10 text-center">
          <h3 className="mx-auto max-w-2xl font-display text-2xl font-semibold leading-snug text-navy md:text-3xl">
            {t.apps.cta}
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-navy/70">
            {t.apps.ctaSub}
          </p>
          <button type="button" onClick={booking.open} className="btn btn-fill mt-8">
            {t.apps.ctaButton}
          </button>
        </Reveal>
      </section>
    </>
  );
}
