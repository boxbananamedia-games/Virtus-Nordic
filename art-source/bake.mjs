/**
 * Bakes each concept's screen to a texture plate.
 *
 * This IS Branch B's best case for screen fidelity: a static, pre-rendered
 * plate at iPhone-native resolution. Anything live (DOM rasterised per frame)
 * is slower and more fragile, so if the baked plate does not hold up against
 * Branch A's live DOM at hero size, nothing in WebGL will.
 *
 * DSF 3 gives 1170x2532 — the actual pixel resolution of the device being
 * imitated, and the number that drives the VRAM figure in the gate report.
 *
 * Output is WebP, not PNG. As PNG these five plates were 4.6 MB and the single
 * heaviest thing the hero waited on; at WebP q0.72 they are 0.22 MB for a mean
 * absolute error under 1.2/255 — invisible before you even account for the
 * texture being minified onto a screen about 450px tall. If you ever need to
 * re-measure that trade, art-source/to-webp.mjs sweeps quality and reports the
 * error rather than asking you to judge it by eye.
 */
import puppeteer from "puppeteer-core";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUT = path.resolve(
  "D:/Alex/VirtusNordic/Virtus-Nordic/app/public/lab-textures",
);
const IDS = ["guf-kugler", "barber-club", "aalborgbox", "el-service", "fysioterapi"];
const DSF = 3;

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--hide-scrollbars"],
});

try {
  await mkdir(OUT, { recursive: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: DSF });

  let total = 0;
  for (const id of IDS) {
    await page.goto(`http://localhost:5173/lab/orbit?screen=${id}`, {
      waitUntil: "networkidle0",
    });
    await page.evaluate(() => document.fonts.ready);

    // Isolate the plate. The route renders inside the site's root layout, whose
    // header and footer sit in their own stacking contexts and paint over a
    // z-indexed child regardless of how high the value is. Reparenting the
    // plate to <body> and dropping everything else is the reliable way to get a
    // texture with only the app screen in it.
    await page.evaluate(() => {
      const plate = document.getElementById("ol-screen-plate");
      if (!plate) return;
      document.body.replaceChildren(plate);
      Object.assign(plate.style, { position: "static", top: "auto", left: "auto" });
      Object.assign(document.body.style, { margin: "0", padding: "0", background: "#fff" });
    });
    await new Promise((r) => setTimeout(r, 300));
    const plate = await page.$("#ol-screen-plate");
    if (!plate) throw new Error(`no plate rendered for ${id}`);
    const file = path.join(OUT, `${id}.webp`);
    await plate.screenshot({ path: file, type: "webp", quality: 72 });
    const { size } = await stat(file);
    total += size;
    console.log(`${id.padEnd(14)} ${(size / 1024).toFixed(0)} KB  ${390 * DSF}x${844 * DSF}`);
  }
  const px = 390 * DSF * 844 * DSF;
  console.log(`\ntotal webp on disk: ${(total / 1024 / 1024).toFixed(2)} MB`);
  console.log(
    `VRAM as RGBA8     : ${((px * 4 * IDS.length) / 1024 / 1024).toFixed(0)} MB ` +
      `(${((px * 4 * 1.33 * IDS.length) / 1024 / 1024).toFixed(0)} MB with mipmaps)`,
  );
} finally {
  await browser.close();
}
