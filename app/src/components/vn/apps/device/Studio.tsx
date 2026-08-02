import { useMemo } from "react";
import * as THREE from "three";
import { Environment, Lightformer } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";

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

export type StudioVariant = "day" | "dusk" | "noir" | "aurora" | "gallery";

/**
 * ── The look experiments ──────────────────────────────────────────────────
 *
 * Everything from here to StudioLighting is ADDITIVE. "dusk" is untouched and
 * remains the default; delete these three functions, the extra members of
 * StudioVariant, and the `data-hero-look` CSS block to return exactly to where
 * the hero was.
 *
 * One observation drives all three. The dusk rig lights from below and from
 * nowhere else, which is a coherent story but leaves every device with the same
 * problem: no edge. A silhouette against a dark background with no rim reads as
 * a flat cut-out no matter how good the material is. So each of these adds a
 * rim — the single cheapest thing that makes a render look photographed rather
 * than rendered — and then differs in how it colours the two ends.
 *
 * The screens are unlit (meshBasicMaterial, toneMapped off), so they hold their
 * brightness whatever happens around them. The darker the rig, the more the
 * screens carry the frame, which is the point: the app is the product.
 */

/**
 * "noir" — near-black room, one tight warm pool underneath, hard cool and warm
 * kickers behind.
 *
 * The most dramatic of the three. Narrow vertical strips in the environment
 * rather than broad panels, because a mirror reflects a shape: wide softboxes
 * smear into an even sheen, thin strips streak down the chassis as it turns.
 */
