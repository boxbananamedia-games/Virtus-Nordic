import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { APPLICATIONS, pick } from "../../../lib/applications";
import { useLang } from "../../../lib/language";
import { PhoneModel, type Finish } from "./device/PhoneModel";
import { StudioLighting } from "./device/Studio";

/**
 * The hero carousel: five devices orbiting a shared centre, each facing
 * radially outward so whichever swings nearest presents its screen.
 *
 * ── Hovering ──────────────────────────────────────────────────────────────
 * Pointing at a device pulls it out of the ring, through a full revolution, to
 * centre stage squared up to the camera. The ring itself never stops, and the
 * hovered device never stops travelling its own lap either — staging is a blend
 * away from a position that keeps advancing underneath it. That is what lets it
 * drop back into formation in exactly the right place, however long it was held
 * out, with no bookkeeping.
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
  /** Vertical travel as a fraction of radius: one rise and fall per lap.
   *  Shallower than it was, because the devices are considerably larger now:
   *  at 0.34 the top of the arc climbed behind the hero copy, where a bright
   *  screen sits under cream text with no scrim to separate them. */
  rise: 0.14,
  /** Degrees per second of phase. A lap is 360/speed seconds. */
  speed: 8,
  /** How much a device slows as it reaches the front, 0..1. */
  dwell: 0.82,
  /** Width of that slow stretch as a fraction of a lap. Narrow, so devices do
   *  not pile up at the front and present several screens at once. */
  dwellWidth: 0.055,
  /** Camera distance. Everything below is derived from one target: the nearest
   *  device should render ~45% of viewport height. Apparent height is
   *  DEVICE_H * canvasH / (2 * dist * tan(fov/2)), and the canvas is the hero,
   *  now 114svh — so with dist ≈ 78 the front device measures ~0.45vh. It read
   *  as distant at the previous 120. */
  cameraZ: 101,
  fov: 27,
  /** Pushes the formation down so it arcs below the hero copy rather than
   *  through it. Derived, not guessed: for the nearest device's centre to land
   *  at ~70% of viewport height, y = ndc * dist * tan(fov/2). Negative is
   *  down. */
  centreY: -4.5,
};

/**
 * Centre stage: where a hovered device flies to.
 *
 * Nearer the camera than the orbit's own front (z 33 against a radius of 22.6),
 * so the device grows to ~52% of viewport height, and lifted slightly so it
 * clears the fold with room for its label underneath. Any nearer and its top
 * edge climbs into the hero's CTA row, which paints above the canvas.
 */
const STAGE = { y: -3, z: 33 };

/** Time constants for the flight out and back, in seconds. Out is a little
 *  slower: arriving should feel decisive, leaving should feel like release. */
const STAGE_TAU = { in: 0.17, out: 0.24 };

/**
 * The entrance: a flypast, then a spin-down.
 *
 * The formation arrives as one thing rather than five — the devices come in
 * from off-screen left in a line, screens to camera, and fold onto their own
 * slots in the ring. The ring then takes off at roughly a lap a second and
 * decays to its cruising 8°/s, so the carousel spins up and settles rather than
 * simply starting.
 *
 * The whole formation is choreographed, which is why the ring shares ONE
 * Suspense boundary: five devices trickling in as their assets resolve cannot
 * make a formation. That costs waiting on the slowest model, which is a fair
 * price now the plates are WebP and the models load in parallel.
 *
 * `spinFrom` is derived, not chosen. The last device in the line finishes its
 * glide at `glide + (n-1) * stagger`, and the lap must not start before then:
 * rotation during the glide is a blend towards each device's own fixed slot
 * angle, and an angle that is advancing underneath that blend would wrap
 * through 2π and snap.
 */
const INTRO = {
  /** Seconds for one device's run in from the line. */
  glide: 0.75,
  /** Seconds between successive devices leaving the line. */
  stagger: 0.05,
  /** Lap speed multiplier the instant the ring takes off. 60 x 8°/s = 480°/s,
   *  a lap and a third every second. */
  boost: 60,
  /** Seconds for that to decay towards 1x. Total extra rotation is
   *  speed * (boost - 1) * decay ≈ 470°, so about one and a third bonus laps,
   *  visibly slowing by three seconds and cruising by seven. */
  decay: 1,
  /** Below this multiple of the cruising speed the devices become targetable
   *  again. A threshold rather than a timeout, so it tracks `boost` and `decay`
   *  if either is retuned. */
  grabbable: 6,
  /** Gap between devices along the line, in scene units. Where the line STARTS
   *  is not a constant: it is derived from the camera frustum each frame, so
   *  the formation is off-screen at every aspect rather than at the one it was
   *  eyeballed on. */
  gap: 15,
  /** Clearance beyond the frustum edge, in scene units. A device is 7.15 wide. */
  margin: 7,
};

