import { useEffect, useRef, useState } from "react";
import { useLang } from "../../lib/language";
import { onScrollFrame } from "../../lib/scroll-sync";

/**
 * ScrollCraft — "The reality" scroll film.
 *
 * Six chained Seedance 2.0 clips (cafe -> train -> intersection -> window ->
 * bedroom -> phone screen) pre-sliced into a WebP frame sequence. Scroll
 * position through this tall section scrubs the sequence on a <canvas>,
 * Apple-product-page style. The final frames crossfade into real screenshots
 * of this site, so the film ends on Virtus Nordic — on the phone.
 *
 * Fallbacks: prefers-reduced-motion and no-JS both show the final still.
 */

/**
 * 96 frames at 1120x630, halved from the 191 at 1568x882 the sequence was
 * baked at. Both dimensions matter and for different reasons: the count is
 * bytes over the wire, the resolution is bitmap memory. At the old size a
 * single decoded frame was 5.3MB, so holding the sequence cost about a
 * gigabyte; at this one it is 2.8MB, and only a window of them is ever
 * resident (see the cache below).
 *
 * 96 frames across the section's ~5460px of scrub is one frame per ~57px,
 * which is under a scroll notch — the film reads as continuous. Caption
 * timings are fractions of scroll progress, not frame indices, so they land on
 * the same beats regardless of the count.
 */
export const CRAFT_FRAME_COUNT = 96;
export const CRAFT_FRAME_W = 1120;
export const CRAFT_FRAME_H = 630;

/* Scroll-progress at which each caption BEGINS (share of total scrub). The
   first clip (cafe) plays caption-free — nothing shows until p passes
   CAPTION_STARTS[0], clear of the logo/scene reveal — then each caption runs
   until the next one begins, and the finale (last) holds until it fades out.
   The five captions are spread across the remaining clips, same order. */
const CAPTION_STARTS = [0.11, 0.27, 0.4, 0.55, 0.67];

/* Deliberate in-film caption placements — one per beat, each clear of the
   scene's main motif: cafe (subject right) -> lower-left; train (passengers
   mid/low) -> top-left; intersection (crowd low) -> top-right; bedroom
   (person right of centre) -> centre-left; finale -> lower-centre, fading
   out before the site reveal completes. */
const CAPTION_POS: React.CSSProperties[] = [
  { left: "7%", bottom: "13%", textAlign: "left", maxWidth: "34rem" },
  { left: "7%", top: "12%", textAlign: "left", maxWidth: "32rem" },
  { right: "7%", top: "12%", textAlign: "right", maxWidth: "32rem" },
  { left: "7%", top: "44%", textAlign: "left", maxWidth: "26rem" },
  // Centred via left/right:0 + margin auto (not translateX) so the caption's
  // entrance/drift animations own `transform` without fighting a static offset.
  { left: 0, right: 0, margin: "0 auto", bottom: "12%", textAlign: "center", maxWidth: "38rem" },
];

