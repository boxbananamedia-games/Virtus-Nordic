/**
 * Shoots the hero under every lighting rig and lays them out for comparison.
 *
 * The looks differ in how metal reflects an environment, which is not something
 * that can be judged from the numbers in Studio.tsx — it has to be seen, and
 * the review pane this project is developed against does not composite. So:
 * headless Chrome, one frame per look, taken at the same moment of the same
 * animation so the only variable is the light.
 *
 * Usage:  node art-source/compare-looks.mjs [url] [settleSeconds] [label]
 */
import puppeteer from "puppeteer-core";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = process.argv[2] ?? "http://localhost:5173/";
/** Seconds to let the entrance run before the shot. Past the boarding and most
 *  of the spin-down, so the ring is composed rather than blurred. */
const SETTLE = Number(process.argv[3] ?? 9);
const LABEL = process.argv[4] ?? "looks";
const LOOKS = ["dusk", "noir", "aurora", "gallery"];
const VIEW = { width: 1500, height: 860 };
const OUT = path.resolve("art-source/capture");

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: [
    "--use-angle=d3d11",
    "--enable-gpu",
    "--ignore-gpu-blocklist",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
  ],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ ...VIEW, deviceScaleFactor: 1 });
  const shots = [];

  for (const look of LOOKS) {
    const url = look === "dusk" ? BASE : `${BASE}?look=${look}`;
    await page.goto(url, { waitUntil: "networkidle0" });
    // Confirm the rig actually engaged rather than silently falling back.
    const state = await page.evaluate(() => ({
      orbit: document.querySelector(".vn-hero-devices")?.dataset.orbit,
      look: document.documentElement.dataset.heroLook,
    }));
    if (state.orbit !== "true") throw new Error(`${look}: orbit not running (${state.orbit})`);
    await new Promise((r) => setTimeout(r, SETTLE * 1000));
    shots.push({ look, applied: state.look ?? "dusk", data: await page.screenshot({ type: "jpeg", quality: 92, encoding: "base64" }) });
    console.log(`${look.padEnd(8)} shot (page reports data-hero-look="${state.look ?? "(none)"}")`);
  }

  const sheet = await page.evaluate(
    async (shots, view) => {
      const W = 750;
      const H = Math.round((W * view.height) / view.width);
      const c = new OffscreenCanvas(W * 2, H * 2);
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, c.width, c.height);
      for (let i = 0; i < shots.length; i++) {
        const bin = atob(shots[i].data);
        const a = new Uint8Array(bin.length);
        for (let j = 0; j < bin.length; j++) a[j] = bin.charCodeAt(j);
        const bmp = await createImageBitmap(new Blob([a], { type: "image/jpeg" }));
        const x = (i % 2) * W;
        const y = Math.floor(i / 2) * H;
        ctx.drawImage(bmp, x, y, W, H);
        bmp.close();
        ctx.font = "bold 26px monospace";
        ctx.fillStyle = "rgba(0,0,0,0.8)";
        ctx.fillRect(x + 6, y + 6, 22 + shots[i].look.length * 16, 36);
        ctx.fillStyle = "#7CFF9B";
        ctx.fillText(shots[i].look, x + 16, y + 32);
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.strokeRect(x, y, W, H);
      }
      const blob = await c.convertToBlob({ type: "image/webp", quality: 0.9 });
      const bytes = new Uint8Array(await blob.arrayBuffer());
      let s = "";
      const CH = 0x8000;
      for (let i = 0; i < bytes.length; i += CH) s += String.fromCharCode(...bytes.subarray(i, i + CH));
      return { b64: btoa(s), w: c.width, h: c.height };
    },
    shots,
    VIEW,
  );

  await mkdir(OUT, { recursive: true });
  const file = path.join(OUT, `${LABEL}.webp`);
  await writeFile(file, Buffer.from(sheet.b64, "base64"));
  console.log(`${file}  ${sheet.w}x${sheet.h}`);
} finally {
  await browser.close();
}