const INTRO_SPIN_FROM = INTRO.glide + (APPLICATIONS.length - 1) * INTRO.stagger;

/** Fast in, decelerating — the devices run in and settle onto their slots. */
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/**
 * Lap speed at `t` seconds after the ring appeared, in degrees per second.
 *
 * Exponential decay rather than a fixed ramp: it is the shape a real flywheel
 * makes, it never overshoots the cruising speed, and it approaches it closely
 * enough to be indistinguishable long before it arrives.
 */
function lapSpeed(t: number) {
  if (t < INTRO_SPIN_FROM) return 0;
  const k = Math.exp(-(t - INTRO_SPIN_FROM) / INTRO.decay);
  return ORBIT.speed * (1 + (INTRO.boost - 1) * k);
}

const plateUrl = (id: string) => `/lab-textures/${id}.webp`;

/**
 * Put the screen plates in flight with the models rather than behind them.
 *
 * PhoneModel calls useGLTF before useLoader, and the first hook to suspend
 * stops the ones after it from running at all — so without this, every device
 * fetched its 730KB model, and only then started on its screen. Preloading here
 * costs nothing (drei does the same for the models) and takes a whole
 * round-trip out of each device's arrival.
 */
if (typeof window !== "undefined") {
  for (const app of APPLICATIONS) useLoader.preload(THREE.TextureLoader, plateUrl(app.id));
}

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

/**
 * Signed rotation from `a` to facing the camera, in (-π, π].
 *
 * The stage rotation is `a + (turnToCamera(a) + 2π) * e`, which is exactly one
 * extra revolution on top of whatever it takes to square up. That expression
 * has to stay continuous while `e` is between 0 and 1, and it does: the only
 * discontinuity is where the shortest path flips sign, at a ≡ π — the back of
 * the orbit, where the control is hidden and a device cannot be hovered. The
 * lap's own 2π → 0 wrap is safe too, because `a` and this term jump by equal
 * and opposite amounts, and a 2π step in a rotation is invisible.
 */
function turnToCamera(a: number) {
  return -(((a + Math.PI) % (Math.PI * 2)) - Math.PI);
}

/**
 * The two DOM elements tracked to each device.
 *
 * `el` is the real control, tracked to the device you can SEE — so it is at
 * centre stage while the device is.
 *
 * `berth` is the slot the device left behind: an invisible span held at the
 * position the device would occupy if it were still in the ring. It exists
 * only to answer "is the pointer still on this device?" honestly. Without it,
 * pointing at a device sends it flying to centre stage, out from under the
 * pointer, which reads as leaving it — the device comes home, lands under the
 * pointer again, and the whole thing oscillates. With it, the pointer is still
 * on the device's place in the carousel, and the answer is yes.
 *
 * The berth keeps orbiting while the device is staged, so a resting pointer
 * eventually falls out of it and the device is released on its own. That is
 * the intended behaviour, not a side effect.
 */
type Hit = { el: HTMLButtonElement | null; berth: HTMLSpanElement | null };

