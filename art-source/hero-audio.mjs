/**
 * Synthesises the hero entrance's soundtrack: five whooshes and a whirl.
 *
 * Generated rather than licensed, for one reason that matters: it is written
 * against the same numbers that drive the animation, so every whoosh peaks
 * exactly when its phone is at maximum speed and the whirl decays on precisely
 * the curve the ring decays on. A library clip would have to be nudged into
 * place by ear and would drift the moment anything in the entrance is retuned.
 *
 * A whoosh is not a mysterious object. It is noise through a bandpass whose
 * centre frequency and amplitude both track the speed of the thing making it —
 * faster air, brighter and louder. So:
 *
 *   - the envelope IS the derivative of the crossing's easing curve, i.e. the
 *     phone's actual on-screen velocity;
 *   - the filter opens from 400Hz to ~2.6kHz in step with that velocity;
 *   - the stereo image tracks the phone across the frame, left to right,
 *     because that is where it is.
 *
 * The whirl underneath is the ring itself: its level and brightness follow
 * lapSpeed(), and it thickens by a fifth each time a phone joins. It is doing
 * the same job the spin-down does visually, which is why the two settle
 * together without either being nudged.
 *
 * Usage:  node art-source/hero-audio.mjs <out.wav> [offsetSec] [durationSec]
 *
 * `offsetSec` is where the entrance clock starts within the file — the hero
 * holds its devices until the copy has landed, so this is rarely zero.
 */
import { writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

/* ── mirrors INTRO / ORBIT in app/src/components/vn/apps/HeroOrbit.tsx ──
   Kept in step by hand, as art-source/orbit-check.mjs already does. If the
   entrance is retuned these five numbers move with it. */
const N = 5;
const GLIDE = 0.9;
const SPACING = 360 + 360 / N;
const BOARD_SPEED = 720;
const DECAY = 1.0;
const CRUISE = 8;

const mergeTime = (k) => GLIDE + (SPACING / BOARD_SPEED) * k;
const BOARD_END = mergeTime(N - 1);
const lapSpeed = (t) =>
  t <= BOARD_END ? BOARD_SPEED : CRUISE + (BOARD_SPEED - CRUISE) * Math.exp(-(t - BOARD_END) / DECAY);

const RATE = 48000;

/** The crossing's easing, and its derivative — the phone's velocity, which is
 *  what the ear is actually being told about. Peaks at 3 at the midpoint. */
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
const easeVelocity = (t) => (t < 0.5 ? 12 * t * t : 3 * (-2 * t + 2) ** 2) / 3;

/**
 * A Chamberlin state-variable filter, one per channel.
 *
 * Chosen over a biquad because its cutoff can be swept per sample without
 * recomputing coefficients or blowing up, and a whoosh is nothing but a swept
 * cutoff.
 */
function makeSVF() {
  let low = 0;
  let band = 0;
  return (input, freq, q) => {
    const f = 2 * Math.sin((Math.PI * Math.min(freq, RATE * 0.45)) / RATE);
    const high = input - low - q * band;
    band += f * high;
    low += f * band;
    return band;
  };
}

/** Deterministic noise. A fixed seed means the same render twice — which
 *  matters when the video is re-cut and the audio has to match. */
function makeNoise(seed = 0x5eed) {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return (s / 0x7fffffff - 1) * 0.5;
  };
}

