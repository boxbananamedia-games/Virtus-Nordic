import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { APPLICATIONS } from "../../../../lib/applications";
import type { OrbitKnobs } from "./OrbitCss";
import { PhoneModel, type Finish } from "./PhoneModel";

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

function Device({
  index,
  textureUrl,
  knobs,
  angleRef,
}: {
  index: number;
  textureUrl: string;
  knobs: OrbitKnobs;
  angleRef: { current: number };
}) {
  const group = useRef<THREE.Group>(null);

  useFrame(({ camera }) => {
    const g = group.current;
    if (!g) return;
    const a = ((angleRef.current + index * 72) * Math.PI) / 180;
    const R = sceneRadius(knobs);
    const tilt = (knobs.tilt * Math.PI) / 180;

    // The ring's tilt is baked into the position rather than applied as a
    // parent rotation. Two reasons: the orbit still reads as an ellipse on
    // screen, AND the device stays a child of an untilted space, so its local Y
    // rotation IS world yaw. Under a tilted parent it is not, and every facing
    // correction below would be quietly wrong.
    const x = Math.sin(a) * R;
    const zFlat = Math.cos(a) * R;
    g.position.set(x, -zFlat * Math.sin(tilt), zFlat * Math.cos(tilt));

    // Yaw toward the camera instead of billboarding to a fixed -Z. With a fixed
    // axis, perspective means an off-centre device is viewed obliquely and its
    // screen foreshortens to an unreadable sliver at the sides of the orbit.
    // Yaw only — a full lookAt would also pitch the device up or down toward
    // the camera, and phones that tip out of vertical read as falling.
    const yaw = Math.atan2(camera.position.x - g.position.x, camera.position.z - g.position.z);

    // A residual turn on top keeps the formation alive rather than five slabs
    // sliding around always dead-on. face = 1 is fully camera-facing.
    g.rotation.set(0, yaw + a * (1 - knobs.face), 0);
  });

  return (
    <group ref={group}>
      <group scale={NORMALISE}>
        <PhoneModel
          screenTexture={textureUrl}
          finish={FINISHES[index % FINISHES.length]}
          flattenZ={FLATTEN_Z}
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
}: {
  knobs: OrbitKnobs;
  angleRef: { current: number };
  onFrame?: () => void;
  freeze?: number;
}) {
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useFrame((_, delta) => {
    if (freeze !== undefined) angleRef.current = freeze;
    else if (!reduced) angleRef.current = (angleRef.current + delta * knobs.speed) % 360;
    onFrame?.();
  });

  // No rotation here any more: the tilt now lives in each device's position
  // (see Device), so this group stays axis-aligned with the world.
  return (
    <group>
      {APPLICATIONS.map((app, i) => (
        <Device
          key={app.id}
          index={i}
          textureUrl={`/lab-textures/${app.id}.png`}
          knobs={knobs}
          angleRef={angleRef}
        />
      ))}
    </group>
  );
}

export function OrbitGl({
  knobs,
  onFrame,
  freeze,
}: {
  knobs: OrbitKnobs;
  onFrame?: () => void;
  freeze?: number;
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
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 6, 8]} intensity={1.6} />
        {/* Self-hosted lighting: Lightformers are rendered into a cubemap at
            runtime, so the metal gets real reflections with no HDRI fetch and
            therefore no CSP change. */}
        <Environment resolution={256}>
          <Lightformer intensity={2.4} position={[0, 4, 4]} scale={[10, 6, 1]} />
          <Lightformer intensity={1.1} position={[-6, 1, 2]} scale={[6, 8, 1]} color="#cfe0ff" />
          <Lightformer intensity={0.9} position={[6, -2, 3]} scale={[6, 8, 1]} color="#ffe9cf" />
        </Environment>
        {/* useLoader suspends while the screen plates decode. Without a boundary
            the whole scene stays suspended and the canvas renders empty. */}
        <Suspense fallback={null}>
          <Ring knobs={knobs} angleRef={angleRef} onFrame={onFrame} freeze={freeze} />
        </Suspense>
      </Canvas>
    </div>
  );
}
