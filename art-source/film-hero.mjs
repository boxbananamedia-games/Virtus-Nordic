/**
 * Records the hero entrance as a video you can post.
 *
 * capture-hero.mjs makes a contact sheet to judge the animation by; this makes
 * the thing itself. Same trick underneath — headless Chrome composites and runs
 * WebGL properly, unlike the pane this project is developed against — but it
 * pulls frames over CDP's screencast rather than one screenshot at a time,
 * which is the difference between about 15fps and something worth watching.
 *
 * Frames arrive with real timestamps and at an uneven rate, so they are handed
 * to ffmpeg through the concat demuxer with a measured duration each, and
 * resampled to a constant frame rate on the way out. Encoding at a nominal fps
 * and hoping the capture kept up produces judder exactly where the animation is
 * fastest, which is the part worth filming.
 *
 * Usage (dev server or the live URL):
 *   node art-source/film-hero.mjs [url] [seconds] [label] [width] [height]
 *
 * Writes art-source/capture/<label>.mp4 — H.264, yuv420p, faststart, silent.
 * That combination is what every social platform and every browser will accept
 * without re-encoding it for you.
 */
import puppeteer from "puppeteer-core";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { renderHeroAudio, toWav } from "./hero-audio.mjs";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const URL_ARG = process.argv[2] ?? "http://localhost:5173/";
const SECONDS = Number(process.argv[3] ?? 7);
const LABEL = process.argv[4] ?? "hero";
const WIDTH = Number(process.argv[5] ?? 1920);
const HEIGHT = Number(process.argv[6] ?? 1080);
/** Pass "silent" to omit the soundtrack — the site itself never plays it, and
 *  a muted cut is the right thing for anywhere it is embedded rather than
 *  posted. */
const SILENT = process.argv[7] === "silent";
/** Output frame rate. The capture is resampled to this. */
const FPS = 60;
/** Integrated loudness target. Platforms normalise to roughly -14 LUFS; this
 *  is an accent track with no voice or music under it, so it sits politely
 *  below that rather than being turned down on arrival. */
const LUFS = -16;

const OUT = path.resolve("art-source/capture");
const FRAMES = path.join(OUT, `.frames-${LABEL}`);

const run = (cmd, args, cwd) =>
  new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
    let err = "";
    p.stderr.on("data", (d) => (err += d));
    p.on("close", (code) =>
      code === 0 ? resolve(err) : reject(new Error(`${cmd} exited ${code}\n${err.slice(-2000)}`)),
    );
  });

