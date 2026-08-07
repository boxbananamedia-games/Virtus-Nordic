/**
 * Whether this browser can actually run the orbit. Checked before mounting so
 * a failure falls back to the CSS field instead of an empty canvas.
 *
 * Deliberately its own module, not part of HeroOrbit.tsx. The homepage has to
 * ask this question on every visit, and importing the answer from HeroOrbit
 * would pull three.js, drei, the postprocessing chain and — through
 * PhoneModel's module-scope `useGLTF.preload` — 3.7MB of GLB and plates into
 * the homepage's eager graph, on phones that will never mount a canvas. The
 * probe is a few lines; the thing it guards is a megabyte of JavaScript, so the
 * two must not share a module.
 */
export function canRunOrbit() {
  if (typeof window === "undefined") return false;
  // A phone cannot show a five-device orbit usefully, and hover-less pointers
  // have no way to reach the reveal — the CSS rail is the better answer there.
  if (!window.matchMedia("(hover: hover) and (min-width: 768px)").matches) return false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? (canvas.getContext("webgl") as WebGLRenderingContext | null);
    if (!gl) return false;
    // Hand the context back rather than letting it fall out of scope. Browsers
    // cap live WebGL contexts (~16 in Chrome) and drop the oldest when the cap
    // is hit — so a probe that leaks one per client-side return to `/` can end
    // up evicting the hero's own context.
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}
