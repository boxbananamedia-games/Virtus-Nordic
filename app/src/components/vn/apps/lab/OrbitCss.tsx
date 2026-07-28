import { useEffect, useRef, useState, type CSSProperties } from "react";
import { APPLICATIONS } from "../../../../lib/applications";
import { PhoneFrame } from "../PhoneFrame";

/**
 * BRANCH A — orbit in CSS 3D. Prototype for the Phase 0 bake-off.
 *
 * The whole formation runs off one number. A single rAF writes `--orbit` (a
 * unitless degree count) onto the ring; each slot inherits it, adds its own 72°
 * share, and derives its position, its depth and everything depth implies from
 * that one value. Five devices, one clock, one style property written per frame.
 *
 * Depth is real, not simulated: the slots sit in a `preserve-3d` ring under a
 * shared `perspective`, so near devices are larger, far devices are smaller, and
 * the browser depth-sorts them against each other with no z-index bookkeeping.
 * That last part matters — the current production build has to hand-assign a
 * `--z` per concept precisely because its depth is fake.
 *
 * Screens stay live DOM, which is the crux of the argument against WebGL here:
 * the app UI is the thing a client judges, and DOM text renders at the device
 * pixel ratio rather than at whatever a texture can afford.
 */
export type OrbitKnobs = {
  /** Degrees per second. */
  speed: number;
  /** Orbit radius in px, pre-projection. */
  radius: number;
  /** Ring tilt in degrees — what turns the circle into an ellipse on screen. */
  tilt: number;
  /** Perspective distance in px. Lower is a wider, more dramatic lens. */
  persp: number;
  /** 1 = always facing the viewer, 0 = fully turning with the orbit. */
  face: number;
  /** Screen width in px at scale 1, identical for every device. */
  size: number;
  /** Depth-of-field blur on/off, and its strength at the far side. */
  dof: boolean;
  dofPx: number;
  /** Aerial-perspective veil on/off. */
  veil: boolean;
};

export function OrbitCss({
  knobs,
  onFrame,
  freeze,
}: {
  knobs: OrbitKnobs;
  /** Called once per rendered frame so the lab can measure real fps. */
  onFrame?: () => void;
  /** Pin the orbit to a fixed angle and never start the loop. Used by the
   *  capture harness so a screenshot at 120° is the same image every run. */
  freeze?: number;
}) {
  const ringRef = useRef<HTMLUListElement | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  // Read inside the loop rather than closed over, so hovering pauses without
  // tearing down and restarting the animation.
  const pausedRef = useRef(false);
  const frameRef = useRef(onFrame);
  frameRef.current = onFrame;

  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;

    if (freeze !== undefined) {
      ring.style.setProperty("--orbit", String(freeze));
      return;
    }

    // Reduced motion: place the formation once and never start a loop. The
    // static angle is chosen so all five devices are visible and none is
    // hidden directly behind another.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      ring.style.setProperty("--orbit", "18");
      return;
    }

    let raf = 0;
    let last = performance.now();
    let angle = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1); // clamp: tab-switch jumps
      last = now;
      if (!pausedRef.current) angle = (angle + dt * knobs.speed) % 360;
      ring.style.setProperty("--orbit", angle.toFixed(2));
      frameRef.current?.();
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [knobs.speed, freeze]);

  return (
    <div
      className="ol-stage"
      data-dof={knobs.dof ? "true" : "false"}
      data-veil={knobs.veil ? "true" : "false"}
      style={
        {
          "--persp": `${knobs.persp}px`,
          "--dof": `${knobs.dofPx}px`,
        } as CSSProperties
      }
    >
      <ul className="ol-ring" ref={ringRef} style={{ "--tilt": `${knobs.tilt}deg` } as CSSProperties}>
        {APPLICATIONS.map((app, i) => (
          <li
            key={app.id}
            className="ol-slot"
            data-active={activeId === app.id ? "true" : "false"}
            style={
              {
                "--i": i,
                "--radius": `${knobs.radius}px`,
                "--face": knobs.face,
              } as CSSProperties
            }
          >
            <div className="ol-dev">
              <PhoneFrame screenWidth={knobs.size} theme={app.theme} play={activeId === app.id}>
                <app.Screen />
              </PhoneFrame>
              <button
                type="button"
                className="ol-hit"
                onPointerEnter={() => {
                  pausedRef.current = true;
                  setActiveId(app.id);
                }}
                onPointerLeave={() => {
                  pausedRef.current = false;
                  setActiveId(null);
                }}
                onFocus={() => {
                  pausedRef.current = true;
                  setActiveId(app.id);
                }}
                onBlur={() => {
                  pausedRef.current = false;
                  setActiveId(null);
                }}
              >
                <span className="sr-only">{app.name}</span>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
