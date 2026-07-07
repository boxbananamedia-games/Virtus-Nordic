import { useEffect, useRef, useState } from "react";
import { useLang } from "../../lib/language";

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

export const CRAFT_FRAME_COUNT = 191;
export const CRAFT_FRAME_W = 1568;
export const CRAFT_FRAME_H = 882;

/* Cumulative end-of-beat thresholds (share of total scrub) derived from the
   eight clip durations: cafe, train, intersection, window+bedroom (2 clips
   share one caption), screen finale (3 clips). */
const CAPTION_ENDS = [0.093, 0.223, 0.316, 0.611, 1];

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
  { left: "50%", bottom: "12%", transform: "translateX(-50%)", textAlign: "center", maxWidth: "38rem" },
];

const framePath = (i: number) => `/scroll/f${String(i).padStart(3, "0")}.webp`;
const POSTER = framePath(CRAFT_FRAME_COUNT - 1);

export function ScrollCraft() {
  const { t } = useLang();
  const outerRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const loadedRef = useRef<boolean[]>([]);
  const lastDrawnRef = useRef(-1);
  const targetRef = useRef(0);
  const captionIdxRef = useRef(0);
  const [caption, setCaption] = useState(0);
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

    imagesRef.current = new Array<HTMLImageElement | null>(CRAFT_FRAME_COUNT).fill(null);
    loadedRef.current = new Array<boolean>(CRAFT_FRAME_COUNT).fill(false);

    const draw = (index: number) => {
      // draw the nearest loaded frame at or below the target so scrubbing
      // never blanks while frames stream in
      let i = Math.min(CRAFT_FRAME_COUNT - 1, Math.max(0, index));
      while (i > 0 && !loadedRef.current[i]) i--;
      const img = imagesRef.current[i];
      if (!img || !loadedRef.current[i] || i === lastDrawnRef.current) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      lastDrawnRef.current = i;
    };

    const loadFrame = (i: number) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          loadedRef.current[i] = true;
          imagesRef.current[i] = img;
          // repaint if the user is already waiting on/near this frame
          if (Math.abs(targetRef.current - i) < 4 || lastDrawnRef.current < i) {
            draw(targetRef.current);
          }
          resolve();
        };
        img.onerror = () => resolve();
        img.src = framePath(i);
      });

    let started = false;
    const startLoading = async () => {
      if (started) return;
      started = true;
      await loadFrame(0);
      draw(0);
      // stream the rest with limited concurrency
      const queue = Array.from({ length: CRAFT_FRAME_COUNT - 1 }, (_, k) => k + 1);
      const workers = Array.from({ length: 6 }, async () => {
        while (queue.length) {
          const i = queue.shift();
          if (i === undefined) break;
          await loadFrame(i);
        }
      });
      await Promise.all(workers);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          void startLoading();
          io.disconnect();
        }
      },
      { rootMargin: "120% 0px" },
    );
    io.observe(outer);

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = outer.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        const scrollable = rect.height - vh;
        if (scrollable <= 0) return;
        const p = Math.min(1, Math.max(0, -rect.top / scrollable));
        const frame = Math.round(p * (CRAFT_FRAME_COUNT - 1));
        targetRef.current = frame;
        draw(frame);
        let ci = 0;
        while (ci < CAPTION_ENDS.length - 1 && p >= CAPTION_ENDS[ci]) ci += 1;
        if (ci !== captionIdxRef.current) {
          captionIdxRef.current = ci;
          setCaption(ci);
        }
        const faded = p > 0.955;
        if (faded !== finaleFadeRef.current) {
          finaleFadeRef.current = faded;
          setFinaleFaded(faded);
        }
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      io.disconnect();
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
        <section className="relative h-[80vh] w-full overflow-hidden">
          <img
            src={POSTER}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            width={CRAFT_FRAME_W}
            height={CRAFT_FRAME_H}
            loading="lazy"
          />
          <p className="film-caption" data-on="true" style={CAPTION_POS[CAPTION_POS.length - 1]}>
            {t.craft.captions[t.craft.captions.length - 1]}
          </p>
        </section>
      ) : (
        <section ref={outerRef} className="relative" style={{ height: "600vh" }}>
          <div className="sticky top-0 h-screen w-full overflow-hidden">
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
            <noscript>
              <img src={POSTER} alt="" className="absolute inset-0 h-full w-full object-cover" />
            </noscript>
          </div>
        </section>
      )}
    </>
  );
}
