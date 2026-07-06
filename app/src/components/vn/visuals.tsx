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
/* WaveMark — compact ribbon-wave ornament (cards / accents)           */
/* ------------------------------------------------------------------ */

export function WaveMark({ className = "" }: { className?: string }) {
  const strokes = [
    { d: "M2 30 C10 18 20 34 28 22 C34 14 40 26 46 18", c: "#1B6B6B", w: 2.4 },
    { d: "M2 34 C11 24 21 38 30 27 C36 20 41 30 46 24", c: "#3D8E8A", w: 1.7 },
    { d: "M2 26 C9 36 19 20 27 32 C33 40 40 28 46 34", c: "#6AB0A8", w: 1.3 },
    { d: "M2 31 C12 27 22 33 32 28 C38 25 42 30 46 28", c: "#C4AD90", w: 1 },
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
