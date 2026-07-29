import { useMemo } from "react";
import * as THREE from "three";
import { Environment, Lightformer } from "@react-three/drei";

/**
 * The studio environment, shared by the orbit and the solo inspection view so
 * that judging a finish in isolation tells you something true about how it will
 * look in the carousel.
 *
 * A metal has no diffuse term — it renders only what it reflects — so any
 * direction of the environment that is black makes the device black. An earlier
 * version was three small emitters in an otherwise empty cubemap, which is most
 * directions, and the phones came out as black slabs. The enclosing dome is
 * what guarantees every reflection angle returns something; the panels on top
 * of it do the actual shaping.
 */

/** Cubemap resolution. Free at runtime because the environment renders exactly
 *  once — see `frames={1}`, which is load-bearing: without it drei re-renders
 *  all six faces every frame, costing 12.1ms/frame against 3.3ms. Measured at
 *  128/256/512 with frames pinned and all three are identical, so this is set
 *  for quality, not cost. */
const ENV_RES = 512;

/**
 * A dome whose colour runs from a luminous floor to a dark sky.
 *
 * This is the whole premise of the "dusk" look: the page background is a
 * bottom-lit gradient, and the environment cubemap must tell the SAME story or
 * the reflections contradict the page. Vertex colours on a BackSide sphere are
 * the cheapest way to get a smooth gradient into the cubemap — no shader, no
 * canvas texture, nothing to fetch.
 */
export function GradientDome({ top, bottom }: { top: string; bottom: string }) {
  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(1, 48, 32);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    // Vertex colours are read as linear; the hexes are authored in sRGB.
    const cTop = new THREE.Color(top).convertSRGBToLinear();
    const cBottom = new THREE.Color(bottom).convertSRGBToLinear();
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const t = (pos.getY(i) + 1) / 2; // 0 at the floor, 1 at the zenith
      // Exponent < 1 snaps the mix toward the dark sky quickly, so the bright
      // pool stays tight at the floor. A broad pool (first attempt used 1.6)
      // turns into omnidirectional fill that lights the devices evenly from
      // everywhere — exactly the flat-clay look this rig must avoid.
      c.copy(cBottom).lerp(cTop, Math.pow(t, 0.5));
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [top, bottom]);

  return (
    <mesh scale={60} geometry={geometry}>
      <meshBasicMaterial vertexColors side={THREE.BackSide} />
    </mesh>
  );
}

export type StudioVariant = "day" | "dusk";

/**
 * "dusk" — the page's bottom edge is the light source, and nothing else is.
 *
 * One directional from below for the hard term, a point light low in the scene
 * so devices genuinely brighten as their orbit carries them down toward the
 * floor (a directional alone has no falloff and would flatten that), and a
 * floor-glow Lightformer inside the gradient dome for the reflections. Ambient
 * is deliberately near zero: the user asked for a single light source, and the
 * dark upper halves against the dark page top are the point of the look, not a
 * defect. Screens are unlit materials, so legibility survives regardless.
 */
function DuskLighting() {
  return (
    <>
      {/* Whisper of fill from under-front. Deliberately faint: a directional
          has no falloff, so any real strength here lights the highest phone as
          much as the lowest and the "floor is the light" story collapses —
          copper riding the top of the orbit was the brightest thing in frame
          until this came down. */}
      <directionalLight position={[0, -6, 10]} intensity={0.55} color="#ffe9cf" />
      {/* The one light that can put a GRADIENT across a device. An env map
          cannot: a flat back has one normal, so the env resolves to a single
          uniform value across it. Only falloff varies with position, so this
          carries the whole bright-below/dark-above story — sized against the
          ~22-unit orbit radius (intensity is divided by distance²). */}
      <pointLight position={[0, -13, 12]} intensity={3800} decay={2} color="#ffedd6" />
      <ambientLight intensity={0.03} />

      <Environment resolution={ENV_RES} frames={1}>
        <GradientDome top="#141b25" bottom="#fff3dc" />
        {/* The floor glow the metal mirrors. Kept modest on purpose: at 8 its
            hemisphere-integrated irradiance swamped the analytic lights and
            flattened every body into clay — measured, not guessed: three rig
            rewrites produced near-identical renders until this came down. */}
        <Lightformer
          form="rect"
          intensity={3.5}
          color="#fff4e2"
          position={[0, -8, 0]}
          scale={[18, 6, 1]}
          rotation={[Math.PI / 2, 0, 0]}
        />
      </Environment>
    </>
  );
}

