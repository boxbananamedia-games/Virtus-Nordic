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

    // The hero's rect only moves on scroll or resize, but reading it inside
    // pointermove forced a synchronous layout on every one of them — well over
    // a hundred a second on a high-refresh mouse — to recompute a value that
    // had not changed. Cache it and invalidate on the events that can.
    let rect: DOMRect | null = null;
    const invalidate = () => {
      rect = null;
    };

    const onMove = (e: PointerEvent) => {
      if (!rect) rect = zone.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      mx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      my = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    const onLeave = () => {
      mx = 0;
      my = 0;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    zone.addEventListener("pointermove", onMove, { passive: true });
    zone.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", invalidate, { passive: true });
    window.addEventListener("resize", invalidate, { passive: true });
    return () => {
      zone.removeEventListener("pointermove", onMove);
      zone.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", invalidate);
      window.removeEventListener("resize", invalidate);
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
