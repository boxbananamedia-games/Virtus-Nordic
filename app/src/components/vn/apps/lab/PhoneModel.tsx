import { useEffect, useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useRoundedScreenGeometry } from "./RoundedScreen";

/**
 * One device: the iPhone chassis in a given finish, its screen, and its
 * Dynamic Island.
 *
 * ── Why each finish is a whole GLB with textures EMBEDDED ────────────────
 * An earlier revision split the assets: one shared geometry plus loose JPEG
 * maps per finish, rebound to the material at runtime (0.99MB total instead
 * of 3.6MB). It rendered subtly and then catastrophically wrong — camera
 * lenses sampling body colour instead of their dark texels. A controlled A/B
 * (harness lens-debug sheet) proved the corruption: the SAME texture bytes
 * render correctly embedded-in-GLB via GLTFLoader and incorrectly as loose
 * files via TextureLoader with hand-set flipY/colorSpace. Rather than keep
 * fighting the loose path's plumbing, each finish now ships as Meshy exported
 * it (size-optimised only: resized textures, simplified quantized mesh), and
 * GLTFLoader owns ALL texture semantics. Fidelity to the supplied models is
 * the contract; the 2.6MB saving was not worth breaking it.
 *
 * Materials are deliberately untouched — no metalness overrides, no roughness
 * multipliers. The reference look (Meshy viewer) uses the maps as authored.
 * The ONE material property this component may set is envMapIntensity,
 * because it belongs to the scene's lighting design, not to the model.
 *
 * ── What this component adds that the raw model lacks ────────────────────
 *  1. A screen. These are back-view generations: the front face is flat noise
 *     with hallucinated camera lenses on it. Our rounded screen mesh sits just
 *     proud of that face and covers it completely.
 *  2. A Dynamic Island as real geometry at Apple's proportions, rather than
 *     the one Meshy painted into the texture in the wrong place.
 */

/** The five finishes, one per concept. */
export type Finish = "graphite" | "copper" | "silver" | "green" | "navy";

const FINISH_GLB: Record<Finish, string> = {
  graphite: "/lab-models/opt/graphite.glb",
  copper: "/lab-models/opt/copper.glb",
  silver: "/lab-models/opt/silver.glb",
  green: "/lab-models/opt/green.glb",
  navy: "/lab-models/opt/navy.glb",
};

/** Apple's Dynamic Island, as fractions of the display it sits on:
 *  125 x 36.7pt on a 393 x 852pt screen, 11pt below the top edge. */
const ISLAND = { wFrac: 125 / 393, aspect: 125 / 36.7, topFrac: 11 / 852 };

export type PhoneFit = {
  /** Screen size as a fraction of the model's measured bounding box. */
  screenW: number;
  screenH: number;
  /** Nudge the screen up or down, as a fraction of body height. */
  screenY: number;
  /** How far the screen floats above the front face, in model units. */
  lift: number;
};

export const DEFAULT_FIT: PhoneFit = {
  screenW: 0.925,
  screenH: 0.958,
  screenY: 0,
  lift: 0.0015,
};

/** Load and measure one finish's GLB. All five exports share a bounding box
 *  (verified by hash during optimisation), so fit numbers hold across them. */
function usePhoneAsset(finish: Finish) {
  const { scene } = useGLTF(FINISH_GLB[finish]);
  return useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const centre = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(centre);
    return { scene, size, centre, frontZ: box.max.z };
  }, [scene]);
}

export function PhoneModel({
  screenTexture,
  finish = "graphite",
  fit = DEFAULT_FIT,
  flattenZ = 1,
  envIntensity = 1.25,
}: {
  screenTexture: string;
  finish?: Finish;
  fit?: PhoneFit;
  /** The mesh measures ~22% thicker than a real body-plus-bump. */
  flattenZ?: number;
  /** Scene-lighting property, the one thing we set on the model's materials.
   *  1.25 matches the Meshy viewer's HDRI intensity. */
  envIntensity?: number;
}) {
  const { scene, size, centre, frontZ } = usePhoneAsset(finish);
  const map = useLoader(THREE.TextureLoader, screenTexture);

  // Each device instance clones the shared scene graph; geometry and textures
  // stay shared on the GPU. Materials are cloned only to carry a per-context
  // envMapIntensity without cross-talk between orbit and solo bench.
  const body = useMemo(() => {
    const root = scene.clone(true);
    root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
      mat.envMapIntensity = envIntensity;
      // Grazing-angle sharpness for the atlas; spatially neutral.
      if (mat.map) mat.map.anisotropy = 8;
      mesh.material = mat;
    });
    return root;
  }, [scene, envIntensity]);

  useEffect(() => {
    map.colorSpace = THREE.SRGBColorSpace;
    // Without anisotropy the screen smears badly once the device turns away
    // from head-on, which is most of the orbit.
    map.anisotropy = 16;
    map.needsUpdate = true;
  }, [map]);

  const screenW = size.x * fit.screenW;
  const screenH = size.y * fit.screenH;
  const screenZ = frontZ * flattenZ + fit.lift;
  const screenGeo = useRoundedScreenGeometry(screenW, screenH, screenW * 0.135);

  const islandW = screenW * ISLAND.wFrac;
  const islandH = islandW / ISLAND.aspect;
  const islandGeo = useRoundedScreenGeometry(islandW, islandH, islandH / 2);
  const islandY =
    centre.y + fit.screenY * size.y + screenH / 2 - screenH * ISLAND.topFrac - islandH / 2;

  return (
    <group>
      <group scale={[1, 1, flattenZ]}>
        <primitive object={body} />
      </group>

      <mesh geometry={screenGeo} position={[centre.x, centre.y + fit.screenY * size.y, screenZ]}>
        <meshBasicMaterial map={map} toneMapped={false} />
      </mesh>

      {/* Above the screen, and deliberately not pure black: a real island still
          catches a little light off the glass. */}
      <mesh geometry={islandGeo} position={[centre.x, islandY, screenZ + 0.0008]}>
        <meshBasicMaterial color="#07080a" toneMapped={false} />
      </mesh>
    </group>
  );
}

for (const url of Object.values(FINISH_GLB)) useGLTF.preload(url);