export function renderHeroAudio(offset = 0, duration = 8) {
  const n = Math.ceil(duration * RATE);
  const left = new Float32Array(n);
  const right = new Float32Array(n);
  const noise = makeNoise();

  // ── the five whooshes ────────────────────────────────────────────────
  // Each phone crosses from off-screen left to the gate on the ring's right
  // over GLIDE seconds, arriving exactly as its slot does.
  for (let k = 0; k < N; k++) {
    const start = offset + mergeTime(k) - GLIDE;
    const air = makeSVF();
    const body = makeSVF();
    const from = Math.max(0, Math.floor(start * RATE));
    const to = Math.min(n, Math.ceil((start + GLIDE * 1.15) * RATE));
    for (let i = from; i < to; i++) {
      const t = (i / RATE - start) / GLIDE;
      if (t < 0) continue;
      // Past 1 the phone has merged; the tail is the air still moving.
      const v = t <= 1 ? easeVelocity(t) : easeVelocity(1) + 0;
      const tail = t <= 1 ? 1 : Math.exp(-(t - 1) * 14);
      const env = v * tail;
      if (env < 1e-4) continue;
      const src = noise();
      // Brighter the faster it moves, which is the whole of the effect.
      const hiss = air(src, 400 + 2200 * env, 1.1) * env;
      // A little weight underneath so it reads as mass, not just air.
      const weight = body(src, 90 + 140 * env, 1.6) * env * 0.55;
      const s = (hiss + weight) * 0.20;
      // Panned to where the phone is: it enters off the left edge and merges
      // on the right of the ring.
      const pan = -0.95 + 1.55 * easeInOutCubic(Math.min(t, 1));
      left[i] += s * Math.cos(((pan + 1) * Math.PI) / 4);
      right[i] += s * Math.sin(((pan + 1) * Math.PI) / 4);
    }
  }

  // ── the whirl ────────────────────────────────────────────────────────
  // The ring itself. Nothing is orbiting until the first phone merges, and it
  // thickens by a fifth with each one that joins.
  const whirlL = makeSVF();
  const whirlR = makeSVF();
  for (let i = 0; i < n; i++) {
    const t = i / RATE - offset;
    if (t < mergeTime(0)) continue;
    let joined = 0;
    for (let k = 0; k < N; k++) if (t >= mergeTime(k)) joined++;
    const speed = lapSpeed(t) / BOARD_SPEED;
    // Perceptual-ish: level tracks speed with a gentle curve rather than
    // linearly, so the decay is heard as gradual rather than falling off a
    // cliff. It lands on effectively nothing at cruise.
    const env = Math.pow(speed, 0.55) * (joined / N) * 0.085;
    if (env < 1e-4) continue;
    const fc = 180 + 900 * speed;
    left[i] += whirlL(noise(), fc, 1.5) * env;
    right[i] += whirlR(noise(), fc * 1.06, 1.5) * env;
  }

  return { left, right, rate: RATE };
}

/** 16-bit stereo PCM WAV. No dependency, and every tool reads it. */
export function toWav({ left, right, rate }) {
  const n = left.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 4, 4);
  buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(rate, 24);
  buf.writeUInt32LE(rate * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 4, 40);
  const clamp = (v) => Math.max(-1, Math.min(1, v));
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE((clamp(left[i]) * 32767) | 0, 44 + i * 4);
    buf.writeInt16LE((clamp(right[i]) * 32767) | 0, 46 + i * 4);
  }
  return buf;
}

// pathToFileURL, not string surgery: on Windows a file URL carries three
// slashes and a drive letter, and hand-built comparisons silently never match.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const out = process.argv[2] ?? "hero-audio.wav";
  const offset = Number(process.argv[3] ?? 0);
  const duration = Number(process.argv[4] ?? 8);
  const rendered = renderHeroAudio(offset, duration);
  await writeFile(out, toWav(rendered));
  let peak = 0;
  for (let i = 0; i < rendered.left.length; i++) {
    peak = Math.max(peak, Math.abs(rendered.left[i]), Math.abs(rendered.right[i]));
  }
  console.log(
    `${out}  ${duration}s  offset ${offset}s  peak ${(20 * Math.log10(peak)).toFixed(1)} dBFS`,
  );
  console.log(
    `whooshes peak at ${Array.from({ length: N }, (_, k) => (offset + mergeTime(k) - GLIDE / 2).toFixed(2)).join(", ")}s`,
  );
}
