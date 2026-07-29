import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { APPLICATIONS, pick } from "../../../lib/applications";
import { useLang } from "../../../lib/language";
import { PhoneModel, type Finish } from "./device/PhoneModel";
import { StudioLighting } from "./device/Studio";

/**
 * The hero carousel: five devices orbiting a shared centre, each facing
 * radially outward so whichever swings nearest presents its screen.
 *
 * ── The accessibility problem, and how it is solved ───────────────────────
 * A <canvas> contains nothing focusable and nothing a screen reader can see,
 * so the interaction contract cannot live in the 3D scene. Instead a list of
 * five REAL buttons sits over the canvas, and each frame every device projects
 * its world position to screen space and writes it onto its own button. The
 * buttons are the interaction; the canvas is just what you look at.
 *
 * That keeps pointer, hover, focus, Enter and Space all landing on one real
 * control per concept, in DOM order, with a proper accessible name — the same
 * contract the CSS hero had, unchanged.
 *
 * Positions are written straight to element style in the render loop rather
 * than through React state: this runs at frame rate, and setState per frame
 * would re-render the whole hero sixty times a second.
 *
 * ── Fallback ─────────────────────────────────────────────────────────────
 * This component only ever mounts on a pointer-capable wide viewport with
 * working WebGL (see HeroDevices in routes/index.tsx). Everywhere else the
 * original CSS field stays exactly as it was, which is also what happens if
 * WebGL fails, if a phone is used, or if JavaScript never runs.
 */

const MM = 0.1; // 1 scene unit = 10mm
const BODY_W = 71.5 * MM;
/** Device height in scene units, i.e. after the NORMALISE scale below. */
const DEVICE_H = 149.6 * MM;
/** Measured width of the supplied GLBs, normalised so scene units are real mm. */
const NORMALISE = BODY_W / 0.9518;
/** The exports measure ~22% deeper than a real body-plus-camera-bump. */
const FLATTEN_Z = 0.82;

const FINISHES: Finish[] = ["graphite", "copper", "silver", "green", "navy"];

/** Tuned in the lab (see /lab/orbit) and frozen here. */
const ORBIT = {
  /** Scene units from centre. */
  radius: 22.6,
  /** Vertical travel as a fraction of radius: one rise and fall per lap. */
  rise: 0.34,
  /** Degrees per second of phase. A lap is 360/speed seconds. */
  speed: 8,
  /** How much a device slows as it reaches the front, 0..1. */
  dwell: 0.82,
  /** Width of that slow stretch as a fraction of a lap. Narrow, so devices do
   *  not pile up at the front and present several screens at once. */
  dwellWidth: 0.055,
  /** Camera distance. Pulled back rather than shrinking the orbit, which keeps
   *  the near/far size spread intact: at 71.5 the nearest device rendered
   *  ~570px tall in a 900px hero and swamped the copy. Measured at 120 it is
   *  ~290px, which clears the CTA row once the copy is lifted. */
  cameraZ: 120,
  fov: 27,
  /** Pushes the formation down so it arcs below the hero copy rather than
   *  through it. Derived, not guessed: to sit the nearest device's centre at
   *  ~80% of hero height, y = ndc * dist * tan(fov/2). Negative is down. */
  centreY: -17,
};

/**
 * Easing table for one lap, integrated once.
 *
 * We need position as a function of phase, not a velocity integrated per
 * frame: all five devices read one curve at their own offset, and integrating
 * separately would let them drift apart over a long-running page. A narrow
 * Gaussian dip in velocity gives a brief, well-defined pause at the front and
 * has no closed-form integral, so it is summed into a lookup table and
 * normalised to keep a lap exactly one cycle.
 */
function useOrbitEasing() {
  return useMemo(() => {
    const N = 1024;
    const table = new Float32Array(N + 1);
    let acc = 0;
    for (let i = 0; i < N; i++) {
      const u = i / N;
      const d = Math.min(u, 1 - u); // distance to the front, wrapping
      acc += 1 - ORBIT.dwell * Math.exp(-(d * d) / (2 * ORBIT.dwellWidth ** 2));
      table[i + 1] = acc;
    }
    for (let i = 0; i <= N; i++) table[i] /= acc;
    return table;
  }, []);
}

const sampleEasing = (t: Float32Array, u: number) => {
  const N = t.length - 1;
  const x = u * N;
  const i = Math.floor(x);
  return t[i] * (1 - (x - i)) + t[Math.min(i + 1, N)] * (x - i);
};

type Hit = { el: HTMLButtonElement | null };

