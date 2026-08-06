import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { INK_VARIANTS, inkFilterId, useAccent } from "../../lib/accent";

/** True when the visitor has asked the OS for less animation. Safe on the
 *  server, where there is no matchMedia to ask. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* ------------------------------------------------------------------ */
/* Ink art — Nordic ink-wash pieces generated for the brand            */
/* ------------------------------------------------------------------ */

/**
 * The wash, remapped to the page's pigment.
 *
 * One 27KB scan of real watercolour serves every stroke on the site. Recolouring
 * it with `hue-rotate` was the obvious move and the wrong one: it skews
 * luminance, drags the warm tail somewhere muddy, and looks like a filter. This
 * reads the scan's density off its luminance instead and maps that density onto
 * a four-stop pigment ramp, which is what dilution actually does — so the paper
 * grain and the granulation of the wash survive intact, in a different colour.
 *
 * `feComponentTransfer` with a four-entry table gives piecewise-linear
 * interpolation across those stops for free.
 *
 * Rendered once per page, for the current pigment only. Teal renders nothing at
 * all: the homepage shows the original scan untouched.
 */
export function InkFilters() {
  const accent = useAccent();
  if (accent.id === "teal") return null;

  const ramp = accent.ramp;
  const table = (channel: 0 | 1 | 2) =>
    ramp
      .map((hex) => (parseInt(hex.slice(1 + channel * 2, 3 + channel * 2), 16) / 255).toFixed(4))
      .join(" ");

  // Density -> pigment. Shared by every stroke on the page.
  const tint = (
    <>
      <feColorMatrix
        type="matrix"
        values="0.2126 0.7152 0.0722 0 0
                0.2126 0.7152 0.0722 0 0
                0.2126 0.7152 0.0722 0 0
                0      0      0      1 0"
      />
      <feComponentTransfer>
        <feFuncR type="table" tableValues={table(0)} />
        <feFuncG type="table" tableValues={table(1)} />
        <feFuncB type="table" tableValues={table(2)} />
      </feComponentTransfer>
    </>
  );

  return (
    // Not display:none — a hidden subtree stops some browsers resolving filter
    // references out of it.
    <svg
      aria-hidden="true"
      focusable="false"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        {INK_VARIANTS.map((v, i) => (
          // sRGB is not optional: filters default to linearRGB, where this ramp
          // lands several shades off.
          <filter
            key={i}
            id={inkFilterId(accent.id, i)}
            colorInterpolationFilters="sRGB"
            x="-12%"
            y="-30%"
            width="124%"
            height="160%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency={v.frequency}
              numOctaves={2}
              seed={v.seed}
              result="noise"
            />
            {/* Displacing before tinting keeps the edges honest: pixels dragged
                in from outside the source are transparent, and the colour
                matrix leaves alpha alone, so they stay invisible. */}
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={v.scale}
              xChannelSelector="R"
              yChannelSelector="G"
            />
            {tint}
          </filter>
        ))}
        <filter id={inkFilterId(accent.id, "flat")} colorInterpolationFilters="sRGB">
          {tint}
        </filter>
      </defs>
    </svg>
  );
}

export function InkFlank({ side, className = "" }: { side: "left" | "right"; className?: string }) {
  const accent = useAccent();
  return (
    <img
      src="/art/ink-vertical.webp"
      alt=""
      aria-hidden="true"
      loading="lazy"
      className={`ink-art ink-flank ${className}`}
      style={{
        ...(side === "right" ? { transform: "scaleX(-1)" } : null),
        ...(accent.id === "teal" ? null : { filter: `url(#${inkFilterId(accent.id, "flat")})` }),
      }}
    />
  );
}

/**
 * A stroke. `variant` picks one of four gestures — pass the loop index where
 * several appear on a page so no two are identical.
 */
export function InkDivider({
  className = "",
  variant = 0,
}: {
  className?: string;
  variant?: number;
}) {
  const accent = useAccent();
  const v =
    INK_VARIANTS[((variant % INK_VARIANTS.length) + INK_VARIANTS.length) % INK_VARIANTS.length];

  // The homepage keeps the original: no filter, no warp, no mask change.
  const styled =
    accent.id === "teal"
      ? undefined
      : ({
          "--ink-filter": `url(#${inkFilterId(accent.id, INK_VARIANTS.indexOf(v))})`,
          "--ink-mask": v.mask,
          "--ink-transform": v.transform,
        } as CSSProperties);

  return (
    <div className={`ink-divider ${className}`} aria-hidden="true">
      <img
        src="/art/ink-horizontal.webp"
        alt=""
        loading="lazy"
        className="ink-art"
        style={styled}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Service icons — line style in the four brand tones, draw on reveal  */
/* ------------------------------------------------------------------ */

function IconBase({
  strokes,
  className,
}: {
  strokes: { d: string; c: string; w: number }[];
  className?: string;
}) {
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
        {
          d: "M14 19 h20 a3 3 0 0 1 3 3 v12 a4 4 0 0 1 -4 4 H15 a4 4 0 0 1 -4 -4 V22 a3 3 0 0 1 3 -3 z",
          c: "#1B6B6B",
          w: 2,
        },
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

export function useSectionProgress<T extends HTMLElement>(): [React.RefObject<T | null>, number] {
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
