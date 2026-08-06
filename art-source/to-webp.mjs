/**
 * Re-encodes the baked screen plates from PNG to WebP.
 *
 * The plates were 4.8 MB across five files and are the single heaviest thing
 * the hero waits on — nineteen times the whole JS bundle, sat behind a canvas
 * that cannot draw until they land. PNG is the wrong container for them: they
 * are flat UI with large areas of one colour, and they end up mip-mapped onto a
 * screen roughly 450px tall, so per-texel fidelity at 1170x2532 is spent on
 * detail no one can resolve.
 *
 * Chrome does the encoding, for the same reason img-resize.mjs uses it: sharp's
 * native binary will not dlopen against this Node build. Chrome's WebP encoder
 * is libwebp, which is the reference implementation.
 *
 * Rather than pick a quality by eye, this sweeps a few and measures mean
 * absolute error against the original, then keeps the cheapest encode that
 * stays under MAX_MAE. Run it from the repo root:  node art-source/to-webp.mjs
 */
import puppeteer from "puppeteer-core";
import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const DIR = path.resolve("app/public/lab-textures");
const QUALITIES = [0.72, 0.8, 0.88, 0.94];
/** Mean absolute error per channel, 0-255. Below ~2 is invisible even before
 *  the texture is minified onto a phone-sized screen. */
const MAX_MAE = 2.0;

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"],
});

try {
  const page = await browser.newPage();
  await page.goto("about:blank");

  const files = (await readdir(DIR)).filter((f) => f.endsWith(".png")).sort();
  let before = 0;
  let after = 0;

  console.log("plate           png      webp    saved   q     MAE");
  console.log("------------------------------------------------------");

  for (const file of files) {
    const png = await readFile(path.join(DIR, file));
    before += png.length;

    const result = await page.evaluate(
      async (b64, qualities, maxMae) => {
        const toBytes = (s) => {
          const bin = atob(s);
          const a = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
          return a;
        };
        const draw = async (bytes, type) => {
          const bmp = await createImageBitmap(new Blob([bytes], { type }));
          const c = new OffscreenCanvas(bmp.width, bmp.height);
          const ctx = c.getContext("2d", { willReadFrequently: true });
          ctx.drawImage(bmp, 0, 0);
          bmp.close();
          return { canvas: c, data: ctx.getImageData(0, 0, c.width, c.height).data };
        };

        const src = toBytes(b64);
        const original = await draw(src, "image/png");

        for (const quality of qualities) {
          const blob = await original.canvas.convertToBlob({ type: "image/webp", quality });
          const bytes = new Uint8Array(await blob.arrayBuffer());
          // Decode what we just encoded and diff it against the source, so the
          // number reflects the real round trip rather than the encoder's word.
          const round = await draw(bytes, "image/webp");
          let sum = 0;
          for (let i = 0; i < original.data.length; i += 4) {
            sum +=
              Math.abs(original.data[i] - round.data[i]) +
              Math.abs(original.data[i + 1] - round.data[i + 1]) +
              Math.abs(original.data[i + 2] - round.data[i + 2]);
          }
          const mae = sum / ((original.data.length / 4) * 3);
          if (mae <= maxMae || quality === qualities[qualities.length - 1]) {
            let s = "";
            const CHUNK = 0x8000; // apply() blows the stack on a whole plate
            for (let i = 0; i < bytes.length; i += CHUNK) {
              s += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
            }
            return { b64: btoa(s), quality, mae, w: original.canvas.width, h: original.canvas.height };
          }
        }
      },
      png.toString("base64"),
      QUALITIES,
      MAX_MAE,
    );

    const webp = Buffer.from(result.b64, "base64");
    await writeFile(path.join(DIR, file.replace(/\.png$/, ".webp")), webp);
    after += webp.length;

    const kb = (n) => `${(n / 1024).toFixed(0)}KB`.padStart(7);
    console.log(
      `${file.replace(".png", "").padEnd(14)}${kb(png.length)}${kb(webp.length)}` +
        `${String(`${(100 - (webp.length / png.length) * 100).toFixed(0)}%`).padStart(8)}` +
        `  ${result.quality}  ${result.mae.toFixed(2)}   ${result.w}x${result.h}`,
    );
  }

  console.log("------------------------------------------------------");
  console.log(
    `total  ${(before / 1024 / 1024).toFixed(2)} MB -> ${(after / 1024 / 1024).toFixed(2)} MB ` +
      `(${(100 - (after / before) * 100).toFixed(1)}% smaller, ${((before - after) / 1024 / 1024).toFixed(2)} MB off the hero)`,
  );
} finally {
  await browser.close();
}