/**
 * "room" — a procedural stand-in for an indoor HDRI, built for the Meshy-look
 * matrix. Metal is a mirror of its world: the flat gradient dome gives it
 * nothing to reflect, which is a large part of why the finishes read as clay.
 * This rig fakes what a real room HDRI has — windows at different angles and
 * temperatures, a bright ceiling, a warm floor bounce, and hard dark breaks
 * between them so reflections streak instead of smearing. Zero bytes
 * downloaded; the real-HDRI variants are its benchmark.
 */
export function RoomLighting() {
  return (
    <>
      <directionalLight position={[5, 7, 8]} intensity={1.1} />
      <Environment resolution={ENV_RES} frames={1}>
        <GradientDome top="#33383f" bottom="#57534b" />
        {/* Two cool windows on the left, staggered in angle... */}
        <Lightformer form="rect" intensity={6} position={[-8, 3, 2]} scale={[3, 6, 1]} rotation={[0, Math.PI / 3, 0]} color="#eaf2ff" />
        <Lightformer form="rect" intensity={5} position={[-8, 2, -4]} scale={[3, 6, 1]} rotation={[0, Math.PI / 2.6, 0]} color="#dfeaff" />
        {/* ...one warm window right, a ceiling panel, and a floor bounce. */}
        <Lightformer form="rect" intensity={4} position={[7, 4, 3]} scale={[2.5, 5, 1]} rotation={[0, -Math.PI / 3, 0]} color="#ffe2b8" />
        <Lightformer form="rect" intensity={5} position={[0, 7, 2]} scale={[9, 1.5, 1]} rotation={[-Math.PI / 2.2, 0, 0]} />
        <Lightformer form="rect" intensity={2} position={[0, -6, 4]} scale={[10, 4, 1]} rotation={[Math.PI / 2.5, 0, 0]} color="#d8cbb8" />
        {/* Hard dark breaks: what turns "brighter here" into visible streaks. */}
        <mesh position={[-4, 0, 6]} rotation={[0, Math.PI / 6, 0]}>
          <planeGeometry args={[2, 12]} />
          <meshBasicMaterial color="#0b0d10" />
        </mesh>
        <mesh position={[5, 1, -6]} rotation={[0, -Math.PI / 4, 0]}>
          <planeGeometry args={[1.5, 12]} />
          <meshBasicMaterial color="#0b0d10" />
        </mesh>
      </Environment>
    </>
  );
}

export function StudioLighting({ variant = "day" }: { variant?: StudioVariant }) {
  if (variant === "dusk") return <DuskLighting />;
  return (
    <>
      {/* Positioned key, so a specular hotspot travels across the chassis as it
          turns rather than the whole surface just changing brightness. */}
      <directionalLight position={[6, 8, 10]} intensity={2.2} />
      <directionalLight position={[-8, 2, 4]} intensity={0.7} color="#cfe0ff" />
      <ambientLight intensity={0.25} />

      <Environment resolution={ENV_RES} frames={1}>
        {/* The room. BackSide because we are inside it. */}
        <mesh scale={60}>
          <sphereGeometry args={[1, 32, 24]} />
          <meshBasicMaterial color="#5b6270" side={THREE.BackSide} />
        </mesh>
        {/* Key softbox, high and slightly forward. */}
        <Lightformer
          form="rect"
          intensity={5}
          position={[0, 6, 4]}
          scale={[14, 7, 1]}
          rotation={[-Math.PI / 3.2, 0, 0]}
        />
        {/* Cool and warm fills, angled inward so the frame picks up a gradient
            along its length instead of one flat tone. */}
        <Lightformer
          form="rect"
          intensity={2.6}
          position={[-7, 1, 4]}
          scale={[6, 11, 1]}
          rotation={[0, Math.PI / 3.5, 0]}
          color="#dbe7ff"
        />
        <Lightformer
          form="rect"
          intensity={2.6}
          position={[7, 0, 4]}
          scale={[6, 11, 1]}
          rotation={[0, -Math.PI / 3.5, 0]}
          color="#ffe6cc"
        />
        {/* Bounce from below, so the underside is not a void. */}
        <Lightformer
          form="rect"
          intensity={1.4}
          position={[0, -6, 3]}
          scale={[12, 5, 1]}
          rotation={[Math.PI / 3, 0, 0]}
        />
        {/* Rim from behind: separates the silhouette and puts a bright edge on
            devices showing their backs. */}
        <Lightformer form="rect" intensity={2.2} position={[0, 2, -10]} scale={[14, 10, 1]} />
      </Environment>
    </>
  );
}
