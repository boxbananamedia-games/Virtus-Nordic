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
 * The entrance: a conveyor feeding a whirling ring, one phone at a time.
 *
 * Every phone travels the same straight, fixed line: off-screen left to the
 * GATE, the right-hand side of the ring. It merges at the exact moment its own
 * slot sweeps through that point — merges are driven by ring rotation, not by
 * a clock. Between one merge and the next the ring turns exactly `spacing`
 * degrees (a full lap plus one slot), so each phone hooks on one slot directly
 * behind the one before it and the queue assembles nose to tail; and because
 * the boarding speed is constant, the arrival tempo is a metronome by
 * construction: spacing / boardSpeed seconds per phone, exactly. The earlier
 * version timed entries with a clock and let each phone chase its own whirling
 * slot — tempos drifted and the flights wobbled; this one cannot do either.
 *
 * Boarding runs at two laps a second — the blur — and the moment the last
 * phone merges, the speed decays on one exponential to the cruising 8°/s.
 *
 * A phone's rotation is the carousel rule from its first frame, so it is
 * already spinning about its own axis as it crosses. Its flight ends AT the
 * gate at the exact moment its slot arrives, so position is continuous at the
 * merge — the velocity change there is deliberate: the spiral snatches it.
 *
 * The dwell fade (see the angle computation in Device) is what keeps the fast
 * ring turning uniformly instead of lurching five times a lap; the dwell
 * returns as the ring slows. Everything here is tuned against
 * art-source/capture-hero.mjs and probe-hero.mjs — change a number, run them
 * again.
 */
const INTRO = {
  /** Degrees the ring turns between one merge and the next: one lap plus one
   *  slot, so every phone joins directly behind the previous one. */
  spacing: 360 + 360 / APPLICATIONS.length,
  /** The slot angle at which a phone merges, in degrees — the ring's right
   *  side, just short of its rightmost point so the slot is still moving
   *  rightward as it takes the phone. */
  gate: 80,
  /** Seconds for one phone's crossing from off-screen to the gate. Longer than
   *  the tempo on purpose: the next phone sets off while the previous one is
   *  still crossing, so the line always carries evenly spaced traffic — it is
   *  the belt, not a queue of solo runs. */
  glide: 0.9,
  /** Lap speed while boarding, degrees per second. Constant — that is what
   *  makes the tempo exact — and two laps a second, which is the blur. */
  boardSpeed: 720,
  /** Seconds for the post-boarding decay towards cruise. */
  decay: 1.0,
  /** Below this multiple of the cruising speed the devices become targetable.
   *  A threshold rather than a timeout, so it tracks the speed curve if it is
   *  retuned. */
  grabbable: 4,
  /** Clearance beyond the frustum edge, in scene units. A device is 7.15 wide,
   *  so this puts its trailing edge 3.4 units clear — and the frustum is
   *  measured each frame rather than tuned once, so entry is off-screen at
   *  every aspect. */
  margin: 7,
};

/** Where the conveyor delivers: the gate's fixed position in world space. */
const GATE = (() => {
  const a = (INTRO.gate * Math.PI) / 180;
  return {
    x: Math.sin(a) * ORBIT.radius,
    y: Math.sin(a) * ORBIT.radius * ORBIT.rise + ORBIT.centreY,
    z: Math.cos(a) * ORBIT.radius,
  };
})();

/** Boarding order. Slot angles grow with index, so "one slot directly behind
 *  the previous phone" means descending index: 0, 4, 3, 2, 1. */
const mergeK = (i: number) => (APPLICATIONS.length - i) % APPLICATIONS.length;
/** When the k-th merge happens, in seconds. The first flight starts at t = 0 —
 *  no dead air — and lands `glide` later; each subsequent merge is exactly one
 *  tempo after the previous. */
const mergeTime = (k: number) => INTRO.glide + (INTRO.spacing / INTRO.boardSpeed) * k;
const BOARD_END = mergeTime(APPLICATIONS.length - 1);
/** Spin at t = 0, chosen so that slot k is at the gate precisely at
 *  mergeTime(k): spin(t) = SPIN_FROM + boardSpeed * t while boarding, and
 *  SPIN_FROM + boardSpeed * mergeTime(0) = gate by construction. */
const SPIN_FROM = INTRO.gate - INTRO.boardSpeed * INTRO.glide;

/** The crossing: gathers speed off-screen, sails, and settles onto the gate. */
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);

/**
 * Lap speed at `t` seconds after the ring appeared, in degrees per second.
 *
 * Constant while the phones board — the tempo depends on it — then one
 * exponential decay to cruise, starting the instant the last phone merges.
 * Continuous at the junction: the decay starts FROM the boarding speed.
 */
