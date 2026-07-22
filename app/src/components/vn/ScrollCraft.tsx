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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const loadedRef = useRef<boolean[]>([]);
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
        <div className="mx-auto max-w-2xl px-5 pb-24 pt-2 text-center">
          <p className="font-display text-2xl font-semibold italic leading-snug text-navy/85 md:text-3xl">
            {t.craft.captions[t.craft.captions.length - 1]}
          </p>
        </div>
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
