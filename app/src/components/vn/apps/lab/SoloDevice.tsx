import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { EffectComposer, Bloom, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import { PhoneModel, type Finish } from "../device/PhoneModel";
import { StudioLighting, RoomLighting } from "../device/Studio";

/**
 * One device, one angle, under a selectable rig — the bench where material
 * questions get answered by comparison rather than argument.
 *
 * Grown into a variant matrix for the Meshy-reference chase. The reference
 * viewer's recipe is: maps untouched, indoor HDRI at 1.25, strong bloom. Every
 * axis of that recipe is a knob here so its contribution can be isolated:
 *
 *   env     day | dusk           the site rigs
 *           room                 procedural indoor stand-in, zero download
 *           studio-hdr           real photo-studio HDRI (CC0, self-hosted)
 *           room-hdr             real indoor HDRI (CC0, self-hosted)
 *   metal / envi / texset        material policy: tuned vs maps-as-authored
 *   bloom / tone                 the post chain
 *
 * The HDRIs are same-origin files, so the CSP stays untouched.
 */
export type SoloEnv = "day" | "dusk" | "room" | "studio-hdr" | "room-hdr";

const HDRI: Record<string, string> = {
  "studio-hdr": "/lab-models/hdri/studio.hdr",
  "room-hdr": "/lab-models/hdri/room.hdr",
};

export function SoloDevice({
  finish,
  yaw = 0,
  envIntensity,
  env = "day",
  bloom = 0,
  tone = "aces",
  screen = "/lab-textures/guf-kugler.webp",
}: {
  finish: Finish;
  yaw?: number;
  envIntensity?: number;
  env?: SoloEnv;
  bloom?: number;
  tone?: "aces" | "agx";
  screen?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="ol-stage" />;

  const hdri = HDRI[env];

  return (
    <div className="ol-stage" data-solo="true">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 3.1], fov: 30, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        onCreated={({ gl }) => {
          // Only authoritative when the composer is off; with bloom on, the
          // composer's own ToneMapping pass owns the transform instead.
          gl.toneMapping =
            tone === "agx" ? THREE.AgXToneMapping : THREE.ACESFilmicToneMapping;
        }}
      >
        <Suspense fallback={null}>
          {hdri ? (
            // HDRI-only, like the Meshy viewer: no analytic lights on top, the
            // image IS the lighting. MUST live inside the Suspense boundary —
            // Environment suspends while the .hdr decodes, and suspending with
            // no boundary above it takes down the whole route to a white page.
            <Environment files={hdri} />
          ) : env === "room" ? (
            <RoomLighting />
          ) : (
            // By here env can only be "day" | "dusk" at runtime, but the HDRI
            // record lookup above is not a type guard, so narrow explicitly.
            <StudioLighting variant={env === "dusk" ? "dusk" : "day"} />
          )}
          <group rotation={[0, (yaw * Math.PI) / 180, 0]}>
            <PhoneModel
              screenTexture={screen}
              finish={finish}
              envIntensity={envIntensity}
              flattenZ={0.82}
            />
          </group>
        </Suspense>

        {bloom > 0 && (
          <EffectComposer multisampling={4}>
            {/* Threshold below the tone-map shoulder, so speculars that survive
                ACES/AgX still seed the glow — the Meshy look's halo. */}
            <Bloom intensity={bloom} luminanceThreshold={0.85} mipmapBlur />
            <ToneMapping
              mode={tone === "agx" ? ToneMappingMode.AGX : ToneMappingMode.ACES_FILMIC}
            />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