function Device({
  index,
  screenTexture,
  angleRef,
  clockRef,
  easing,
  hits,
  stagedRef,
  reduced,
}: {
  index: number;
  screenTexture: string;
  angleRef: { current: number };
  /** Seconds since the whole formation appeared. Shared, so the entrance is one
   *  piece of choreography rather than five. */
  clockRef: { current: number };
  easing: Float32Array;
  hits: { current: Hit[] };
  /** Index of the device currently held at centre stage, or null. */
  stagedRef: { current: number | null };
  reduced: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const { camera, size } = useThree();
  // Reused across frames; allocating a Vector3 per frame per device would churn
  // the GC for no reason.
  const projected = useMemo(() => new THREE.Vector3(), []);
  const berthAt = useMemo(() => new THREE.Vector3(), []);
  /** 0 = in the ring, 1 = at centre stage. Its own value per device, so several
   *  can be mid-flight at once when the pointer moves between them. */
  const focus = useRef(0);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;

    const n = APPLICATIONS.length;
    const u = (angleRef.current / 360 + index / n) % 1;
    const a = sampleEasing(easing, u) * 2 * Math.PI;

    // The ring never stops for a hover, and this device never stops travelling
    // along it. Staging is a blend AWAY from a position that keeps advancing
    // underneath — which is what lets it land back in formation, in the right
    // place, however long it was held out.
    const ox = Math.sin(a) * ORBIT.radius;
    const oy = Math.sin(a) * ORBIT.radius * ORBIT.rise + ORBIT.centreY;
    const oz = Math.cos(a) * ORBIT.radius;

    // The run in from the line, 0 -> 1. The lap is held at a standstill until
    // the last device has finished (see INTRO_SPIN_FROM), so `a` is this
    // device's own fixed slot angle throughout and the rotation blend below has
    // a still target to aim at.
    const entry = reduced
      ? 1
      : easeOutCubic(
          Math.min(1, Math.max(0, (clockRef.current - index * INTRO.stagger) / INTRO.glide)),
        );

    if (reduced || entry < 1) {
      // No staging mid-entrance: hovering would blend towards a ring position
      // the device has not reached yet.
      focus.current = 0;
    } else {
      const target = stagedRef.current === index ? 1 : 0;
      const tau = target === 1 ? STAGE_TAU.in : STAGE_TAU.out;
      // Clamped like the lap advance: a backgrounded tab must not teleport a
      // device on return.
      focus.current += (target - focus.current) * (1 - Math.exp(-Math.min(delta, 0.1) / tau));
      if (Math.abs(target - focus.current) < 0.001) focus.current = target;
    }
    // Smoothstep on top of the exponential approach, so the flight eases out of
    // the ring as well as into the stage.
    const f = focus.current;
    const e = f * f * (3 - 2 * f);

    // Where the device would be if the entrance were over: its ring slot,
    // blended towards centre stage by any hover.
    const rx = ox + (0 - ox) * e;
    const ry = oy + (STAGE.y - oy) * e;
    const rz = oz + (STAGE.z - oz) * e;

    // …and where it starts: off the left edge of whatever frustum this viewport
    // actually has, at the height of the ring's centre and its mid depth, each
    // device queued a gap further back so the five read as a line.
    const tanHalfFov = Math.tan(((camera as THREE.PerspectiveCamera).fov * Math.PI) / 360);
    const halfWidth = ORBIT.cameraZ * tanHalfFov * (size.width / size.height);
    const lineX = -(halfWidth + INTRO.margin + index * INTRO.gap);

    g.position.set(
      lineX + (rx - lineX) * entry,
      ORBIT.centreY + (ry - ORBIT.centreY) * entry,
      rz * entry,
    );
    // Face radially outward — the entire carousel rule in one line. The device
    // nearest the camera therefore presents its screen with no keyframing. The
    // second term turns that into a full revolution ending square to the camera
    // as the device reaches the stage, and unwinds it on the way back.
    //
    // Scaling the whole thing by `entry` means the devices fly in square to the
    // camera, screens showing, and turn onto their radial heading as they take
    // their slots. At entry = 1 it is exactly the carousel rule again.
    g.rotation.set(0, (a + (turnToCamera(a) + Math.PI * 2) * e) * entry, 0);

    // Apparent height from the perspective divide, so a hit area shrinks with
    // its device as it travels to the back of the orbit.
    //
    // DEVICE_H is already in scene units (1 unit = 10mm), which is what the
    // group's NORMALISE scale produces — multiplying by NORMALISE again here
    // inflated every control to ~7.5x the device.
    const place = (el: HTMLElement, at: THREE.Vector3, z: number) => {
      projected.copy(at).project(camera);
      const dist = camera.position.distanceTo(at);
      const h = (DEVICE_H * size.height) / (2 * dist * tanHalfFov);
      const w = h * (71.5 / 149.6);
      const x = (projected.x * 0.5 + 0.5) * size.width;
      const y = (-projected.y * 0.5 + 0.5) * size.height;
      el.style.transform = `translate3d(${Math.round(x - w / 2)}px, ${Math.round(y - h / 2)}px, 0)`;
      el.style.width = `${Math.round(w)}px`;
      el.style.height = `${Math.round(h)}px`;
      el.style.zIndex = String(z - Math.round(dist));
      return dist;
    };

    // Track the accessible control to the device you can see.
    const el = hits.current[index]?.el;
    if (!el) return;
    // Depth-sort the controls so the front device wins the pointer where two
    // overlap on screen, matching what the viewer sees.
    place(el, g.position, 1000);
    // Hide the control while its device is on the far side and facing away:
    // clicking a phone you are seeing the back of is not a meaningful target.
    // Tested against the rotation actually rendered rather than the orbit angle,
    // so it agrees with the entrance — during the run in the devices are square
    // to the camera whatever their slot angle says.
    //
    // Never while it is staged, though. A staged device keeps travelling its
    // lap underneath, so its orbit angle eventually says "facing away" even
    // though the thing on screen is squared up at centre stage — and switching
    // its control off there would drop the hover and fling it home.
    //
    // And never before the device has arrived, or while the ring is still
    // whipping round — yanking a device to centre stage out of a formation
    // doing better than a lap a second reads as a glitch, not a hover.
    const inert =
      entry < 1 ||
      (!reduced && lapSpeed(clockRef.current) > ORBIT.speed * INTRO.grabbable);
    const facingAway = (Math.cos(g.rotation.y) < -0.35 && e < 0.02) || inert;
    el.style.pointerEvents = facingAway ? "none" : "auto";
    el.style.opacity = facingAway ? "0" : "1";

    // The vacated slot, live only while the device is actually away from it.
    // Ranked below every control, so a device orbiting across a berth still
    // takes the pointer.
    const berth = hits.current[index]?.berth;
    if (!berth) return;
    if (e < 0.01) {
      berth.style.pointerEvents = "none";
    } else {
      berthAt.set(ox, oy, oz);
      place(berth, berthAt, 500);
      berth.style.pointerEvents = "auto";
    }
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
  stagedRef,
  reduced,
}: {
  hits: { current: Hit[] };
  stagedRef: { current: number | null };
  reduced: boolean;
}) {
  const easing = useOrbitEasing();
  // Static but composed: under reduce the formation holds an arrangement where
  // all five are visible rather than stacking behind one another.
  const angleRef = useRef(reduced ? 18 : 0);
  /** Seconds since this component mounted — which, because the whole ring sits
   *  behind one Suspense boundary, is the moment all five devices were ready.
   *  Everything in the entrance is timed off this one value. */
  const clockRef = useRef(0);

  useFrame((_, delta) => {
    if (reduced) return;
    // Clamp delta so a backgrounded tab does not jump the orbit on return.
    const dt = Math.min(delta, 0.1);
    clockRef.current += dt;
    // The lap runs regardless of what the pointer is doing. Freezing it on
    // hover made the whole hero look broken for as long as the pointer rested
    // anywhere near a device. It is held at zero only for the entrance, while
    // the devices are still running in from the line.
    angleRef.current = (angleRef.current + dt * lapSpeed(clockRef.current)) % 360;
  });

  return (
    <>
      {APPLICATIONS.map((app, i) => (
        <Device
          key={app.id}
          index={i}
          screenTexture={plateUrl(app.id)}
          angleRef={angleRef}
          clockRef={clockRef}
          easing={easing}
          hits={hits}
          stagedRef={stagedRef}
          reduced={reduced}
        />
      ))}
    </>
  );
}

