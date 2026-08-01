import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { APPLICATIONS } from "../../../../lib/applications";
import type { OrbitKnobs } from "./OrbitCss";
import { PhoneModel, type Finish } from "../device/PhoneModel";
import { StudioLighting, type StudioVariant } from "../device/Studio";

/**
 * BRANCH B — orbit in WebGL. Prototype for the Phase 0 bake-off.
 *
 * Built to give real 3D its best honest shot, not a straw man:
 *
 *  - device geometry at true iPhone 16 Pro proportions (149.6 x 71.5 x 8.25mm,
 *    1 scene unit = 10mm), so the chassis has actual thickness and a visible
 *    metal side band — the one thing Branch A genuinely cannot do
 *  - a physical titanium material that responds to light angle as the device
 *    turns, which is the whole aesthetic argument for going 3D
 *  - screens as pre-baked plates at 1170x2532, the device's true resolution.
 *    That is the best case for texture fidelity; rasterising live DOM per frame
 *    would be slower and more fragile, not sharper.
 *
 * Lighting is built from Lightformers inside a procedurally rendered
 * environment rather than an HDRI file. That is deliberate: the site's CSP is
 * `default-src 'self'` with no blob:, so drei's CDN-hosted HDRI presets would
 * be blocked outright. Anything this branch needs has to be self-hosted.
 */

const MM = 0.1; // 1 scene unit = 10mm
const BODY = { w: 71.5 * MM, h: 149.6 * MM };

/** The supplied GLB is authored at its own arbitrary scale — measured, 0.9518
 *  units across. Normalising it to BODY.w keeps every camera and orbit figure
 *  below in real millimetres, and keeps Branch B framed identically to Branch A. */
const MODEL_W = 0.9518;
const NORMALISE = BODY.w / MODEL_W;

/** Measured depth/width is 0.2025 against ~0.166 for a real body plus camera
 *  bump, so the mesh is about 22% too deep. Squashing Z is the cheapest fix and
 *  is invisible from every angle the orbit actually shows. */
const FLATTEN_Z = 0.82;

/** One chassis finish per concept, in APPLICATIONS order. All five share a
 *  single mesh and differ only by texture set, so adding a finish costs about
 *  90KB rather than a whole model. */
const FINISHES: Finish[] = ["graphite", "copper", "silver", "green", "navy"];

/** Branch A's knobs are in CSS pixels; the scene is in millimetres. Both are
 *  expressed relative to the device width, which is the one quantity the two
 *  branches share, so the same knob values produce the same composition and
 *  the captures can actually be compared. */
const sceneRadius = (k: OrbitKnobs) => BODY.w * (k.radius / k.size);
const cameraZ = (k: OrbitKnobs) => BODY.w * (k.persp / k.size);
/** CSS `perspective: P` on a box of height H is a camera at distance P seeing
 *  H at the origin plane — which is this vertical FOV. */
const STAGE_H = 780;
const cameraFov = (k: OrbitKnobs) =>
  (2 * Math.atan(STAGE_H / 2 / k.persp) * 180) / Math.PI;

/** How wide the slow stretch is, as a fraction of one lap. Small on purpose:
 *  a broad dwell makes devices pile up around the front, so several present
 *  their screens at once instead of one at a time. */
const DWELL_WIDTH = 0.055;

/**
 * Precomputed easing table for one lap.
 *
 * We need position-as-a-function-of-phase, not a velocity we integrate each
 * frame: every device reads the same curve at its own offset, and integrating
 * per device would drift them apart over a long-running page.
 *
 * The closed-form `u - (a/2pi)·sin(2pi·u)` used previously spreads its slow
 * region across half the lap, which is what caused the pile-up. A narrow
 * Gaussian dip in *velocity* gives a brief, well-defined pause at the front and
 * has no closed-form integral — so integrate it once into a lookup table
 * instead, and normalise so a full lap still takes exactly one cycle.
 */
function useOrbitEasing(dwell: number) {
  return useMemo(() => {
    const N = 1024;
    const cumulative = new Float32Array(N + 1);
    let acc = 0;
    for (let i = 0; i < N; i++) {
      const u = i / N;
      // Distance to the front of the orbit, wrapping at the seam.
      const d = Math.min(u, 1 - u);
      const speed = 1 - dwell * Math.exp(-(d * d) / (2 * DWELL_WIDTH * DWELL_WIDTH));
      acc += speed;
      cumulative[i + 1] = acc;
    }
    for (let i = 0; i <= N; i++) cumulative[i] /= acc;
    return cumulative;
  }, [dwell]);
}

/** Sample the table with linear interpolation — 1024 steps is far finer than a
 *  frame's worth of travel, so this is visually continuous. */
