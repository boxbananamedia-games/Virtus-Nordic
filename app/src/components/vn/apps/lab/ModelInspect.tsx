import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useLoader } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { RoundedScreen } from "./RoundedScreen";

/**
 * Model inspection view — Phase 0, not production.
 *
 * Renders the supplied GLB alone from a fixed angle so its surface quality can
 * actually be judged, and reports the measured geometry back to the page so the
 * screen plane can be aligned to real numbers rather than guesses.
 *
 * The Meshy export is one mesh with one material: chassis and screen share a
 * single baked base-colour texture, so there is no screen surface to swap. The
 * screen has to be a plane of our own, positioned against the model's measured
 * front face — which is what `onMeasure` exists to find.
 */
export type ModelStats = {
  min: [number, number, number];
  max: [number, number, number];
  size: [number, number, number];
  depthOverWidth: number;
  heightOverWidth: number;
  tris: number;
};

function Model({
  url,
  onMeasure,
  yaw,
  flattenZ,
  screen,
}: {
  url: string;
  onMeasure?: (s: ModelStats) => void;
  yaw: number;
  /** Scale on Z. Measured, the mesh is ~22% thicker than a real body+bump. */
  flattenZ: number;
  /** Screen plane, as fractions of the model's own measured bounding box. */
  screen?: { w: number; h: number; tex: string; yOff: number };
}) {
  const { scene } = useGLTF(url);
  const [box] = useState(() => new THREE.Box3());
  const tex = useLoader(THREE.TextureLoader, screen?.tex ?? "/lab-textures/guf-kugler.png");

  useEffect(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    tex.needsUpdate = true;
  }, [tex]);

  useEffect(() => {
    box.setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    let tris = 0;
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && m.geometry) {
        const g = m.geometry;
        tris += (g.index ? g.index.count : g.attributes.position.count) / 3;
      }
    });
    onMeasure?.({
      min: [box.min.x, box.min.y, box.min.z],
      max: [box.max.x, box.max.y, box.max.z],
      size: [size.x, size.y, size.z],
      depthOverWidth: size.z / size.x,
      heightOverWidth: size.y / size.x,
      tris: Math.round(tris),
    });
  }, [scene, onMeasure, box]);

  // The model is a back-view generation: its +Z face (the screen side) is flat
  // black noise with hallucinated camera lenses on it. Our own plane sits just
  // proud of that face and covers the artefacts entirely.
  const size = new THREE.Vector3();
  const centre = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(centre);
  const frontZ = box.max.z * flattenZ;

  return (
    <group rotation={[0, (yaw * Math.PI) / 180, 0]}>
      <group scale={[1, 1, flattenZ]}>
        <primitive object={scene} />
      </group>
      {screen && size.x > 0 && (
        <RoundedScreen
          width={size.x * screen.w}
          height={size.y * screen.h}
          // Corner radius tracks the device width the way Apple's does
          // (~13.5% of body width), so the glass follows the chassis curve
          // instead of poking square corners past it.
          radius={size.x * screen.w * 0.135}
          map={tex}
          // Just proud of the front face. Measured, not guessed: seating it
          // below max.z puts the plane inside the body and the chassis occludes
          // it entirely. The offset is kept tiny (~0.1mm at this scale) so the
          // glass does not visibly float when the device turns edge-on.
          position={[centre.x, centre.y + screen.yOff * size.y, frontZ + 0.0015]}
        />
      )}
    </group>
  );
}

export function ModelInspect({
  // No default: this inspects raw candidate exports, and every such asset is
  // regenerated on demand by harness/eval-prep.mjs rather than kept in public/.
  // A default would just point at a file that is usually absent.
  url,
  yaw = 0,
  flattenZ = 1,
  screenW = 0.9,
  screenH = 0.94,
  screenY = 0,
  tex = "/lab-textures/guf-kugler.png",
  showScreen = true,
}: {
  url: string;
  yaw?: number;
  flattenZ?: number;
  screenW?: number;
  screenH?: number;
  screenY?: number;
  tex?: string;
  showScreen?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<ModelStats | null>(null);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="ol-stage" />;

  return (
    <div className="ol-stage" data-inspect="true">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 4.2], fov: 30, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 5, 6]} intensity={1.8} />
        <directionalLight position={[-4, 2, -3]} intensity={0.7} />
        <Environment resolution={256}>
          <Lightformer intensity={2.6} position={[0, 4, 4]} scale={[10, 6, 1]} />
          <Lightformer intensity={1.2} position={[-6, 1, 2]} scale={[6, 8, 1]} color="#cfe0ff" />
          <Lightformer intensity={1.0} position={[6, -2, 3]} scale={[6, 8, 1]} color="#ffe9cf" />
        </Environment>
        <Suspense fallback={null}>
          <Model
            url={url}
            onMeasure={setStats}
            yaw={yaw}
            flattenZ={flattenZ}
            screen={showScreen ? { w: screenW, h: screenH, tex, yOff: screenY } : undefined}
          />
        </Suspense>
      </Canvas>
      {/* Read by the harness so measurements come from the loaded scene graph
          rather than from re-parsing the file. */}
      <script
        id="ol-model-stats"
        type="application/json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(stats) }}
      />
    </div>
  );
}
