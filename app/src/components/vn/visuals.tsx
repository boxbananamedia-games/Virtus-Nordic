import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

/* ------------------------------------------------------------------ */
/* Vertical ribbon wave — the four-tone brand motif flanking content   */
/* ------------------------------------------------------------------ */

const WAVE_STROKES = [
  { d: "M50 0 C18 75 82 155 50 230 C18 305 82 380 50 460 C18 520 80 545 50 560", c: "#1B6B6B", w: 9, o: 0.42 },
  { d: "M50 0 C12 90 95 170 48 248 C10 325 95 405 48 485 C14 548 88 555 50 560", c: "#3D8E8A", w: 5.5, o: 0.52 },
  { d: "M52 12 C36 95 72 168 58 245 C42 322 74 398 60 475 C44 542 76 550 50 560", c: "#6AB0A8", w: 3, o: 0.38 },
  { d: "M44 8 C68 88 28 172 62 250 C88 328 32 408 68 486 C90 552 38 554 50 560", c: "#C4AD90", w: 1.8, o: 0.42 },
];

export function RibbonWave({
  side,
  className = "",
  draw = false,
}: {
  side: "left" | "right";
  className?: string;
  draw?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 100 560"
      fill="none"
      aria-hidden="true"
      className={`wave-drift ${className}`}
      style={side === "right" ? { transform: "scaleX(-1)" } : undefined}
    >
      {WAVE_STROKES.map((s, i) => (
        <path
          key={i}
          d={s.d}
          stroke={s.c}
          strokeWidth={s.w}
          strokeLinecap="round"
          opacity={s.o}
          pathLength={1}
          className={draw ? "wave-draw" : undefined}
          style={draw ? ({ "--d": `${0.9 + i * 0.18}s` } as CSSProperties) : undefined}
        />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Horizontal wave divider between sections                            */
/* ------------------------------------------------------------------ */

const DIVIDER_STROKES = [
  { d: "M0 30 C150 8 300 52 450 30 C600 8 750 52 900 30 C1050 8 1150 44 1240 30", c: "#1B6B6B", w: 3.5, o: 0.35 },
  { d: "M0 34 C160 14 320 50 480 32 C640 14 800 50 960 32 C1090 18 1170 44 1240 34", c: "#3D8E8A", w: 2.2, o: 0.45 },
  { d: "M0 26 C140 46 310 12 470 28 C630 46 790 12 950 28 C1080 40 1160 20 1240 26", c: "#6AB0A8", w: 1.4, o: 0.35 },
  { d: "M0 32 C170 20 330 42 500 30 C670 20 830 42 1000 30 C1110 24 1180 38 1240 32", c: "#C4AD90", w: 1, o: 0.4 },
];

export function WaveDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`overflow-hidden py-6 ${className}`} aria-hidden="true">
      <svg viewBox="0 0 1240 60" fill="none" className="divider-drift mx-auto w-[110%] max-w-none -translate-x-[5%]">
        {DIVIDER_STROKES.map((s, i) => (
          <path key={i} d={s.d} stroke={s.c} strokeWidth={s.w} strokeLinecap="round" opacity={s.o} />
        ))}
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small root sprig — service cards / ornaments (draws on reveal)      */
/* ------------------------------------------------------------------ */

export function RootSprig({ className = "" }: { className?: string }) {
  const strokes = [
    { d: "M24 46 C24 34 22 26 24 14 C25 8 26 6 24 2", c: "#1B6B6B", w: 2 },
    { d: "M24 34 C18 30 12 28 6 20", c: "#3D8E8A", w: 1.6 },
    { d: "M24 28 C30 24 36 22 42 14", c: "#6AB0A8", w: 1.6 },
    { d: "M24 20 C20 16 17 12 16 6", c: "#C4AD90", w: 1.2 },
  ];
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={className}>
      {strokes.map((s, i) => (
        <path
          key={i}
          d={s.d}
          stroke={s.c}
          strokeWidth={s.w}
          strokeLinecap="round"
          pathLength={1}
          className="draw-path"
          style={{ "--d": `${0.15 + i * 0.14}s` } as CSSProperties}
        />
      ))}
    </svg>
  );
}

/* Larger root cluster used as ornament (contact page) */
export function RootCluster({ className = "" }: { className?: string }) {
  const strokes = [
    { d: "M100 150 C98 118 104 92 100 62 C98 46 102 34 100 18", c: "#1C2835", w: 2.4 },
    { d: "M100 120 C82 108 64 102 48 82 C40 72 38 62 32 52", c: "#1B6B6B", w: 2 },
    { d: "M100 118 C118 104 136 100 152 80 C160 70 162 60 168 50", c: "#3D8E8A", w: 2 },
    { d: "M100 90 C88 78 78 72 72 56", c: "#6AB0A8", w: 1.6 },
    { d: "M100 88 C112 76 122 70 128 54", c: "#6AB0A8", w: 1.6 },
    { d: "M100 60 C94 50 90 42 90 30", c: "#C4AD90", w: 1.3 },
    { d: "M100 58 C106 48 110 40 110 28", c: "#C4AD90", w: 1.3 },
  ];
  return (
    <svg viewBox="0 0 200 160" fill="none" aria-hidden="true" className={className}>
      {strokes.map((s, i) => (
        <path
          key={i}
          d={s.d}
          stroke={s.c}
          strokeWidth={s.w}
          strokeLinecap="round"
          pathLength={1}
          className="draw-path"
          style={{ "--d": `${0.1 + i * 0.12}s` } as CSSProperties}
        />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Reveal — IntersectionObserver scroll reveal wrapper                 */
/* ------------------------------------------------------------------ */

export function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "article" | "blockquote" | "li" | "figure";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      // @ts-expect-error — polymorphic ref is fine at runtime
      ref={ref}
      className={`reveal ${inView ? "in" : ""} ${className}`}
      style={{ "--d": `${delay}s` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/* GrowthIntro — the one continuous "grown, not loaded" sequence       */
/* ------------------------------------------------------------------ */

const INTRO_ROOTS: { d: string; c: string; w: number; delay: number; o?: number }[] = [
  // main trunks rising from the bottom centre
  { d: "M400 620 C392 540 410 470 398 400 C390 352 404 300 400 250", c: "#1C2835", w: 2.6, delay: 0 },
  { d: "M330 620 C338 545 320 480 342 410 C356 364 368 320 384 268", c: "#1B6B6B", w: 2.2, delay: 0.12 },
  { d: "M470 620 C462 545 480 480 458 410 C444 364 432 320 416 268", c: "#1B6B6B", w: 2.2, delay: 0.18 },
  // secondary trunks
  { d: "M255 620 C270 540 250 480 285 415 C310 368 336 330 366 285", c: "#3D8E8A", w: 1.8, delay: 0.28 },
  { d: "M545 620 C530 540 550 480 515 415 C490 368 464 330 434 285", c: "#3D8E8A", w: 1.8, delay: 0.34 },
  // branches
  { d: "M342 470 C312 440 290 424 268 388", c: "#6AB0A8", w: 1.4, delay: 0.55 },
  { d: "M458 470 C488 440 510 424 532 388", c: "#6AB0A8", w: 1.4, delay: 0.6 },
  { d: "M398 430 C372 402 356 382 348 350", c: "#6AB0A8", w: 1.3, delay: 0.66 },
  { d: "M398 428 C424 400 442 380 452 348", c: "#6AB0A8", w: 1.3, delay: 0.72 },
  // fine tips reaching toward the mark
  { d: "M285 415 C300 380 322 350 352 316", c: "#C4AD90", w: 1.1, delay: 0.85 },
  { d: "M515 415 C500 380 478 350 448 316", c: "#C4AD90", w: 1.1, delay: 0.9 },
  { d: "M366 285 C376 268 386 256 396 246", c: "#C4AD90", w: 1, delay: 1.0 },
  { d: "M434 285 C424 268 414 256 404 246", c: "#C4AD90", w: 1, delay: 1.05 },
];

const INTRO_NODES: { cx: number; cy: number; r: number; c: string; delay: number }[] = [
  { cx: 268, cy: 388, r: 3, c: "#3D8E8A", delay: 1.15 },
  { cx: 532, cy: 388, r: 3, c: "#3D8E8A", delay: 1.2 },
  { cx: 348, cy: 350, r: 2.4, c: "#6AB0A8", delay: 1.25 },
  { cx: 452, cy: 348, r: 2.4, c: "#6AB0A8", delay: 1.3 },
  { cx: 400, cy: 244, r: 3.4, c: "#1B6B6B", delay: 1.35 },
];

export type IntroStage = "roots" | "bloom" | "done";

const SEEN_KEY = "vn-intro-seen";

export function useGrowthIntro(): { stage: IntroStage; skipped: boolean } {
  const [stage, setStage] = useState<IntroStage>("roots");
  const [skipped, setSkipped] = useState(false);

  useEffect(() => {
    let seen = false;
    let reduced = false;
    try {
      seen = window.sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      /* ignore */
    }
    try {
      reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      /* ignore */
    }

    if (seen || reduced) {
      setSkipped(true);
      setStage("done");
      return;
    }

    document.body.style.overflow = "hidden";

    const finish = () => {
      setStage("done");
      document.body.style.overflow = "";
      try {
        window.sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* ignore */
      }
    };

    const bloomTimer = window.setTimeout(() => setStage("bloom"), 2350);
    const doneTimer = window.setTimeout(finish, 3150);

    const skip = () => {
      window.clearTimeout(bloomTimer);
      window.clearTimeout(doneTimer);
      finish();
    };
    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);
    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("touchmove", skip, { passive: true });

    return () => {
      window.clearTimeout(bloomTimer);
      window.clearTimeout(doneTimer);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchmove", skip);
      document.body.style.overflow = "";
    };
  }, []);

  return { stage, skipped };
}

export function GrowthIntro({ stage }: { stage: IntroStage }) {
  if (stage === "done") return null;
  return (
    <div className={`intro-overlay ${stage === "bloom" ? "leaving" : ""}`} aria-hidden="true">
      <svg className="intro-roots" viewBox="0 0 800 620" fill="none" preserveAspectRatio="xMidYMax meet">
        {INTRO_ROOTS.map((r, i) => (
          <path
            key={i}
            d={r.d}
            stroke={r.c}
            strokeWidth={r.w}
            strokeLinecap="round"
            opacity={r.o ?? 0.8}
            pathLength={1}
            className="root-line"
            style={{ "--d": `${r.delay}s` } as CSSProperties}
          />
        ))}
        {INTRO_NODES.map((n, i) => (
          <circle
            key={`n${i}`}
            cx={n.cx}
            cy={n.cy}
            r={n.r}
            fill={n.c}
            opacity={0.75}
            className="root-node"
            style={{ "--d": `${n.delay}s` } as CSSProperties}
          />
        ))}
      </svg>
      <div className="intro-mark">
        <span className="intro-vn">VN</span>
        <span className="intro-word">Virtus Nordic</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* useSectionProgress — 0..1 scroll progress through a section          */
/* ------------------------------------------------------------------ */

export function useSectionProgress<T extends HTMLElement>(): [
  React.RefObject<T | null>,
  number,
] {
  const ref = useRef<T | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const total = rect.height + vh * 0.25;
      const passed = Math.min(Math.max(vh * 0.88 - rect.top, 0), total);
      setProgress(Math.min(1, Math.max(0, passed / total)));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return [ref, progress];
}