function sampleEasing(table: Float32Array, u: number) {
  const N = table.length - 1;
  const x = u * N;
  const i = Math.floor(x);
  const f = x - i;
  return table[i] * (1 - f) + table[Math.min(i + 1, N)] * f;
}

function Device({
  index,
  textureUrl,
  knobs,
  angleRef,
  easing,
  envIntensity,
}: {
  index: number;
  textureUrl: string;
  knobs: OrbitKnobs;
  angleRef: { current: number };
  easing: Float32Array;
  envIntensity: number;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    const g = group.current;
    if (!g) return;

    // Each device eases on its OWN phase rather than sharing one ring speed.
    // Modulating a single shared velocity made all five slow down together —
    // the formation stuttering in unison instead of one phone arriving and
    // settling. Here the shared value is a plain linear phase, each device
    // offsets it by i/n, and the easing table gives a brief pause confined to
    // the front so only the presenting device is ever slow.
    const n = APPLICATIONS.length;
    const u = (angleRef.current / 360 + index / n) % 1;
    const a = sampleEasing(easing, u) * 2 * Math.PI;
    const R = sceneRadius(knobs);

    // θ = 0 is the point nearest the camera. Radius is constant: phones already
    // grow and shrink substantially coming round the near side, and that is the
    // perspective divide doing it honestly rather than a faked scale.
    const x = Math.sin(a) * R;
    const z = Math.cos(a) * R;

    // One rise and fall per lap, phased so the nearest point sits at mid
    // height — the featured phone is centred vertically rather than bobbing at
    // the moment you are meant to read it.
    const y = Math.sin(a) * R * knobs.rise;
    g.position.set(x, y, z);

    // The whole carousel rule, in one line: face radially outward from the
    // centre. Whichever phone swings nearest then presents its screen without
    // any hand-timed keyframing, and the far one shows its back. Position stays
    // in untilted space so local Y is true world yaw.
    g.rotation.set(0, a, 0);
  });

  return (
    <group ref={group}>
      <group scale={NORMALISE}>
        <PhoneModel
          screenTexture={textureUrl}
          finish={FINISHES[index % FINISHES.length]}
          flattenZ={FLATTEN_Z}
          envIntensity={envIntensity}
        />
      </group>
    </group>
  );
}

function Ring({
  knobs,
  angleRef,
  onFrame,
  freeze,
  envIntensity,
}: {
  knobs: OrbitKnobs;
  angleRef: { current: number };
  onFrame?: () => void;
  freeze?: number;
  envIntensity: number;
}) {
  const easing = useOrbitEasing(knobs.dwell);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useFrame((_, delta) => {
    if (freeze !== undefined) {
      angleRef.current = freeze;
    } else if (!reduced) {
      // Plain linear phase. All the easing now happens per device (see Device),
      // so this must stay uniform — modulating it here is what made the whole
      // formation slow down together.
      angleRef.current = (angleRef.current + delta * knobs.speed) % 360;
    }
    onFrame?.();
  });

  // No rotation here any more: the tilt now lives in each device's position
  // (see Device), so this group stays axis-aligned with the world. The easing
  // table is built once here and shared, so all five read one identical curve.
  return (
    <group>
      {APPLICATIONS.map((app, i) => (
        <Device
          key={app.id}
          index={i}
          textureUrl={`/lab-textures/${app.id}.webp`}
          knobs={knobs}
          angleRef={angleRef}
          easing={easing}
          envIntensity={envIntensity}
        />
      ))}
    </group>
  );
}

export function OrbitGl({
  knobs,
  onFrame,
  freeze,
  lighting = "day",
}: {
  knobs: OrbitKnobs;
  onFrame?: () => void;
  freeze?: number;
  /** Which studio rig lights the scene — see Studio.tsx. */
  lighting?: StudioVariant;
}) {
  const angleRef = useRef(0);
  // The Canvas touches WebGL on construction, so it can only exist after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="ol-stage" data-gl="pending" />;

  return (
    <div className="ol-stage" data-gl="true">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, cameraZ(knobs)], fov: cameraFov(knobs), near: 1, far: 400 }}
        // preserveDrawingBuffer is prototype-only: it keeps the framebuffer
        // readable so the capture harness can screenshot the canvas reliably.
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        style={{ background: "transparent" }}
      >
        {/* The rig lives in Studio.tsx, shared with the solo inspection view so
            judging a finish there tells the truth about the carousel. */}
        <StudioLighting variant={lighting} />
        {/* useLoader suspends while the screen plates decode. Without a boundary
            the whole scene stays suspended and the canvas renders empty. */}
        <Suspense fallback={null}>
          <Ring
            knobs={knobs}
            angleRef={angleRef}
            onFrame={onFrame}
            freeze={freeze}
            envIntensity={lighting === "dusk" ? 0.22 : 1.35}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