/** Integrated loudness of a file, in LUFS. */
async function measureLoudness(file, cwd) {
  const out = await run("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-af", "ebur128", "-f", "null", "-"], cwd);
  const m = out.match(/I:\s*(-?[\d.]+)\s*LUFS/g);
  if (!m) throw new Error("could not measure loudness");
  return Number(m[m.length - 1].match(/(-?[\d.]+)/)[1]);
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: [
    "--use-angle=d3d11",
    "--enable-gpu",
    "--ignore-gpu-blocklist",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    `--window-size=${WIDTH},${HEIGHT}`,
  ],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

  // The first frame in which a control has been positioned is the first frame
  // after Ring mounted, which is t = 0 for the entrance — and, since the ring
  // now leads and cues the copy rather than waiting for it, t = 0 for the
  // soundtrack too.
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

  // Warm the cache first, so the recorded pass is not competing with 3.7MB of
  // model downloads for frame time.
  await page.goto(URL_ARG, { waitUntil: "networkidle0" });
  const ok = await page.evaluate(() => document.querySelector(".vn-hero-devices")?.dataset.orbit);
  if (ok !== "true") {
    throw new Error(
      `the orbit is not running here (data-orbit="${ok}") — without WebGL the page falls back to the CSS field and there is nothing to film.`,
    );
  }

  const client = await page.createCDPSession();
  const frames = [];
  client.on("Page.screencastFrame", async ({ data, sessionId, metadata }) => {
    frames.push({ at: metadata.timestamp * 1000, data });
    try {
      await client.send("Page.screencastFrameAck", { sessionId });
    } catch {
      /* the cast is already stopped; the frame is still good */
    }
  });

  await client.send("Page.startScreencast", {
    format: "jpeg",
    quality: 100,
    maxWidth: WIDTH,
    maxHeight: HEIGHT,
    everyNthFrame: 1,
  });

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.__ringAt !== null, { timeout: 30000 });
  // Screencast timestamps are epoch seconds; the page's clock is not. Convert
  // the ring's start into the same frame of reference so frames from before the
  // entrance can be dropped.
  const ringEpoch = await page.evaluate(() => performance.timeOrigin + window.__ringAt);

  await new Promise((r) => setTimeout(r, SECONDS * 1000 + 400));
  await client.send("Page.stopScreencast");

  const shot = frames.filter((f) => f.at >= ringEpoch && f.at <= ringEpoch + SECONDS * 1000);
  if (shot.length < 2) throw new Error(`only ${shot.length} frames captured`);
  const span = (shot[shot.length - 1].at - shot[0].at) / 1000;
  console.log(
    `captured ${shot.length} frames over ${span.toFixed(2)}s (~${(shot.length / span).toFixed(0)} fps)`,
  );

  await rm(FRAMES, { recursive: true, force: true });
  await mkdir(FRAMES, { recursive: true });
  const list = [];
  for (let i = 0; i < shot.length; i++) {
    const name = `f${String(i).padStart(5, "0")}.jpg`;
    await writeFile(path.join(FRAMES, name), Buffer.from(shot[i].data, "base64"));
    // Real elapsed time to the next frame, so the encoder reproduces the
    // animation's actual timing rather than an assumed one.
    const next = shot[i + 1] ? (shot[i + 1].at - shot[i].at) / 1000 : 1 / FPS;
    list.push(`file '${name}'`, `duration ${next.toFixed(6)}`);
  }
  // The concat demuxer ignores the final duration unless the last file is
  // repeated, which would otherwise clip the closing frame.
  list.push(`file '${shot.length ? `f${String(shot.length - 1).padStart(5, "0")}.jpg` : ""}'`);
  await writeFile(path.join(FRAMES, "frames.txt"), list.join("\n"));

  // Where the entrance clock reaches zero within the clip. The ring starts the
  // moment its models are ready and waits for nothing, and the capture begins
  // on that same frame — so the two clocks share an origin and the soundtrack
  // needs no offset.
  const entranceAt = 0;

  const audioIn = [];
  const audioOut = [];
  if (!SILENT) {
    // Rendered a second longer than the clip so `-shortest` can trim to the
    // video rather than the video being trimmed to the audio.
    await writeFile(
      path.join(FRAMES, "audio.wav"),
      toWav(renderHeroAudio(entranceAt, SECONDS + 1)),
    );
    // Measure, then apply one static gain. loudnorm's dynamic mode would pump
    // on material this sparse — five transients over near-silence — and the
    // whole point of synthesising the envelopes from the animation's own
    // velocity curves is that the dynamics are already right.
    const measured = await measureLoudness("audio.wav", FRAMES);
    const gain = LUFS - measured;
    console.log(
      `entrance starts ${entranceAt.toFixed(2)}s into the clip; audio ${measured.toFixed(1)} -> ${LUFS} LUFS (${gain >= 0 ? "+" : ""}${gain.toFixed(1)} dB)`,
    );
    audioIn.push("-i", "audio.wav");
    audioOut.push(
      // The limiter is insurance, not shaping: the gain above is computed to
      // land well clear of it.
      "-filter:a", `volume=${gain.toFixed(2)}dB,alimiter=limit=0.89`,
      "-c:a", "aac",
      "-b:a", "192k",
      "-shortest",
    );
  }

  const file = path.join(OUT, `${LABEL}.mp4`);
  await run(
    "ffmpeg",
    [
      "-y",
      "-f", "concat",
      "-safe", "0",
      "-i", "frames.txt",
      ...audioIn,
      ...(SILENT ? ["-an"] : []),
      ...audioOut,
      // The source frames are JPEG, i.e. full-range colour. Encoding them
      // straight through yields yuvj420p, and anything that assumes the
      // broadcast-range BT.709 every platform actually expects will play the
      // dusk gradient back washed out. Convert the range explicitly and tag the
      // result, rather than leaving the player to guess.
      "-vf", `fps=${FPS},scale=in_range=full:out_range=limited,format=yuv420p`,
      "-color_range", "tv",
      "-colorspace", "bt709",
      "-color_primaries", "bt709",
      "-color_trc", "bt709",
      "-c:v", "libx264",
      "-preset", "slow",
      "-crf", "18",
      "-movflags", "+faststart",
      file,
    ],
    FRAMES,
  );
  await rm(FRAMES, { recursive: true, force: true });
  console.log(`${file}  ${WIDTH}x${HEIGHT}  ${FPS}fps`);
} finally {
  await browser.close();
}