function lapSpeed(t: number) {
  if (t <= BOARD_END) return INTRO.boardSpeed;
  return ORBIT.speed + (INTRO.boardSpeed - ORBIT.speed) * Math.exp(-(t - BOARD_END) / INTRO.decay);
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
  spinRef,
  clockRef,
  easing,
  hits,
  stagedRef,
  reduced,
}: {
  index: number;
  screenTexture: string;
  /** Total degrees the lap has turned since the ring appeared. */
  spinRef: { current: number };
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

    const clock = clockRef.current;
    const n = APPLICATIONS.length;
    const phase = spinRef.current / 360 + index / n;
    const u = phase - Math.floor(phase);
    // The dwell fade. At cruise (w = 1) each device eases to a near-stop at the
    // front of the ring, which is the point of a carousel; at launch speed that
    // same easing lurched the ring in bursts, five per lap. Weighting it by
    // cruise-speed / lap-speed makes the fast ring turn uniformly and hands the
    // dwell back exactly as smoothly as the speed decays. The two curves agree
    // at u = 0 and u = 1, so the blend cannot jump at a lap boundary.
    const w = reduced ? 1 : ORBIT.speed / lapSpeed(clock);
    const aLin = u * 2 * Math.PI;
    const a = aLin + (sampleEasing(easing, u) * 2 * Math.PI - aLin) * w;

    // The ring never stops for a hover, and this device never stops travelling
    // along it. Staging is a blend AWAY from a position that keeps advancing
    // underneath — which is what lets it land back in formation, in the right
    // place, however long it was held out.
    const ox = Math.sin(a) * ORBIT.radius;
    const oy = Math.sin(a) * ORBIT.radius * ORBIT.rise + ORBIT.centreY;
    const oz = Math.cos(a) * ORBIT.radius;

    // This device's crossing, 0 -> 1, timed to end at the exact moment its own
    // slot sweeps through the gate. Past its merge time it is 1 by definition —
    // the phone belongs to the ring from then on.
    const tm = mergeTime(mergeK(index));
    const entry =
      reduced || clock >= tm
        ? 1
        : easeInOutCubic(clamp01((clock - (tm - INTRO.glide)) / INTRO.glide));

    if (reduced || entry < 1) {
      // No staging mid-flight: hovering would blend towards a ring position the
      // device has not reached yet.
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

    // Where the device belongs right now: its ring slot, blended towards centre
    // stage by any hover.
    const rx = ox + (0 - ox) * e;
    const ry = oy + (STAGE.y - oy) * e;
    const rz = oz + (STAGE.z - oz) * e;

    const tanHalfFov = Math.tan(((camera as THREE.PerspectiveCamera).fov * Math.PI) / 360);
    if (entry < 1) {
      // The crossing: a straight, fixed line at the gate's own height and
      // depth, from off the left edge of the frustum to the gate. The target
      // does not move — the SLOT arrives at the gate as the phone does — which
      // is what makes the line read as a belt. The earlier version aimed each
      // phone at its own whirling slot, and the flights wobbled and bunched.
      //
      // Frustum width measured on the gate's plane, since that is where the
      // phone is when "off the edge of the frame" has to be true.
      const halfWidth = (ORBIT.cameraZ - GATE.z) * tanHalfFov * (size.width / size.height);
      const ex = -(halfWidth + INTRO.margin);
      g.position.set(ex + (GATE.x - ex) * entry, GATE.y, GATE.z);
    } else {
      g.position.set(rx, ry, rz);
    }
    // Face radially outward — the entire carousel rule in one line. The device
    // nearest the camera presents its screen with no keyframing, and a device
    // flying in is already rotating about its own axis, because this IS its
    // rotation from its first frame: the ring's spin and the device's spin are
    // one number. The `turnToCamera` term adds a full revolution ending square
    // to the camera as a device reaches centre stage, and unwinds it on the way
    // back.
    //
    // Wrapped angle throughout. The 2π jump at a lap boundary is invisible
    // because the rotation is set absolutely every frame; the unwrapped angle
    // an earlier version needed existed only for a partial multiplier over this
    // term, and the multiplier is gone.
    g.rotation.set(0, a + (turnToCamera(a) + Math.PI * 2) * e, 0);

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
    const inert = entry < 1 || (!reduced && lapSpeed(clock) > ORBIT.speed * INTRO.grabbable);
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
  /** Total degrees turned. Starts at SPIN_FROM so slot k reaches the gate at
   *  exactly mergeTime(k). Static but composed under reduce: an arrangement
   *  where all five are visible rather than stacking behind one another. */
  const spinRef = useRef(reduced ? 18 : SPIN_FROM);
  /** Seconds since this component mounted — which, because the whole ring sits
   *  behind one Suspense boundary, is the moment all five devices were ready.
   *  Everything in the entrance is timed off this one value. */
  const clockRef = useRef(0);

  useFrame((_, delta) => {
    if (reduced) return;
    // Clamp delta so a backgrounded tab does not jump the orbit on return.
    const dt = Math.min(delta, 0.1);
    clockRef.current += dt;
    // The lap runs from the ring's first frame — the whole entrance happens
    // inside an already-spinning system — and it never stops for the pointer
    // either: freezing it on hover made the hero look broken for as long as the
    // pointer rested anywhere near a device.
    spinRef.current += dt * lapSpeed(clockRef.current);
  });

  return (
    <>
      {APPLICATIONS.map((app, i) => (
        <Device
          key={app.id}
          index={i}
          screenTexture={plateUrl(app.id)}
          spinRef={spinRef}
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