function NoirLighting() {
  return (
    <>
      {/* The floor pool. Tighter and harder than dusk's, so falloff is steep
          and a device genuinely darkens as it rides up the orbit. */}
      <pointLight position={[0, -14, 13]} intensity={4200} decay={2} color="#ffe3ba" />
      {/* Cool rim, behind and left. This is the edge that dusk never had. */}
      <pointLight position={[-17, 5, -16]} intensity={5600} decay={2} color="#a9c8ff" />
      {/* Warm kicker, behind and right — the opposite temperature, so the two
          edges of a device are never the same colour. */}
      <pointLight position={[16, -3, -15]} intensity={3400} decay={2} color="#ffb377" />
      <ambientLight intensity={0.015} />

      <Environment resolution={ENV_RES} frames={1}>
        <GradientDome top="#04060b" bottom="#e9d9be" />
        <Lightformer
          form="rect"
          intensity={4}
          color="#fff1dc"
          position={[0, -9, 0]}
          scale={[14, 4, 1]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={8}
          color="#cfe0ff"
          position={[-14, 2, -9]}
          scale={[1.1, 18, 1]}
          rotation={[0, Math.PI / 3, 0]}
        />
        <Lightformer
          form="rect"
          intensity={6}
          color="#ffcb96"
          position={[14, 0, -9]}
          scale={[1.1, 18, 1]}
          rotation={[0, -Math.PI / 3, 0]}
        />
      </Environment>
    </>
  );
}

/**
 * "aurora" — the brand's own teal as the sky, cream as the floor.
 *
 * The most on-brand of the three: it is the site's palette turned into light
 * rather than a film convention borrowed wholesale. Teal rim above and behind,
 * warm cream from the floor, so a device is cool along its top edge and warm
 * underneath — the same two colours the page itself runs between.
 */
function AuroraLighting() {
  return (
    <>
      {/* Cooled down from the first cut, which read as glary. Measured rather
          than eyeballed: it was never brighter than the rig it replaced — mean
          luminance 0.520 against dusk's 0.560 — but it CLIPPED more, 5.90% of
          the frame blown against 5.51%, and clipping is what the eye calls
          glare. So the wash came down and the rim stayed up: contrast is what
          makes the devices prominent, and prominence was the part worth
          keeping. The teal was pulled toward the brand's own #1b6b6b as well;
          the first pass sat nearer aquamarine, which is vivid rather than
          expensive. */}
      <pointLight position={[0, -13, 13]} intensity={2900} decay={2} color="#ffeed6" />
      {/* Teal rim, high and behind. Brand colour doing structural work, and the
          one light deliberately left near full strength. */}
      <pointLight position={[-9, 12, -15]} intensity={4600} decay={2} color="#3fb3a6" />
      <pointLight position={[13, 2, -13]} intensity={2100} decay={2} color="#2a857f" />
      <ambientLight intensity={0.02} />

      <Environment resolution={ENV_RES} frames={1}>
        <GradientDome top="#04161b" bottom="#f7ecd6" />
        <Lightformer
          form="rect"
          intensity={2.9}
          color="#fdf0de"
          position={[0, -8, 0]}
          scale={[16, 5, 1]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        {/* A wide teal band across the top of the dome: the aurora itself, and
            what a device mirrors along its upper edge. */}
        <Lightformer
          form="rect"
          intensity={3.6}
          color="#45b8ab"
          position={[0, 11, -6]}
          scale={[20, 2.5, 1]}
          rotation={[-Math.PI / 2.6, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={3}
          color="#52bfb2"
          position={[-12, 4, -8]}
          scale={[1.4, 14, 1]}
          rotation={[0, Math.PI / 3.2, 0]}
        />
      </Environment>
    </>
  );
}

/**
 * "gallery" — high key, the opposite bet.
 *
 * Bright, soft and even, the way a product page photographs hardware. Included
 * deliberately as the counter-argument to the other two: drama is not the only
 * way to look expensive, and restraint is closer to the rest of this site than
 * a noir rig is. Needs the page and the hero copy to invert with it — see the
 * `gallery` block in the CSS — because cream text on a pale hero is unreadable.
 */
function GalleryLighting() {
  return (
    <>
      <directionalLight position={[5, 9, 11]} intensity={1.9} color="#fffaf2" />
      <directionalLight position={[-8, 3, 6]} intensity={0.8} color="#e4edff" />
      {/* Still a rim, even here. It is what keeps a pale device from dissolving
          into a pale background. */}
      <pointLight position={[0, 6, -14]} intensity={2600} decay={2} color="#ffffff" />
      <ambientLight intensity={0.32} />

      <Environment resolution={ENV_RES} frames={1}>
        <GradientDome top="#c8d2dc" bottom="#fffaf0" />
        <Lightformer
          form="rect"
          intensity={5}
          position={[0, 8, 5]}
          scale={[18, 8, 1]}
          rotation={[-Math.PI / 3, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={2.4}
          color="#e8f0ff"
          position={[-9, 1, 5]}
          scale={[6, 13, 1]}
          rotation={[0, Math.PI / 3.4, 0]}
        />
        <Lightformer
          form="rect"
          intensity={2.4}
          color="#fff0da"
          position={[9, 0, 5]}
          scale={[6, 13, 1]}
          rotation={[0, -Math.PI / 3.4, 0]}
        />
        <Lightformer
          form="rect"
          intensity={2}
          position={[0, -7, 4]}
          scale={[14, 5, 1]}
          rotation={[Math.PI / 3, 0, 0]}
        />
      </Environment>
    </>
  );
}

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
        <Lightformer
          form="rect"
          intensity={6}
          position={[-8, 3, 2]}
          scale={[3, 6, 1]}
          rotation={[0, Math.PI / 3, 0]}
          color="#eaf2ff"
        />
        <Lightformer
          form="rect"
          intensity={5}
          position={[-8, 2, -4]}
          scale={[3, 6, 1]}
          rotation={[0, Math.PI / 2.6, 0]}
          color="#dfeaff"
        />
        {/* ...one warm window right, a ceiling panel, and a floor bounce. */}
        <Lightformer
          form="rect"
          intensity={4}
          position={[7, 4, 3]}
          scale={[2.5, 5, 1]}
          rotation={[0, -Math.PI / 3, 0]}
          color="#ffe2b8"
        />
        <Lightformer
          form="rect"
          intensity={5}
          position={[0, 7, 2]}
          scale={[9, 1.5, 1]}
          rotation={[-Math.PI / 2.2, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={2}
          position={[0, -6, 4]}
          scale={[10, 4, 1]}
          rotation={[Math.PI / 2.5, 0, 0]}
          color="#d8cbb8"
        />
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

/**
 * Bloom, for the dark rigs only.
 *
 * The screens are unlit — meshBasicMaterial with tone mapping off — so they
 * hold full brightness while a dark rig pulls everything around them down.
 * That is exactly the condition bloom exists for: the threshold sits above
 * anything the chassis reflects and below the screens, so the app faces glow
 * and the aluminium does not. It is the one effect here that makes the frame
 * look photographed rather than rendered.
 *
 * `mipmapBlur` because the alternative at this radius is a visible ring around
 * every bright edge. No vignette: the page gradient already darkens the corners
 * and a second one over a transparent canvas would darken the PAGE, not the
 * render.
 */
function HeroBloom() {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {/* Held down deliberately. Bloom is the only thing here that CLIPS —
          it adds light to pixels that are already the brightest in frame — and
          clipping is what reads as glare. At 0.32 it put more of the frame over
          0.95 than the un-bloomed rig it replaced. This is enough to catch a
          specular edge and not enough to halo. */}
      <Bloom
        intensity={0.16}
        luminanceThreshold={0.93}
        luminanceSmoothing={0.14}
        mipmapBlur
        radius={0.38}
      />
    </EffectComposer>
  );
}

export function StudioLighting({ variant = "day" }: { variant?: StudioVariant }) {
  if (variant === "dusk") return <DuskLighting />;
  if (variant === "noir")
    return (
      <>
        <NoirLighting />
        <HeroBloom />
      </>
    );
  if (variant === "aurora")
    return (
      <>
        <AuroraLighting />
        <HeroBloom />
      </>
    );
  if (variant === "gallery") return <GalleryLighting />;
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
