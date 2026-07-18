import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

/* ------------------------------------------------------------------ */
/* Ink art — Nordic ink-wash pieces generated for the brand            */
/* ------------------------------------------------------------------ */

export function InkFlank({
  side,
  className = "",
}: {
  side: "left" | "right";
  className?: string;
}) {
  return (
    <img
      src="/art/ink-vertical.webp"
      alt=""
      aria-hidden="true"
      loading="lazy"
      className={`ink-art ink-flank ${className}`}
      style={side === "right" ? { transform: "scaleX(-1)" } : undefined}
    />
  );
}

export function InkDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`ink-divider ${className}`} aria-hidden="true">
      <img src="/art/ink-horizontal.webp" alt="" loading="lazy" className="ink-art" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Service icons — line style in the four brand tones, draw on reveal  */
/* ------------------------------------------------------------------ */

function IconBase({ strokes, className }: { strokes: { d: string; c: string; w: number }[]; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={className}>
      {strokes.map((s, i) => (
        <path
          key={i}
          d={s.d}
          stroke={s.c}
          strokeWidth={s.w}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          className="draw-path"
          style={{ "--d": `${0.15 + i * 0.14}s` } as CSSProperties}
        />
      ))}
    </svg>
  );
}

/* Custom code — angle brackets and slash */
export function IconApp({ className = "" }: { className?: string }) {
  return (
    <IconBase
      className={className}
      strokes={[
        { d: "M16 13 L7 24 L16 35", c: "#1B6B6B", w: 2.2 },
        { d: "M32 13 L41 24 L32 35", c: "#3D8E8A", w: 2.2 },
        { d: "M27 10 L21 38", c: "#C4AD90", w: 1.6 },
      ]}
    />
  );
}

/* System integration — two interlocking links */
export function IconIntegration({ className = "" }: { className?: string }) {
  return (
    <IconBase
      className={className}
      strokes={[
        { d: "M22 18 h-7 a7 7 0 0 0 0 14 h7", c: "#1B6B6B", w: 2.2 },
        { d: "M26 32 h7 a7 7 0 0 0 0 -14 h-7", c: "#3D8E8A", w: 2.2 },
        { d: "M18 25 H30", c: "#C4AD90", w: 1.8 },
      ]}
    />
  );
}

/* Agentic automations — a calm robot */
export function IconAgent({ className = "" }: { className?: string }) {
  return (
    <IconBase
      className={className}
      strokes={[
        { d: "M14 19 h20 a3 3 0 0 1 3 3 v12 a4 4 0 0 1 -4 4 H15 a4 4 0 0 1 -4 -4 V22 a3 3 0 0 1 3 -3 z", c: "#1B6B6B", w: 2 },
        { d: "M24 19 V11", c: "#3D8E8A", w: 1.8 },
        { d: "M24 9 a2 2 0 1 0 0.01 0", c: "#3D8E8A", w: 1.6 },
        { d: "M19 27 v4 M29 27 v4", c: "#C4AD90", w: 2.2 },
      ]}
    />
  );
}

/* Growth & optimisation — rising line with arrow */
export function IconGrowth({ className = "" }: { className?: string }) {
  return (
    <IconBase
      className={className}
      strokes={[
        { d: "M8 40 H40", c: "#C4AD90", w: 1.4 },
        { d: "M10 33 L20 23 L26 28 L38 13", c: "#1B6B6B", w: 2.2 },
        { d: "M30 13 H38 V21", c: "#3D8E8A", w: 1.8 },
      ]}
    />
  );
}

export const SERVICE_ICONS = [IconApp, IconIntegration, IconAgent, IconGrowth];

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
