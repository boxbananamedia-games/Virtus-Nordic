import { useCallback, useEffect, useRef, type CSSProperties, type PointerEvent } from "react";
import type { Lang } from "../../../lib/content";
import { pick, type AppConcept } from "../../../lib/applications";
import { PhoneFrame } from "./PhoneFrame";

/**
 * One drifting device in the hero.
 *
 * Three nested transform layers, each owning exactly one property, so nothing
 * ever fights for `transform`:
 *
 *   li  .vn-app-phone        position + mouse parallax (the `translate` property)
 *   div .vn-app-phone__drift the endless floating animation (`transform`)
 *   div .vn-app-phone__tilt  base rotation, hover lift and pointer tilt
 *
 * The device itself is presentational; a transparent button sits on top of it so
 * pointer, Enter and Space all land on one real, focusable control.
 */
export function PhoneCard({
  app,
  lang,
  active,
  onActivate,
  onSelect,
  openLabel,
}: {
  app: AppConcept;
  lang: Lang;
  active: boolean;
  onActivate: (id: string | null) => void;
  onSelect: (id: string) => void;
  /** Localised "open this concept" hint, appended to the accessible name. */
  openLabel: string;
}) {
  const { float } = app;
  const tiltRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef(0);
  const nextTilt = useRef({ x: 0, y: 0 });

  /** The hit area's box, good for one frame. It sits inside the drift
   *  animation so it really is moving, but re-reading it on every pointermove
   *  forced a synchronous layout per event — over a hundred a second on a
   *  high-refresh mouse. Once per frame is as fresh as the tilt can be applied
   *  anyway; applyTilt drops it as it runs. */
  const hitRect = useRef<DOMRect | null>(null);

  /** matchMedia allocates a MediaQueryList on every call, so it is answered
   *  once here rather than inside the pointermove handler. */
  const reduced = useRef(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      reduced.current = mq.matches;
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const applyTilt = useCallback(() => {
    rafRef.current = 0;
    hitRect.current = null;
    const el = tiltRef.current;
    if (!el) return;
    el.style.setProperty("--tilt-x", `${nextTilt.current.x.toFixed(2)}deg`);
    el.style.setProperty("--tilt-y", `${nextTilt.current.y.toFixed(2)}deg`);
  }, []);

  const queueTilt = useCallback(
    (x: number, y: number) => {
      nextTilt.current = { x, y };
      if (!rafRef.current) rafRef.current = requestAnimationFrame(applyTilt);
    },
    [applyTilt],
  );

  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === "touch") return;
    if (reduced.current) return;
    const r = (hitRect.current ??= e.currentTarget.getBoundingClientRect());
    if (!r.width || !r.height) return;
    const dx = (e.clientX - r.left) / r.width - 0.5;
    const dy = (e.clientY - r.top) / r.height - 0.5;
    // Tilt *towards* the cursor: the edge under the pointer leans away from the
    // viewer, which is what reads as "the object is looking at you".
    queueTilt(dy * 12, dx * 14);
  };

  const clearTilt = () => queueTilt(0, 0);

  // Keep the reveal inside the hero: hug the near edge, and flip above the
  // device for the ones drifting low.
  const labelSide = float.x < 30 ? "start" : float.x > 70 ? "end" : "center";
  const labelPos = float.y > 62 ? "above" : "below";
  const category = pick(app.category, lang);
  const valueLine = pick(app.valueLine, lang);

  return (
    <li
      className="vn-app-phone"
      data-active={active ? "true" : "false"}
      data-drift={float.drift}
      style={
        {
          "--x": `${float.x}%`,
          "--y": `${float.y}%`,
          "--w": float.w,
          "--rot": `${float.rot}deg`,
          "--depth": float.depth,
          "--z": Math.round(float.depth * 10),
          "--dur": `${float.dur}s`,
          "--delay": `${float.delay}s`,
        } as CSSProperties
      }
    >
      <div className="vn-app-phone__drift">
        <div className="vn-app-phone__tilt" ref={tiltRef}>
          <PhoneFrame screenWidth={float.w} theme={app.theme} play={active}>
            <app.Screen />
          </PhoneFrame>

          <button
            type="button"
            className="vn-app-phone__hit"
            onClick={() => onSelect(app.id)}
            onPointerEnter={() => onActivate(app.id)}
            onPointerLeave={() => {
              onActivate(null);
              clearTilt();
            }}
            onPointerMove={onPointerMove}
            onFocus={() => onActivate(app.id)}
            onBlur={() => {
              onActivate(null);
              clearTilt();
            }}
          >
            <span className="sr-only">{`${app.name}. ${category}. ${valueLine} ${openLabel}`}</span>
          </button>
        </div>

        <p
          className="vn-app-phone__label"
          data-side={labelSide}
          data-pos={labelPos}
          aria-hidden="true"
        >
          <b>{category}</b>
          <i>{valueLine}</i>
        </p>
      </div>
    </li>
  );
}
