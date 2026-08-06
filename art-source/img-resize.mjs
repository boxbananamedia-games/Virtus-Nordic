/**
 * Image resizer backed by headless Chrome.
 *
 * Needed because the two pure-JS options both fail on these assets: sharp's
 * native binary will not dlopen against this Node build, and jpeg-js (Jimp's
 * decoder) refuses an 8192x8192 JPEG, which needs 268MB to decode. Chrome
 * decodes it on the GPU without complaint.
 */
import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

export async function createResizer() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--max-old-space-size=4096"],
  });
  const page = await browser.newPage();
  await page.goto("about:blank");

  return {
    /** @returns {Promise<Uint8Array>} re-encoded JPEG bytes */
    async resize(bytes, size, quality = 0.82) {
      const b64 = Buffer.from(bytes).toString("base64");
      const out = await page.evaluate(
        async (b64, size, quality) => {
          const bin = atob(b64);
          const arr = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
          const bmp = await createImageBitmap(new Blob([arr], { type: "image/jpeg" }));
          const w = Math.min(size, bmp.width);
          const h = Math.min(size, bmp.height);
          const canvas = new OffscreenCanvas(w, h);
          const ctx = canvas.getContext("2d");
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(bmp, 0, 0, w, h);
          bmp.close();
          const blob = await canvas.convertToBlob({ type: "image/jpeg", quality });
          const buf = new Uint8Array(await blob.arrayBuffer());
          let s = "";
          for (let i = 0; i < buf.length; i++) s += String.fromCharCode(buf[i]);
          return btoa(s);
        },
        b64,
        size,
        quality,
      );
      return new Uint8Array(Buffer.from(out, "base64"));
    },
    close: () => browser.close(),
  };
}
