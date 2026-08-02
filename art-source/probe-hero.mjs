/**
 * Prints where each hero device actually is, frame by frame.
 *
 * The companion to capture-hero.mjs: that one shows you what the entrance looks
 * like, this one tells you where things are to three decimal places. Between
 * them they found both faults that reading the code had missed — devices
 * crossing over and bunching at the left because each eased towards its own
 * distant seat, and the assembled line sitting off centre.
 *
 * Reads the accessible controls rather than the scene, since those are tracked
 * to the devices every frame anyway and are visible from outside WebGL.
 *
 * Usage (dev server must be running):  node art-source/probe-hero.mjs [seconds]
 */
import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const SECONDS = Number(process.argv[2] ?? 2.2);

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--hide-scrollbars"],
});
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 912, deviceScaleFactor: 1 });
  await page.evaluateOnNewDocument(() => {
    window.__t = null;
    const f = () => {
      const e = document.querySelector(".vn-orbit-hit");
      if (e && e.getBoundingClientRect().width > 0) {
        window.__t = performance.now();
        return;
      }
      requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  });
  await page.goto("http://localhost:5173/", { waitUntil: "networkidle0" });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.__t !== null, { timeout: 30000 });

  const rows = [];
  const start = Date.now();
  while (Date.now() - start < SECONDS * 1000) {
    rows.push(
      await page.evaluate(() => ({
        t: +(performance.now() - window.__t).toFixed(0),
        d: [...document.querySelectorAll(".vn-orbit-hit")].map((e) => {
          const r = e.getBoundingClientRect();
          return r.width
            ? { x: +((r.left + r.width / 2) / innerWidth).toFixed(3), h: +(r.height / innerHeight).toFixed(3) }
            : null;
        }),
      })),
    );
  }

  // Each sample costs a round trip, so `t` runs roughly 0.1s behind the page's
  // own clock. Fine for spacing and ordering; do not read absolute timings off
  // it — capture-hero.mjs is the reference for those.
  console.log("t(ms)  screen-x per device                  | height (fraction of viewport)");
  const seen = new Set();
  for (const r of rows) {
    const bucket = Math.round(r.t / 100);
    if (seen.has(bucket)) continue;
    seen.add(bucket);
    console.log(
      String(r.t).padStart(5) +
        "  " +
        r.d.map((d) => (d ? d.x.toFixed(2).padStart(5) : "   --")).join(" ") +
        "   | " +
        r.d.map((d) => (d ? d.h.toFixed(2) : "--")).join(" "),
    );
  }
} finally {
  await browser.close();
}
