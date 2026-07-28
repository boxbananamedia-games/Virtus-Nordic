import { useEffect, useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useRoundedScreenGeometry } from "./RoundedScreen";

/**
 * One device: the iPhone chassis in a given finish, its screen, and its
 * Dynamic Island.
 *
 * ── Why geometry and textures are separate files ─────────────────────────
 * The five supplied colour exports contain, after welding/simplification/
 * quantisation, exactly ONE distinct mesh — they were the same base model
 * differing only at float precision. Geometry is 83% of a packed GLB, so five
 * standalone files would ship the same 36k-triangle phone five times for
 * 3.65MB. Instead we ship one geometry (0.53MB) and five texture sets
 * (0.46MB): 0.99MB for the whole set, in the hero's LCP path.
 *
 * Sharing is only valid because UV layouts are identical across all five,
 * which harness/build-shared.mjs verifies by hashing post-optimisation
 * geometry rather than assuming it.
 *
 * ── What this component adds that the raw model lacks ────────────────────
 *  1. A screen. These are back-view generations: the front face is flat noise
 *     with hallucinated camera lenses on it. Our rounded screen mesh sits just
 *     proud of that face and covers it completely.
 *  2. A Dynamic Island as real geometry at Apple's proportions, rather than
 *     the one Meshy painted into the texture in the wrong place.
 *  3. Titanium rather than chrome — a roughness change, not a mesh change.
 */

const GEOMETRY = "/lab-models/shared/geo-a.glb";
const texUrl = (finish: string, role: string) =>
  `/lab-models/shared/tex/${finish}/${role}.jpg`;

/** The five finishes, one per concept. */
export type Finish = "graphite" | "copper" | "silver" | "green" | "navy";

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

/** Measure the shared mesh once. Every finish uses the same bounding box, so
 *  the screen fit and island placement are computed a single time. */
export function usePhoneGeometry() {
  const { scene } = useGLTF(GEOMETRY);
  return useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const centre = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(centre);
    return { scene, size, centre, frontZ: box.max.z };
  }, [scene]);
}

/** Build a chassis wearing one finish: clone the shared mesh, clone its
 *  material, and bind that finish's maps. */
function useChassis(finish: Finish) {
  const { scene } = usePhoneGeometry();
  const [base, normal, mr] = useLoader(THREE.TextureLoader, [
    texUrl(finish, "base_color"),
    texUrl(finish, "normal"),
    texUrl(finish, "metallic_roughness"),
  ]);

  return useMemo(() => {
    // glTF stores textures unflipped, but TextureLoader defaults flipY to true
    // for loose image files. Left alone, every map would be applied upside
    // down — the logo on the back is the giveaway.
    for (const t of [base, normal, mr]) {
      t.flipY = false;
      t.anisotropy = 8;
      t.needsUpdate = true;
    }
    // Colour data is sRGB; normals and the packed metal/rough mask are raw
    // numbers and must stay linear or the lighting goes wrong.
    base.colorSpace = THREE.SRGBColorSpace;
    normal.colorSpace = THREE.NoColorSpace;
    mr.colorSpace = THREE.NoColorSpace;

    const root = scene.clone(true);
    root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      // Clone the material too. Without this every device shares one material
      // and whichever finish mounts last wins for all five.
      const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
      mat.map = base;
      mat.normalMap = normal;
      // glTF packs roughness in G and metalness in B of a single texture, so
      // both slots point at the same map.
      mat.roughnessMap = mr;
      mat.metalnessMap = mr;
      // With maps bound these factors are multipliers, not absolutes.
      mat.roughness = 0.42;
      mat.metalness = 1;
      mat.envMapIntensity = 1.15;
      mat.needsUpdate = true;
      mesh.material = mat;
    });
    return root;
  }, [scene, base, normal, mr]);
}

export function PhoneModel({
  screenTexture,
  finish = "graphite",
  fit = DEFAULT_FIT,
  flattenZ = 1,
}: {
  screenTexture: string;
  finish?: Finish;
  fit?: PhoneFit;
  /** The mesh measures ~22% thicker than a real body-plus-bump. */
  flattenZ?: number;
}) {
  const { size, centre, frontZ } = usePhoneGeometry();
  const body = useChassis(finish);
  const map = useLoader(THREE.TextureLoader, screenTexture);

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

useGLTF.preload(GEOMETRY);