export function HeroOrbit({ onSelect }: { onSelect: (id: string) => void }) {
  const { lang, t } = useLang();
  const hits = useRef<Hit[]>(APPLICATIONS.map(() => ({ el: null, berth: null })));
  /** Which device is out at centre stage. A ref as well as state because the
   *  render loop reads it every frame and must not re-render the hero to do so;
   *  the state copy only drives the label. */
  const stagedRef = useRef<number | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const reduced =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const stage = (index: number | null) => {
    if (stagedRef.current === index) return;
    stagedRef.current = index;
    setActiveId(index === null ? null : APPLICATIONS[index].id);
  };

  /**
   * Leaving releases immediately — the whole point is that the moment the
   * pointer is off a phone, that phone goes home.
   *
   * The one microtask of grace is not a delay for the viewer's benefit; it is
   * there because a single pointer movement can dispatch leave-then-enter as it
   * crosses from a device to its own berth, or between two overlapping devices.
   * Both arrive before microtasks run, so an enter in the same movement cancels
   * the release and nothing flickers. Anything slower than a microtask — a
   * timeout, a frame — would be a real delay and would feel sticky.
   */
  const releasing = useRef(false);
  const leave = () => {
    releasing.current = true;
    queueMicrotask(() => {
      if (releasing.current) stage(null);
    });
  };
  const enter = (index: number) => {
    releasing.current = false;
    stage(index);
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
        {/* One boundary for the whole ring, deliberately. PhoneModel suspends
            while its GLB and plate decode, and the entrance is a formation —
            five devices trickling in as their own assets resolve cannot fly in
            as a line. Mounting Ring is therefore the starting gun, and its
            clock starts from zero at that moment. */}
        <Suspense fallback={null}>
          <Ring hits={hits} stagedRef={stagedRef} reduced={reduced} />
        </Suspense>
      </Canvas>

      {/* The real interaction layer. One button per concept, tracked to its
          device by the render loop above, plus the berth it leaves behind while
          it is staged. Between them they answer "is the pointer on this
          device?" — nothing wider than that holds a device out. */}
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
                onPointerEnter={() => enter(i)}
                onPointerLeave={leave}
                onFocus={() => enter(i)}
                onBlur={leave}
              >
                <span className="sr-only">{`${app.name}. ${category}. ${valueLine} ${t.apps.openConcept}`}</span>
                <span className="vn-orbit-label" aria-hidden="true">
                  <b>{category}</b>
                  <i>{valueLine}</i>
                </span>
              </button>
              <span
                ref={(el) => {
                  hits.current[i].berth = el;
                }}
                className="vn-orbit-berth"
                aria-hidden="true"
                onPointerEnter={() => enter(i)}
                onPointerLeave={leave}
              />
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