const framePath = (i: number) => `/scroll/f${String(i).padStart(3, "0")}.webp`;
export function ScrollCraft() {
  const { t } = useLang();
  const outerRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastDrawnRef = useRef(-1);
  const targetRef = useRef(0);
  const captionIdxRef = useRef(-1);
  const [caption, setCaption] = useState(-1);
  const finaleFadeRef = useRef(false);
  const [finaleFaded, setFinaleFaded] = useState(false);
  const [staticMode, setStaticMode] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStaticMode(true);
      return;
    }

    const outer = outerRef.current;
    const canvas = canvasRef.current;
    if (!outer || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setStaticMode(true);
      return;
    }

    /**
     * Frames are held in a window around the playhead, not all at once.
     *
     * Every frame is CRAFT_FRAME_W x CRAFT_FRAME_H of RGBA once decoded, so
     * retaining the whole sequence — which is what an array of every loaded
     * Image amounts to — reserved the better part of a gigabyte of bitmap.
     * Machines without a discrete GPU pay that out of system memory, evict
     * under pressure, and then re-decode mid-scrub, which is precisely when
     * they can least afford it.
     *
     * FETCH is how far ahead and behind frames are pulled in; KEEP is how far
     * they survive. The gap between them is hysteresis: without it, a playhead
     * resting on a boundary would drop and re-fetch the same frame every few
     * pixels of scroll.
     */
    const FETCH = 12;
    const KEEP = 18;

    type Frame = ImageBitmap | HTMLImageElement;
    const cache = new Map<number, Frame>();
    const inflight = new Map<number, AbortController>();
    /** Frames the server would not give us. Remembered because a completed
     *  fetch re-runs syncWindow, and a frame that is neither cached nor in
     *  flight looks exactly like one that has not been asked for yet — so
     *  without this, one 404 becomes an unbounded retry loop. */
    const failed = new Set<number>();

    const release = (frame: Frame) => {
      // ImageBitmap frees on demand; an <img> only when nothing references it,
      // and dropping the src is what lets the decoded copy go early.
      if (typeof ImageBitmap !== "undefined" && frame instanceof ImageBitmap) frame.close();
      else (frame as HTMLImageElement).src = "";
    };

    const draw = (index: number) => {
      const want = Math.min(CRAFT_FRAME_COUNT - 1, Math.max(0, index));
      // Nearest resident frame in EITHER direction. The old code walked
      // downwards on the assumption that everything below the playhead was
      // loaded; with a window that no longer holds, and the nearest frame is
      // as likely to be above as below.
      let best = -1;
      let bestDist = Infinity;
      for (const i of cache.keys()) {
        const d = Math.abs(i - want);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
      if (best < 0 || best === lastDrawnRef.current) return;
      const frame = cache.get(best);
      if (!frame) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
      lastDrawnRef.current = best;
    };

    let disposed = false;

    const fetchFrame = async (i: number) => {
      if (cache.has(i) || inflight.has(i) || failed.has(i)) return;
      const ac = new AbortController();
      inflight.set(i, ac);
      try {
        const res = await fetch(framePath(i), { signal: ac.signal });
        if (!res.ok) {
          failed.add(i);
          return;
        }
        const blob = await res.blob();
        let frame: Frame;
        if (typeof createImageBitmap === "function") {
          frame = await createImageBitmap(blob);
        } else {
          const img = new Image();
          img.decoding = "async";
          img.src = framePath(i);
          await img.decode().catch(() => {});
          frame = img;
        }
        if (disposed || Math.abs(i - targetRef.current) > KEEP) {
          release(frame);
          return;
        }
        cache.set(i, frame);
        // Repaint if this is a better answer than what is on the canvas.
        if (Math.abs(targetRef.current - i) < Math.abs(targetRef.current - lastDrawnRef.current)) {
          draw(targetRef.current);
        }
      } catch {
        // Abort is expected when the window moves on; anything else means the
        // frame is not coming, and retrying it in a loop helps nobody.
        if (!ac.signal.aborted) failed.add(i);
      } finally {
        inflight.delete(i);
        // Top the window back up. Without this the window only advanced when
        // the playhead moved, so coming to rest left it holding just the few
        // frames the last tick had room to start — and the next flick had
        // nothing buffered to scrub through.
        syncWindow();
      }
    };

    /** Pull in what the window wants, nearest first, and drop what it doesn't. */
    const syncWindow = () => {
      if (disposed) return;
      const centre = targetRef.current;

      for (const [i, frame] of cache) {
        if (Math.abs(i - centre) > KEEP) {
          cache.delete(i);
          release(frame);
        }
      }
      for (const [i, ac] of inflight) {
        if (Math.abs(i - centre) > KEEP) {
          ac.abort();
          inflight.delete(i);
        }
      }

      // Nearest-first so a fast scrub gets the frame under the playhead before
      // it gets the edges of the window.
      const wanted: number[] = [];
      for (let d = 0; d <= FETCH; d += 1) {
        for (const i of d === 0 ? [centre] : [centre - d, centre + d]) {
          if (
            i >= 0 &&
            i < CRAFT_FRAME_COUNT &&
            !cache.has(i) &&
            !inflight.has(i) &&
            !failed.has(i)
          ) {
            wanted.push(i);
          }
        }
      }
      // Cap concurrency; the rest arrive on the next scroll tick.
      for (const i of wanted.slice(0, Math.max(0, 6 - inflight.size))) void fetchFrame(i);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          syncWindow();
          io.disconnect();
        }
      },
      // Was 120%, which started the whole sequence more than a viewport early
      // and put it in contention with the hero's own assets. The window only
      // needs a little runway now.
      { rootMargin: "25% 0px" },
    );
    io.observe(outer);

    // Split read from write and hand both to the shared scroll scheduler, so
    // this and the process section's progress produce one layout per frame
    // between them instead of each forcing its own.
    let fadeTop = 0;
    let fadeBottom = 0;
    let p = 0;
    let scrubbable = false;

    const unsubscribe = onScrollFrame({
      measure: () => {
        const rect = outer.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        fadeTop = Math.min(1, Math.max(0, rect.top / vh));
        fadeBottom = Math.min(1, Math.max(0, (vh - rect.bottom) / vh));
        const scrollable = rect.height - vh;
        scrubbable = scrollable > 0;
        if (scrubbable) p = Math.min(1, Math.max(0, -rect.top / scrollable));
      },
      mutate: () => {
        // Feather whichever edge of the film is currently mid-viewport, so it
        // dissolves out of the paper on the way in and back into it on the way
        // out rather than meeting it at a hard line. Both collapse to 0 once
        // the edge is off screen — the pinned film is untouched.
        const stage = stageRef.current;
        if (stage) {
          stage.style.setProperty("--film-fade-top", `${(fadeTop * 50).toFixed(2)}vh`);
          stage.style.setProperty("--film-fade-bottom", `${(fadeBottom * 50).toFixed(2)}vh`);
        }
        if (!scrubbable) return;

        const frame = Math.round(p * (CRAFT_FRAME_COUNT - 1));
        const moved = frame !== targetRef.current;
        targetRef.current = frame;
        draw(frame);
        if (moved) syncWindow();
        // -1 = no caption yet (first clip runs clean); otherwise the last
        // caption whose start threshold we've passed.
        let ci = -1;
        for (let i = 0; i < CAPTION_STARTS.length; i += 1) {
          if (p >= CAPTION_STARTS[i]) ci = i;
          else break;
        }
        if (ci !== captionIdxRef.current) {
          captionIdxRef.current = ci;
          setCaption(ci);
        }
        const faded = p > 0.955;
        if (faded !== finaleFadeRef.current) {
          finaleFadeRef.current = faded;
          setFinaleFaded(faded);
        }
      },
    });

    return () => {
      disposed = true;
      unsubscribe();
      io.disconnect();
      for (const ac of inflight.values()) ac.abort();
      inflight.clear();
      for (const frame of cache.values()) release(frame);
      cache.clear();
    };
  }, []);

  return (
    <>
      <div className="mx-auto max-w-3xl px-5 pb-12 pt-20 text-center md:pt-28">
        <span className="label-eyebrow">{t.craft.label}</span>
        <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-navy md:text-5xl">
          {t.craft.headline}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-navy/70 md:text-base">{t.craft.body}</p>
      </div>

      {staticMode ? (
        <div className="mx-auto max-w-2xl px-5 pb-24 pt-2 text-center">
          <p className="font-display text-2xl font-semibold italic leading-snug text-navy/85 md:text-3xl">
            {t.craft.captions[t.craft.captions.length - 1]}
          </p>
        </div>
      ) : (
        <section ref={outerRef} className="relative" style={{ height: "600vh" }}>
          <div className="sticky top-0 h-screen w-full overflow-hidden">
            {/* The mask lives on this inner layer, not on the sticky element —
                same box, so caption offsets are unchanged, but nothing is
                stacked onto the thing doing the pinning. */}
            <div ref={stageRef} className="film-stage absolute inset-0">
              <canvas
                ref={canvasRef}
                width={CRAFT_FRAME_W}
                height={CRAFT_FRAME_H}
                className="h-full w-full"
                style={{ objectFit: "cover" }}
                aria-hidden="true"
              />
              <div aria-live="polite">
                {t.craft.captions.map((c, i) => (
                  <p
                    key={i}
                    className="film-caption"
                    data-on={caption === i && !(i === t.craft.captions.length - 1 && finaleFaded) ? "true" : "false"}
                    style={CAPTION_POS[i]}
                  >
                    {c}
                  </p>
                ))}
              </div>
            </div>
            <noscript>
              <p className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 text-center font-display text-2xl italic text-navy/85">
                {t.craft.captions[t.craft.captions.length - 1]}
              </p>
            </noscript>
          </div>
        </section>
      )}
    </>
  );
}
