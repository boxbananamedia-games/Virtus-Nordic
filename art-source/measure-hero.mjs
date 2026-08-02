/**
 * Measures how bright the hero actually is, per look.
 *
 * "Too bright" is a real, measurable property and not one worth arguing about
 * by eye: mean luminance says how washed the frame is overall, and the share of
 * near-blown pixels says whether highlights are clipping — which is what
 * usually reads as glare. Splitting the frame into the copy's band and the
 * devices' band matters too, because the fix for a hot floor pool is the
 * opposite of the fix for a hot rim.
 *
 * Usage:  node art-source/measure-hero.mjs [url] [settleSeconds] [looks...]
 */
import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = process.argv[2] ?? "http://localhost:5173/";
const SETTLE = Number(process.argv[3] ?? 9);
const LOOKS = process.argv.slice(4).length ? process.argv.slice(4) : ["aurora", "dusk", "noir"];
const VIEW = { width: 1500, height: 860 };

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--hide-scrollbars", "--force-device-scale-factor=1"],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ ...VIEW, deviceScaleFactor: 1 });

  console.log("look      mean   upper   lower   blown>0.95   hot>0.85");
  console.log("--------------------------------------------------------");

  for (const look of LOOKS) {
    await page.goto(`${BASE}?look=${look}`, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, SETTLE * 1000));
    const shot = await page.screenshot({ type: "png", encoding: "base64" });

    const stats = await page.evaluate(async (b64) => {
      const bin = atob(b64);
      const a = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
      const bmp = await createImageBitmap(new Blob([a], { type: "image/png" }));
      const c = new OffscreenCanvas(bmp.width, bmp.height);
      const ctx = c.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(bmp, 0, 0);
      const d = ctx.getImageData(0, 0, c.width, c.height).data;
      const lum = (i) => (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;
      let sum = 0;
      let upper = 0;
      let lower = 0;
      let un = 0;
      let ln = 0;
      let blown = 0;
      let hot = 0;
      const half = Math.floor(c.height / 2);
      for (let y = 0; y < c.height; y++) {
        for (let x = 0; x < c.width; x++) {
          const i = (y * c.width + x) * 4;
          const l = lum(i);
          sum += l;
          if (l > 0.95) blown++;
          if (l > 0.85) hot++;
          if (y < half) {
            upper += l;
            un++;
          } else {
            lower += l;
            ln++;
          }
        }
      }
      const n = c.width * c.height;
      bmp.close();
      return {
        mean: sum / n,
        upper: upper / un,
        lower: lower / ln,
        blown: (blown / n) * 100,
        hot: (hot / n) * 100,
      };
    }, shot);

    console.log(
      `${look.padEnd(9)} ${stats.mean.toFixed(3)}  ${stats.upper.toFixed(3)}  ${stats.lower.toFixed(3)}` +
        `   ${stats.blown.toFixed(2).padStart(6)}%   ${stats.hot.toFixed(2).padStart(6)}%`,
    );
  }
  console.log("");
  console.log("upper = copy band, lower = device band. blown/hot are share of frame.");
} finally {
  await browser.close();
}
