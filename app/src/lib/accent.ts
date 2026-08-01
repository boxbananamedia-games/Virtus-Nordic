import { useRouterState } from "@tanstack/react-router";

/**
 * One pigment per page.
 *
 * The site's own argument is that Virtus Nordic has a single identity and the
 * products do not, so the chrome holds still — type, paper, layout, the ink
 * wash itself — and only the pigment moves. That is why the accent owns a whole
 * page rather than one decorative stroke: eyebrows, rules, focus rings and the
 * divider all take it together, which reads as identity. A recoloured divider
 * on an otherwise teal page would read as a colour picker.
 *
 * THE HOMEPAGE IS DELIBERATELY UNCHANGED. Teal is the brand anchor and the most
 * seen page on the site; it renders the original scan with no filter at all, so
 * it is byte-for-byte what it always was.
 */

/** Sampled from the scan itself — the wash's own paper is rgb(251, 246, 235). */
const PAPER = "#fbf6eb";

export type AccentId = "teal" | "sienna" | "indigo" | "mulberry" | "moss";

export type Accent = {
  id: AccentId;
  /**
   * The wash remapped as a four-stop ramp: deepest pigment, full pigment,
   * dilute tint, paper. Four stops rather than two because a straight
   * dark-to-paper duotone loses all chroma through the midtones — and the
   * midtones are the wash. 90% of the scan sits above luminance 0.9 and its
   * character lives in the 0.6–0.9 band, so that band is where the ramp has to
   * hold its colour.
   *
   * `ramp[1]` is the page's UI colour as well as the wash's core. Every one of
   * them clears 4.9:1 against cream, so they carry small text and focus rings.
   */
  ramp: [string, string, string, string];
};

export const ACCENTS: Record<AccentId, Accent> = {
  teal: { id: "teal", ramp: ["#0a2a27", "#1b6b6b", "#8ebbb2", PAPER] },
  sienna: { id: "sienna", ramp: ["#2d1608", "#8f5230", "#d3ac89", PAPER] },
  indigo: { id: "indigo", ramp: ["#0c1a2a", "#2e4a6b", "#9fb0c6", PAPER] },
  mulberry: { id: "mulberry", ramp: ["#230e1c", "#6b3a56", "#c6a1b6", PAPER] },
  moss: { id: "moss", ramp: ["#15200c", "#4e6b3a", "#b0c095", PAPER] },
};

const BY_PATH: Record<string, AccentId> = {
  "/": "teal",
  "/om": "sienna",
  "/ydelser": "indigo",
  "/applikationer": "mulberry",
  "/kontakt": "moss",
};

export function accentForPath(pathname: string): Accent {
  // Tolerate a trailing slash so /om/ and /om are the same page's pigment.
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return ACCENTS[BY_PATH[path] ?? "teal"];
}

/** The pigment for the page currently on screen. Derived from the route rather
 *  than held in state, so it is correct in the server render — an effect would
 *  repaint the page's colour a beat after it first appeared. */
export function useAccent(): Accent {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return accentForPath(pathname);
}

/** Attribute plus custom property, applied together wherever a page's pigment
 *  takes effect. The property is what the CSS reads; the attribute exists so
 *  the pigment is legible in the DOM. */
export function accentProps(accent: Accent) {
  return {
    "data-accent": accent.id,
    style: { "--vn-accent": accent.ramp[1] } as React.CSSProperties,
  };
}

/**
 * Shape variation, so no two strokes on a page are the same gesture twice.
 *
 * The wash is a single raster, so the variation is applied rather than drawn: a
 * seeded turbulence displaces it, and the radial mask that already shapes its
 * silhouette is varied alongside. Same hand, different stroke — which is the
 * point. Five separate drawings would read as decoration.
 */
export type InkVariant = {
  /** feTurbulence seed and frequency — the shape of the distortion. */
  seed: number;
  frequency: string;
  /** Displacement in CSS pixels of the rendered box. Kept small: past roughly
   *  20 the wash smears instead of flexing. */
  scale: number;
  /** Silhouette. Varying the mask changes the stroke's extent far more visibly
   *  than the displacement does, and costs nothing. */
  mask: string;
  transform: string;
};

export const INK_VARIANTS: InkVariant[] = [
  {
    seed: 3,
    frequency: "0.008 0.014",
    scale: 9,
    mask: "radial-gradient(ellipse 48% 46% at 50% 50%, black 40%, transparent 74%)",
    transform: "none",
  },
  {
    seed: 11,
    frequency: "0.006 0.018",
    scale: 13,
    mask: "radial-gradient(ellipse 44% 50% at 42% 50%, black 34%, transparent 78%)",
    transform: "scaleX(-1)",
  },
  {
    seed: 19,
    frequency: "0.011 0.010",
    scale: 7,
    mask: "radial-gradient(ellipse 52% 42% at 58% 50%, black 44%, transparent 70%)",
    transform: "scaleY(1.08)",
  },
  {
    seed: 27,
    frequency: "0.005 0.021",
    scale: 15,
    mask: "radial-gradient(ellipse 40% 48% at 47% 50%, black 30%, transparent 80%)",
    transform: "scaleX(-1) scaleY(0.92)",
  },
];

/** Filter id for a given pigment and stroke. `flat` is the tint with no
 *  displacement, for the vertical flank whose own mask does the shaping. */
export const inkFilterId = (accent: AccentId, variant: number | "flat") =>
  `vn-ink-${accent}-${variant}`;
