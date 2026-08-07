/**
 * The orbit's assets, and a snippet that starts fetching them during parse.
 *
 * The hero's five devices cannot appear until 3.6MB of GLB and their screen
 * plates have arrived, and nothing was asking for them until React had
 * hydrated, run a layout effect to decide the browser could handle WebGL, and
 * pulled down the lazy chunk. Three serial waits before the first byte of the
 * thing the visitor is actually looking at.
 *
 * This runs inline, during HTML parse — before the main bundle has even
 * executed — and applies exactly the same test the real gate does, so a phone
 * still downloads none of it. By the time the chunk evaluates and asks for a
 * model, the request is already in flight or already answered.
 *
 * It warms with `fetch` rather than `<link rel=preload as=fetch>` on purpose:
 * preload only dedupes when the credentials mode matches what the eventual
 * loader uses, and three.js's FileLoader defaults to same-origin credentials.
 * A plain same-origin fetch matches it exactly, so the loader gets a cache hit
 * instead of a second download.
 */

const MODELS = [
  "/lab-models/opt/graphite.glb",
  "/lab-models/opt/copper.glb",
  "/lab-models/opt/silver.glb",
  "/lab-models/opt/green.glb",
  "/lab-models/opt/navy.glb",
];

const PLATES = [
  "/lab-textures/guf-kugler.webp",
  "/lab-textures/barber-club.webp",
  "/lab-textures/aalborgbox.webp",
  "/lab-textures/el-service.webp",
  "/lab-textures/fysioterapi.webp",
];

/**
 * Inline script source. Kept deliberately small and dependency-free — it has
 * to be cheap enough to sit in the document without delaying anything itself.
 *
 * The plates go through `Image` rather than `fetch` because that is what
 * three.js's TextureLoader uses, and warming a different cache entry would
 * gain nothing.
 */
export const ORBIT_WARM_SCRIPT = [
  "(function(){try{",
  // Same gate as canRunOrbit: wide, hover-capable, and WebGL actually works.
  'if(!matchMedia("(hover: hover) and (min-width: 768px)").matches)return;',
  'var c=document.createElement("canvas");',
  'var gl=c.getContext("webgl2")||c.getContext("webgl");',
  "if(!gl)return;",
  // Hand the probe context straight back — browsers cap live contexts and the
  // hero needs one of its own.
  'var lc=gl.getExtension("WEBGL_lose_context");if(lc)lc.loseContext();',
  `var m=${JSON.stringify(MODELS)};`,
  `var p=${JSON.stringify(PLATES)};`,
  "for(var i=0;i<m.length;i++)fetch(m[i]).catch(function(){});",
  "for(var j=0;j<p.length;j++){var im=new Image();im.src=p[j];}",
  "}catch(e){}})();",
].join("");