function Device({
  index,
  screenTexture,
  angleRef,
  easing,
  hits,
}: {
  index: number;
  screenTexture: string;
  angleRef: { current: number };
  easing: Float32Array;
  hits: { current: Hit[] };
}) {
  const group = useRef<THREE.Group>(null);
  const { camera, size } = useThree();
  // Reused across frames; allocating a Vector3 per frame per device would churn
  // the GC for no reason.
  const projected = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const g = group.current;
    if (!g) return;

    const n = APPLICATIONS.length;
    const u = (angleRef.current / 360 + index / n) % 1;
    const a = sampleEasing(easing, u) * 2 * Math.PI;

    g.position.set(
      Math.sin(a) * ORBIT.radius,
      Math.sin(a) * ORBIT.radius * ORBIT.rise + ORBIT.centreY,
      Math.cos(a) * ORBIT.radius,
    );
    // Face radially outward — the entire carousel rule in one line. The device
    // nearest the camera therefore presents its screen with no keyframing.
    g.rotation.set(0, a, 0);

    // Track the accessible control to the device.
    const el = hits.current[index]?.el;
    if (!el) return;
    projected.copy(g.position).project(camera);
    const x = (projected.x * 0.5 + 0.5) * size.width;
    const y = (-projected.y * 0.5 + 0.5) * size.height;
    // Apparent height from the perspective divide, so the hit area shrinks
    // with the device as it travels to the back of the orbit.
    //
    // DEVICE_H is already in scene units (1 unit = 10mm), which is what the
    // group's NORMALISE scale produces — multiplying by NORMALISE again here
    // inflated every control to ~7.5x the device.
    const dist = camera.position.distanceTo(g.position);
    const h =
      (DEVICE_H * size.height) /
      (2 * dist * Math.tan(((camera as THREE.PerspectiveCamera).fov * Math.PI) / 360));
    const w = h * (71.5 / 149.6);

    el.style.transform = `translate3d(${Math.round(x - w / 2)}px, ${Math.round(y - h / 2)}px, 0)`;
    el.style.width = `${Math.round(w)}px`;
    el.style.height = `${Math.round(h)}px`;
    // Depth-sort the controls so the front device wins the pointer where two
    // overlap on screen, matching what the viewer sees.
    el.style.zIndex = String(1000 - Math.round(dist));
    // Hide the control while its device is on the far side and facing away:
    // clicking a phone you are seeing the back of is not a meaningful target.
    const facingAway = Math.cos(a) < -0.35;
    el.style.pointerEvents = facingAway ? "none" : "auto";
    el.style.opacity = facingAway ? "0" : "1";
  });

  return (
    <group ref={group}>
      <group scale={NORMALISE}>
        <PhoneModel
          screenTexture={screenTexture}
          finish={FINISHES[index % FINISHES.length]}
          flattenZ={FLATTEN_Z}
          // Matches the Meshy reference viewer's HDRI intensity.
          envIntensity={1.25}
        />
      </group>
    </group>
  );
}

function Ring({
  hits,
  paused,
  reduced,
}: {
  hits: { current: Hit[] };
  paused: { current: boolean };
  reduced: boolean;
}) {
  const easing = useOrbitEasing();
  // Static but composed: under reduce the formation holds an arrangement where
  // all five are visible rather than stacking behind one another.
  const angleRef = useRef(reduced ? 18 : 0);

  useFrame((_, delta) => {
    if (reduced || paused.current) return;
    // Clamp delta so a backgrounded tab does not jump the orbit on return.
    angleRef.current = (angleRef.current + Math.min(delta, 0.1) * ORBIT.speed) % 360;
  });

  return (
    <>
      {APPLICATIONS.map((app, i) => (
        <Device
          key={app.id}
          index={i}
          screenTexture={`/lab-textures/${app.id}.png`}
          angleRef={angleRef}
          easing={easing}
          hits={hits}
        />
      ))}
    </>
  );
}

export function HeroOrbit({ onSelect }: { onSelect: (id: string) => void }) {
  const { lang, t } = useLang();
  const hits = useRef<Hit[]>(APPLICATIONS.map(() => ({ el: null })));
  const paused = useRef(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const reduced =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Hovering or focusing a device stops the orbit so its screen can be read.
  // Held in a ref, not state, so the render loop reads it without re-rendering.
  const hold = (id: string | null) => {
    paused.current = id !== null;
    setActiveId(id);
  };

  return (
    <div className="vn-orbit" data-active={activeId ? "true" : "false"}>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, ORBIT.cameraZ], fov: ORBIT.fov, near: 1, far: 400 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
        // Decorative: the accessible content is the button list below.
        aria-hidden="true"
      >
        <StudioLighting variant="dusk" />
        {/* PhoneModel suspends while its GLB and screen plate decode; without a
            boundary the whole hero would suspend with it. */}
        <Suspense fallback={null}>
          <Ring hits={hits} paused={paused} reduced={reduced} />
        </Suspense>
      </Canvas>

      {/* The real interaction layer. One button per concept, tracked to its
          device by the render loop above. */}
      <ul className="vn-orbit-hits">
        {APPLICATIONS.map((app, i) => {
          const category = pick(app.category, lang);
          const valueLine = pick(app.valueLine, lang);
          return (
            <li key={app.id}>
              <button
                type="button"
                ref={(el) => {
                  hits.current[i].el = el;
                }}
                className="vn-orbit-hit"
                data-active={activeId === app.id ? "true" : "false"}
                onClick={() => onSelect(app.id)}
                onPointerEnter={() => hold(app.id)}
                onPointerLeave={() => hold(null)}
                onFocus={() => hold(app.id)}
                onBlur={() => hold(null)}
              >
                <span className="sr-only">{`${app.name}. ${category}. ${valueLine} ${t.apps.openConcept}`}</span>
                <span className="vn-orbit-label" aria-hidden="true">
                  <b>{category}</b>
                  <i>{valueLine}</i>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Whether this browser can actually run the orbit. Checked before mounting so
 *  a failure falls back to the CSS field instead of an empty canvas. */
export function canRunOrbit() {
  if (typeof window === "undefined") return false;
  // A phone cannot show a five-device orbit usefully, and hover-less pointers
  // have no way to reach the reveal — the CSS rail is the better answer there.
  if (!window.matchMedia("(hover: hover) and (min-width: 768px)").matches) return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ?? (canvas.getContext("webgl") as WebGLRenderingContext | null),
    );
  } catch {
    return false;
  }
}
