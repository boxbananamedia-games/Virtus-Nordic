import { useEffect, useRef, useState } from "react";
import { useLang } from "../../../lib/language";
import { APPLICATIONS } from "../../../lib/applications";
import { PhoneCard } from "./PhoneCard";

/**
 * The hero collection: five devices drifting at five depths.
 *
 * One DOM copy, two layouts. On desktop the list is a positioning context and
 * each device is placed absolutely from its own --x/--y/--depth. Below 768px the
 * same list becomes a scroll-snapping horizontal rail with the devices in normal
 * flow — a clean swipeable showcase instead of a hover composition that a
 * touchscreen can never reach. All of that lives in CSS, so there is no
 * viewport branch during render and therefore nothing to mismatch on hydration.
 *
 * Mouse parallax is one listener on the hero section, rAF-throttled, writing two
 * custom properties that all five devices read and scale by their own depth.
 */
export function PhoneField({ onSelect }: { onSelect: (id: string) => void }) {
  const { lang, t } = useLang();
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    if (!window.matchMedia("(hover: hover) and (min-width: 768px)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Track the pointer only over the hero itself: no work while the visitor is
    // reading the rest of the page.
    const zone: HTMLElement = field.closest("section") ?? field;
    let raf = 0;
    let mx = 0;
    let my = 0;

    const apply = () => {
      raf = 0;
      field.style.setProperty("--mx", mx.toFixed(3));
      field.style.setProperty("--my", my.toFixed(3));
    };

    const onMove = (e: PointerEvent) => {
      const r = zone.getBoundingClientRect();
      if (!r.width || !r.height) return;
      mx = ((e.clientX - r.left) / r.width) * 2 - 1;
      my = ((e.clientY - r.top) / r.height) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    const onLeave = () => {
      mx = 0;
      my = 0;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    zone.addEventListener("pointermove", onMove, { passive: true });
    zone.addEventListener("pointerleave", onLeave);
    return () => {
      zone.removeEventListener("pointermove", onMove);
      zone.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="vn-app-field" ref={fieldRef} data-hot={activeId ? "true" : "false"}>
      <ul className="vn-app-list">
        {APPLICATIONS.map((app) => (
          <PhoneCard
            key={app.id}
            app={app}
            lang={lang}
            active={activeId === app.id}
            onActivate={setActiveId}
            onSelect={onSelect}
            openLabel={t.apps.openConcept}
          />
        ))}
      </ul>
      <p className="vn-app-hint">{t.apps.heroHint}</p>
    </div>
  );
}
