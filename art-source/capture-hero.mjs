/**
 * Records the hero and lays the frames out as a contact sheet.
 *
 * The Browser pane this project is developed against does not composite, so
 * requestAnimationFrame never fires in it and the orbit cannot be watched —
 * every animation change so far has been reasoned about numerically and then
 * handed over for someone else to look at. Headless Chrome does composite, and
 * with the ANGLE flags below it runs WebGL properly, so it can watch the thing
 * for us.
 *
 * Usage (dev server must be running):
 *   node art-source/capture-hero.mjs [url] [seconds] [label]
 *
 * Writes art-source/capture/<label>.webp — one image, frames tiled in reading
 * order with the time since the ring appeared burnt into each.
 */
import puppeteer from "puppeteer-core";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const URL_ARG = process.argv[2] ?? "http://localhost:5173/";
const SECONDS = Number(process.argv[3] ?? 4);
const LABEL = process.argv[4] ?? "hero";
const OUT = path.resolve("art-source/capture");

/** 1600x912 is aspect 1.75 — the same shape the orbit's framing was derived
 *  against, so what is captured is what the numbers describe. */
const VIEW = { width: 1600, height: 912 };
/** Columns in the contact sheet. */
const COLS = 5;

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: [
    "--use-angle=d3d11",
    "--enable-gpu",
    "--ignore-gpu-blocklist",
    "--enable-unsafe-webgpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
  ],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ ...VIEW, deviceScaleFactor: 1 });

  // Mark the instant the ring starts running. The controls are positioned by
  // the render loop, so the first one to get a width is the first frame after
  // Ring mounted — which is exactly when the entrance clock starts.
  await page.evaluateOnNewDocument(() => {
    window.__ringAt = null;
    const tick = () => {
      const b = document.querySelector(".vn-orbit-hit");
      if (b && b.getBoundingClientRect().width > 0) {
        window.__ringAt = performance.now();
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  // First load warms the HTTP cache so the reload we actually record is not
  // dominated by asset download.
  await page.goto(URL_ARG, { waitUntil: "networkidle0" });
  const ready = await page.evaluate(() => ({
    orbit: document.querySelector(".vn-hero-devices")?.dataset.orbit,
    canvas: !!document.querySelector(".vn-orbit canvas"),
    webgl: (() => {
      try {
        return !!document.createElement("canvas").getContext("webgl2");
      } catch {
        return false;
      }
    })(),
  }));
  if (!ready.webgl || ready.orbit !== "true") {
    throw new Error(
      `orbit is not running in this browser — ${JSON.stringify(ready)}. ` +
        `Without WebGL the page falls back to the CSS field and there is nothing to record.`,
    );
  }

  await page.reload({ waitUntil: "domcontentloaded" });
  // Wait for the ring, then start grabbing frames immediately.
  await page.waitForFunction(() => window.__ringAt !== null, { timeout: 30000 });
  const ringAt = await page.evaluate(() => window.__ringAt);

  const shots = [];
  const deadline = Date.now() + SECONDS * 1000;
  while (Date.now() < deadline) {
    const buf = await page.screenshot({ type: "jpeg", quality: 88, encoding: "base64" });
    const at = await page.evaluate((r) => performance.now() - r, ringAt);
    shots.push({ at, b64: buf });
  }
  console.log(`captured ${shots.length} frames over ${SECONDS}s (~${(shots.length / SECONDS).toFixed(0)} fps)`);

  // Tile them. Done in the page because it already has a fast image pipeline,
  // and it keeps this script free of any image dependency.
  const sheet = await page.evaluate(
    async (shots, cols, view) => {
      const cellW = 400;
      const cellH = Math.round((cellW * view.height) / view.width);
      const rows = Math.ceil(shots.length / cols);
      const c = new OffscreenCanvas(cellW * cols, cellH * rows);
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#111";
      ctx.fillRect(0, 0, c.width, c.height);
      for (let i = 0; i < shots.length; i++) {
        const bin = atob(shots[i].b64);
        const arr = new Uint8Array(bin.length);
        for (let j = 0; j < bin.length; j++) arr[j] = bin.charCodeAt(j);
        const bmp = await createImageBitmap(new Blob([arr], { type: "image/jpeg" }));
        const x = (i % cols) * cellW;
        const y = Math.floor(i / cols) * cellH;
        ctx.drawImage(bmp, x, y, cellW, cellH);
        bmp.close();
        ctx.font = "bold 22px monospace";
        ctx.fillStyle = "rgba(0,0,0,0.75)";
        ctx.fillRect(x + 4, y + 4, 108, 30);
        ctx.fillStyle = "#7CFF9B";
        ctx.fillText(`${(shots[i].at / 1000).toFixed(2)}s`, x + 10, y + 26);
        ctx.strokeStyle = "rgba(255,255,255,0.25)";
        ctx.strokeRect(x, y, cellW, cellH);
      }
      const blob = await c.convertToBlob({ type: "image/webp", quality: 0.85 });
      const bytes = new Uint8Array(await blob.arrayBuffer());
      let s = "";
      const CH = 0x8000;
      for (let i = 0; i < bytes.length; i += CH) s += String.fromCharCode(...bytes.subarray(i, i + CH));
      return { b64: btoa(s), w: c.width, h: c.height };
    },
    shots,
    COLS,
    VIEW,
  );

  await mkdir(OUT, { recursive: true });
  const file = path.join(OUT, `${LABEL}.webp`);
  await writeFile(file, Buffer.from(sheet.b64, "base64"));
  console.log(`${file}  ${sheet.w}x${sheet.h}`);
} finally {
  await browser.close();
}
